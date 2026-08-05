import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { isAuthed } from '@/lib/admin/auth';
import { allProducts } from '@/lib/catalog';
import { getCategory } from '@/lib/categories';
import { stockBadge } from '@/lib/format';

/**
 * Экспорт каталога/прайса в Excel (Том 7, п. 7.3: массовые операции; Том 1:
 * прайс в Excel для дилеров). Скачивается .xlsx со всеми позициями.
 */
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const rows = allProducts().map((p) => ({
    Артикул: p.sku,
    Название: p.name,
    Категория: getCategory(p.categorySlug)?.name ?? p.categorySlug,
    'Цена, ₸': p.priceRetail ?? '',
    'Цена от': p.priceFrom ? 'да' : '',
    Наличие: stockBadge(p),
    'Срок изготовления, дн.': p.productionDays ?? '',
    Канал: p.salesChannel,
    'Ссылка Kaspi': p.kaspiUrl ?? '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 14 }, { wch: 34 }, { wch: 22 }, { wch: 12 }, { wch: 8 }, { wch: 22 }, { wch: 18 }, { wch: 10 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Прайс');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  const body = new Uint8Array(buf);

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="profik-price-${date}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
