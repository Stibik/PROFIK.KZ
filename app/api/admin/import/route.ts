import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { isAuthed } from '@/lib/admin/auth';
import { writeData, logAction } from '@/lib/admin/store';
import { productBySku } from '@/lib/products';
import type { SalesChannel, StockStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Импорт каталога из Excel (Том 7, п. 7.3). Эмулирует фид из PFS APP:
 * по артикулу обновляет цену, остаток, срок, название, канал в локальной
 * копии сайта. Строки без совпавшего артикула пропускаются.
 */
function parseStock(v: unknown): StockStatus | undefined {
  const s = String(v ?? '').toLowerCase();
  if (!s) return undefined;
  if (s.includes('снят')) return 'discontinued';
  if (s.includes('налич')) return 'in_stock';
  if (s.includes('изготов') || s.includes('заказ')) return 'made_to_order';
  if (s.includes('уточн')) return 'on_request';
  return undefined;
}

function parseChannel(v: unknown): SalesChannel | undefined {
  const s = String(v ?? '').toLowerCase().trim();
  if (s === 'kaspi' || s === 'каспи') return 'kaspi';
  if (s === 'request' || s === 'заявка') return 'request';
  if (s === 'both' || s === 'оба') return 'both';
  return undefined;
}

function num(v: unknown): number | undefined {
  if (v === '' || v == null) return undefined;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? undefined : n;
}

export async function POST(request: Request) {
  if (!isAuthed()) return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 });

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.redirect(new URL('/admin/products?imp=nofile', request.url), { status: 303 });
  }

  let rows: Record<string, unknown>[];
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buf, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws);
  } catch {
    return NextResponse.redirect(new URL('/admin/products?imp=badfile', request.url), { status: 303 });
  }

  let updated = 0;
  let skipped = 0;
  writeData((d) => {
    for (const row of rows) {
      const sku = String(row['Артикул'] ?? row['sku'] ?? '').trim();
      if (!sku || !productBySku(sku)) {
        skipped++;
        continue;
      }
      const cur = d.productOverlays[sku] ?? {};
      const price = num(row['Цена, ₸'] ?? row['Цена'] ?? row['price']);
      const stock = parseStock(row['Наличие'] ?? row['stock']);
      const days = num(row['Срок изготовления, дн.'] ?? row['Срок'] ?? row['production_days']);
      const channel = parseChannel(row['Канал'] ?? row['channel']);
      const name = String(row['Название'] ?? row['name'] ?? '').trim() || undefined;
      const kaspi = String(row['Ссылка Kaspi'] ?? row['kaspiUrl'] ?? '').trim() || undefined;

      d.productOverlays[sku] = {
        ...cur,
        ...(name ? { name } : {}),
        ...(price !== undefined ? { priceRetail: price } : {}),
        ...(stock ? { stockStatus: stock } : {}),
        ...(days !== undefined ? { productionDays: days } : {}),
        ...(channel ? { salesChannel: channel } : {}),
        ...(kaspi ? { kaspiUrl: kaspi } : {}),
      };
      updated++;
    }
  });

  logAction('Контент-менеджер', `Импорт Excel: обновлено ${updated}, пропущено ${skipped}`);
  // применяем на живой сайт
  revalidatePath('/', 'layout');

  return NextResponse.redirect(new URL(`/admin/products?imp=ok&u=${updated}&s=${skipped}`, request.url), { status: 303 });
}
