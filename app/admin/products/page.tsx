import Link from 'next/link';
import { requireAuth } from '@/lib/admin/auth';
import { products } from '@/lib/products';
import { getCategory } from '@/lib/categories';
import { readData } from '@/lib/admin/store';
import { priceLabel, stockBadge } from '@/lib/format';
import { bulkSetChannel } from '@/lib/admin/actions';
import { PageHead, Panel, Badge } from '@/components/admin/ui';

const channelLabel: Record<string, string> = { kaspi: 'Kaspi', request: 'Заявка', both: 'Оба' };

/** Раздел «Товары»: цены/остатки — только чтение (Том 7, п. 7.3). */
export default function AdminProducts({ searchParams }: { searchParams: { saved?: string; bulk?: string } }) {
  requireAuth();
  const overlays = readData().productOverlays;

  return (
    <>
      <PageHead
        title="Товары"
        sub="Номенклатура, цены и остатки управляются в PFS APP и здесь только для чтения. Редактируются: фото, описание, SEO, канал продажи, связи."
      />

      {searchParams.saved && (
        <div className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
          Сохранено: {searchParams.saved}
        </div>
      )}
      {searchParams.bulk && (
        <div className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
          Канал изменён для {searchParams.bulk} товаров
        </div>
      )}

      {/* Массовые операции (Том 7, п. 7.3) */}
      <form action={bulkSetChannel}>
        <Panel className="mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-steel-300">Массовая смена канала для отмеченных:</span>
            <select name="channel" className="rounded-md border border-ink-600 bg-ink-800 px-3 py-1.5 text-sm">
              <option value="kaspi">Kaspi</option>
              <option value="request">Заявка</option>
              <option value="both">Оба</option>
            </select>
            <button className="btn-secondary py-1.5 text-sm">Применить к отмеченным</button>
            <span className="text-xs text-steel-500">
              Массовая загрузка фото по артикулам и экспорт в PDF-каталог — здесь же (Том 7, п. 7.3).
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-ink-800 text-left text-xs text-steel-400">
                  <th className="py-2 pr-2"></th>
                  <th className="py-2 pr-3">Товар</th>
                  <th className="py-2 pr-3">Артикул</th>
                  <th className="py-2 pr-3">Цена 🔒</th>
                  <th className="py-2 pr-3">Наличие 🔒</th>
                  <th className="py-2 pr-3">Канал</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const ov = overlays[p.sku];
                  const channel = ov?.salesChannel ?? p.salesChannel;
                  return (
                    <tr key={p.sku} className="border-b border-ink-800/60">
                      <td className="py-2 pr-2">
                        <input type="checkbox" name="sku" value={p.sku} className="h-4 w-4 accent-accent" />
                      </td>
                      <td className="py-2 pr-3">
                        <Link href={`/admin/products/${p.sku}`} className="text-steel-100 hover:text-accent-400">
                          {p.name}
                        </Link>
                        <div className="text-xs text-steel-500">{getCategory(p.categorySlug)?.name}</div>
                      </td>
                      <td className="py-2 pr-3 text-steel-400">{p.sku}</td>
                      {/* read-only из PFS APP */}
                      <td className="py-2 pr-3 text-steel-300">{priceLabel(p)}</td>
                      <td className="py-2 pr-3 text-steel-300">{stockBadge(p)}</td>
                      <td className="py-2 pr-3">
                        <Badge tone={channel === 'kaspi' ? 'muted' : channel === 'both' ? 'warn' : 'bad'}>
                          {channelLabel[channel]}
                        </Badge>
                        {ov && <span className="ml-1 text-[10px] text-steel-500">изм.</span>}
                      </td>
                      <td className="py-2 pr-3">
                        <Link href={`/admin/products/${p.sku}`} className="text-accent-400 hover:underline">
                          Редактировать
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </form>
    </>
  );
}
