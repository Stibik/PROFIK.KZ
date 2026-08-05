import Link from 'next/link';
import { requireAuth } from '@/lib/admin/auth';
import { categories } from '@/lib/categories';
import { productsByCategory } from '@/lib/products';
import { PageHead, Panel, Badge } from '@/components/admin/ui';

export default function AdminCategories({ searchParams }: { searchParams: { saved?: string } }) {
  requireAuth();
  return (
    <>
      <PageHead title="Категории" sub="Структура каталога из PFS APP. На сайте настраиваются баннер, тексты, порядок и SEO." />
      {searchParams.saved && (
        <div className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
          Сохранено: {searchParams.saved}
        </div>
      )}
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink-800 text-left text-xs text-steel-400">
                <th className="py-2 pr-3">Категория</th>
                <th className="py-2 pr-3">Товаров</th>
                <th className="py-2 pr-3">Канал по умолч.</th>
                <th className="py-2 pr-3">Под заказ</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.slug} className="border-b border-ink-800/60">
                  <td className="py-2 pr-3 text-steel-100">{c.emoji} {c.name}</td>
                  <td className="py-2 pr-3 text-steel-400">{productsByCategory(c.slug).length}</td>
                  <td className="py-2 pr-3 text-steel-300">{c.defaultChannel}</td>
                  <td className="py-2 pr-3">{c.madeToOrder ? <Badge tone="ok">да</Badge> : <Badge tone="muted">нет</Badge>}</td>
                  <td className="py-2 pr-3">
                    <Link href={`/admin/categories/${c.slug}`} className="text-xs text-accent-400 hover:underline">Редактировать</Link>
                    <Link href={`/catalog/${c.slug}`} target="_blank" className="ml-3 text-xs text-steel-400 hover:underline">На сайте ↗</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
