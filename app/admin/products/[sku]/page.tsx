import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/admin/auth';
import { getProductBySku } from '@/lib/catalog';
import { getCategory } from '@/lib/categories';
import { readData } from '@/lib/admin/store';
import { priceLabel, stockLabel } from '@/lib/format';
import { saveProductOverlay, deleteProductMedia } from '@/lib/admin/actions';
import { PageHead, Panel, ReadOnlyField } from '@/components/admin/ui';

/** Карточка товара в админке: read-only из PFS APP + витринные поля (Том 7, п. 7.3). */
export default function EditProduct({ params }: { params: { sku: string; }; }) {
  requireAuth();
  const p = getProductBySku(params.sku);
  if (!p) notFound();
  const cat = getCategory(p.categorySlug);
  const ov = readData().productOverlays[p.sku] ?? {};
  const media = ov.media ?? [];

  return (
    <>
      <PageHead
        title={p.name}
        sub={`${p.sku} · ${cat?.name}`}
        action={<Link href="/admin/products" className="btn-ghost">← К списку</Link>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Управляется в PFS APP — только чтение */}
        <Panel title="Данные из PFS APP (только чтение)">
          <div className="space-y-3">
            <ReadOnlyField label="Название" value={p.name} />
            <ReadOnlyField label="Артикул" value={p.sku} />
            <ReadOnlyField label="Цена" value={priceLabel(p)} hint="Изменить можно только в PFS APP" />
            <ReadOnlyField label="Остаток / статус" value={stockLabel(p)} />
            <div className="grid grid-cols-2 gap-2">
              {p.keyParams.map((k) => (
                <ReadOnlyField key={k.label} label={k.label} value={k.value} />
              ))}
            </div>
            <a
              href="#"
              className="inline-block text-xs text-accent-400 hover:underline"
              title="В бою — прямая ссылка в PFS APP"
            >
              Открыть товар в PFS APP →
            </a>
          </div>
        </Panel>

        {/* Витринные поля — редактируются на сайте */}
        <Panel title="Витрина (редактируется на сайте)">
          <form action={saveProductOverlay} className="space-y-4">
            <input type="hidden" name="sku" value={p.sku} />

            <div>
              <label className="mb-1 block text-xs text-steel-400">Канал продажи</label>
              <select name="salesChannel" defaultValue={ov.salesChannel ?? p.salesChannel} className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-sm">
                <option value="kaspi">Kaspi — «Купить на Kaspi»</option>
                <option value="request">Заявка — «Узнать цену»</option>
                <option value="both">Оба</option>
              </select>
              <p className="mt-1 text-[11px] text-steel-500">
                Переопределяется в один клик, без похода в настройки категории (Том 3, п. 3.1).
              </p>
            </div>

            <Field name="kaspiUrl" label="Ссылка на позицию в Kaspi" defaultValue={ov.kaspiUrl ?? p.kaspiUrl ?? ''} placeholder="https://kaspi.kz/shop/..." hint="Прямая ссылка на этот sku — иначе кнопка ведёт в общий поиск (Том 3, п. 3.1)." />

            <div>
              <label className="mb-1 block text-xs text-steel-400">Маркетинговое описание</label>
              <textarea name="description" rows={4} defaultValue={ov.description ?? p.description} className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-sm" />
            </div>

            <Field name="seoTitle" label="SEO Title" defaultValue={ov.seoTitle ?? ''} placeholder="оставьте пустым для шаблона" />
            <Field name="seoDescription" label="SEO Description" defaultValue={ov.seoDescription ?? ''} placeholder="оставьте пустым для шаблона" />
            <Field name="relatedSkus" label="С этим покупают (артикулы через запятую)" defaultValue={(ov.relatedSkus ?? p.relatedSkus ?? []).join(', ')} placeholder="AKS-CEP-4, PCH-BX-14" />

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="btn-primary">Сохранить</button>
              <Link href={`/catalog/${p.categorySlug}/${p.slug}`} target="_blank" className="btn-ghost">
                Открыть на сайте ↗
              </Link>
            </div>
          </form>
        </Panel>
      </div>

      {/* Фотографии (маркетинговые) — зона сайта (Том 0, п. 0.1) */}
      <Panel title="Фотографии" className="mt-4">
        <form action="/api/admin/upload" method="post" encType="multipart/form-data" className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="sku" value={p.sku} />
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="max-w-[260px] text-xs text-steel-300 file:mr-2 file:rounded file:border-0 file:bg-ink-700 file:px-3 file:py-1.5 file:text-steel-100"
          />
          <button className="btn-secondary py-1.5 text-sm">Загрузить фото</button>
          <span className="text-xs text-steel-500">JPG/PNG/WebP. Первое фото — главное в карточке и листинге.</span>
        </form>

        {media.length > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {media.map((url, i) => (
              <div key={url} className="group relative overflow-hidden rounded-md border border-ink-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-square w-full object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] text-white">главное</span>}
                <form action={deleteProductMedia} className="absolute right-1 top-1">
                  <input type="hidden" name="sku" value={p.sku} />
                  <input type="hidden" name="url" value={url} />
                  <button className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    удалить
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-steel-500">Фото пока не загружены — показываются фирменные заглушки.</p>
        )}
      </Panel>
    </>
  );
}

function Field({ name, label, defaultValue, placeholder, hint }: { name: string; label: string; defaultValue?: string; placeholder?: string; hint?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-steel-400">{label}</label>
      <input name={name} defaultValue={defaultValue} placeholder={placeholder} className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-sm" />
      {hint && <p className="mt-1 text-[11px] text-steel-500">{hint}</p>}
    </div>
  );
}
