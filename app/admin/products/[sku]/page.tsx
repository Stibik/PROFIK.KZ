import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/admin/auth';
import { productBySku } from '@/lib/products';
import { getCategory } from '@/lib/categories';
import { readData } from '@/lib/admin/store';
import { priceLabel, stockLabel } from '@/lib/format';
import { saveProductOverlay } from '@/lib/admin/actions';
import { PageHead, Panel, ReadOnlyField } from '@/components/admin/ui';

/** Карточка товара в админке: read-only из PFS APP + витринные поля (Том 7, п. 7.3). */
export default function EditProduct({ params }: { params: { sku: string } }) {
  requireAuth();
  const p = productBySku(params.sku);
  if (!p) notFound();
  const cat = getCategory(p.categorySlug);
  const ov = readData().productOverlays[p.sku] ?? {};

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
