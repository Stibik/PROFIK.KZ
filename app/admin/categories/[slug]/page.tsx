import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/admin/auth';
import { getCategory } from '@/lib/categories';
import { getCategoryMerged } from '@/lib/catalog';
import { readData } from '@/lib/admin/store';
import { saveCategoryOverlay } from '@/lib/admin/actions';
import { PageHead, Panel } from '@/components/admin/ui';

/** Редактирование контента категории (Том 7): баннер, тексты, порядок, SEO. */
export default function EditCategory({ params, searchParams }: { params: { slug: string }; searchParams: { up?: string } }) {
  requireAuth();
  const base = getCategory(params.slug);
  if (!base) notFound();
  const cat = getCategoryMerged(params.slug) ?? base;
  const ov = readData().categoryOverlays[params.slug] ?? {};

  return (
    <>
      <PageHead
        title={`Категория: ${cat.name}`}
        sub="Структура каталога — из PFS APP. На сайте настраиваются баннер, тексты, порядок и SEO."
        action={<Link href="/admin/categories" className="btn-ghost">← К списку</Link>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Контент категории">
          <form action={saveCategoryOverlay} className="space-y-4">
            <input type="hidden" name="slug" value={params.slug} />
            <Field name="name" label="Название" defaultValue={cat.name} />
            <Field name="tagline" label="Подзаголовок баннера (производим, а не перепродаём)" defaultValue={cat.tagline} />
            <div>
              <label className="mb-1 block text-xs text-steel-400">Краткое описание (для плиток и мета)</label>
              <textarea name="summary" rows={3} defaultValue={cat.summary} className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field name="order" label="Порядок" defaultValue={ov.order != null ? String(ov.order) : ''} placeholder="0,1,2…" />
              <label className="flex items-end gap-2 pb-2 text-sm text-steel-200">
                <input type="checkbox" name="hidden" defaultChecked={ov.hidden} className="h-4 w-4 accent-accent" />
                Скрыть категорию
              </label>
            </div>
            <Field name="seoTitle" label="SEO Title" defaultValue={ov.seoTitle ?? ''} placeholder="пусто = по шаблону" />
            <Field name="seoDescription" label="SEO Description" defaultValue={ov.seoDescription ?? ''} placeholder="пусто = по шаблону" />
            <div className="flex items-center gap-3 pt-1">
              <button className="btn-primary">Сохранить</button>
              <Link href={`/catalog/${params.slug}`} target="_blank" className="btn-ghost">Открыть на сайте ↗</Link>
            </div>
          </form>
        </Panel>

        <Panel title="Баннер категории">
          {ov.bannerImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ov.bannerImage} alt="" className="mb-3 aspect-[16/9] w-full rounded-md object-cover" />
          ) : (
            <p className="mb-3 text-sm text-steel-500">Баннер не загружен — показывается фирменный фон.</p>
          )}
          {searchParams.up === 'ok' && <p className="mb-2 text-sm text-green-400">Баннер обновлён.</p>}
          <form action="/api/admin/upload" method="post" encType="multipart/form-data" className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="catSlug" value={params.slug} />
            <input type="file" name="file" accept="image/*" required className="max-w-[240px] text-xs text-steel-300 file:mr-2 file:rounded file:border-0 file:bg-ink-700 file:px-3 file:py-1.5 file:text-steel-100" />
            <button className="btn-secondary py-1.5 text-sm">Загрузить баннер</button>
          </form>
          <p className="mt-2 text-[11px] text-steel-500">Съёмка в цеху/зале, тёмный фон, без стоков (Том 2, п. 2.4.1).</p>
        </Panel>
      </div>
    </>
  );
}

function Field({ name, label, defaultValue, placeholder }: { name: string; label: string; defaultValue?: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-steel-400">{label}</label>
      <input name={name} defaultValue={defaultValue} placeholder={placeholder} className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-sm" />
    </div>
  );
}
