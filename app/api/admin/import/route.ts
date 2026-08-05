import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { isAuthed } from '@/lib/admin/auth';
import { writeData, logAction, type StoredProduct } from '@/lib/admin/store';
import { productBySku } from '@/lib/products';
import { categories } from '@/lib/categories';
import { allProducts } from '@/lib/catalog';
import { slugify } from '@/lib/translit';
import type { SalesChannel, StockStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Импорт каталога из Excel (Том 7, п. 7.3). Полный фид из PFS APP/прайса:
 * существующие артикулы обновляются, НОВЫЕ создаются как товары сайта.
 * Так весь каталог из Excel подтягивается целиком, а не частично.
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

/** Категория по названию из Excel; если не найдена — «Аксессуары» как запас. */
function matchCategory(v: unknown): string {
  const s = String(v ?? '').toLowerCase().trim();
  const byName = categories.find((c) => c.name.toLowerCase() === s || c.slug === s);
  if (byName) return byName.slug;
  const byIncl = categories.find((c) => s && c.name.toLowerCase().includes(s.split(' ')[0]));
  return byIncl?.slug ?? 'aksessuary';
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
    rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  } catch {
    return NextResponse.redirect(new URL('/admin/products?imp=badfile', request.url), { status: 303 });
  }

  // существующие slug'и, чтобы не создавать дубли адресов
  const usedSlugs = new Set(allProducts().map((p) => p.slug));
  let updated = 0;
  let created = 0;

  writeData((d) => {
    for (const row of rows) {
      const sku = String(row['Артикул'] ?? row['sku'] ?? '').trim();
      if (!sku) continue;

      const price = num(row['Цена, ₸'] ?? row['Цена'] ?? row['price']);
      const stock = parseStock(row['Наличие'] ?? row['stock']);
      const days = num(row['Срок изготовления, дн.'] ?? row['Срок'] ?? row['production_days']);
      const channel = parseChannel(row['Канал'] ?? row['channel']);
      const name = String(row['Название'] ?? row['name'] ?? '').trim() || undefined;
      const kaspi = String(row['Ссылка Kaspi'] ?? row['kaspiUrl'] ?? '').trim() || undefined;

      if (productBySku(sku) || d.importedProducts[sku]) {
        // обновляем существующий (сид — через оверлей, импортный — напрямую)
        if (d.importedProducts[sku]) {
          const sp = d.importedProducts[sku];
          if (name) sp.name = name;
          if (price !== undefined) sp.priceRetail = price;
          if (stock) sp.stockStatus = stock;
          if (days !== undefined) sp.productionDays = days;
          if (channel) sp.salesChannel = channel;
          if (kaspi) sp.kaspiUrl = kaspi;
        } else {
          const cur = d.productOverlays[sku] ?? {};
          d.productOverlays[sku] = {
            ...cur,
            ...(name ? { name } : {}),
            ...(price !== undefined ? { priceRetail: price } : {}),
            ...(stock ? { stockStatus: stock } : {}),
            ...(days !== undefined ? { productionDays: days } : {}),
            ...(channel ? { salesChannel: channel } : {}),
            ...(kaspi ? { kaspiUrl: kaspi } : {}),
          };
        }
        updated++;
      } else {
        // создаём новый товар из строки Excel
        let slug = slugify(name ?? sku);
        while (usedSlugs.has(slug)) slug = `${slug}-${slugify(sku)}`;
        usedSlugs.add(slug);
        const sp: StoredProduct = {
          sku,
          slug,
          name: name ?? sku,
          categorySlug: matchCategory(row['Категория'] ?? row['category']),
          priceRetail: price ?? null,
          stockStatus: stock ?? 'on_request',
          productionDays: days,
          salesChannel: channel ?? 'request',
          kaspiUrl: kaspi,
          made: true,
          keyParams: [],
          description: `${name ?? sku} — производство PFS.`,
          attributes: {},
          updatedAt: new Date().toISOString(),
        };
        d.importedProducts[sku] = sp;
        created++;
      }
    }
  });

  logAction('Контент-менеджер', `Импорт Excel: обновлено ${updated}, создано ${created}`);
  revalidatePath('/', 'layout');

  return NextResponse.redirect(new URL(`/admin/products?imp=ok&u=${updated}&c=${created}`, request.url), { status: 303 });
}
