import Link from 'next/link';
import { requireAuth } from '@/lib/admin/auth';
import { products } from '@/lib/products';
import { categories } from '@/lib/categories';
import { readData } from '@/lib/admin/store';
import { company } from '@/lib/company';
import { productMeta, categoryMeta } from '@/lib/seo';
import { PageHead, Panel, Badge } from '@/components/admin/ui';

/** SEO-раздел: массовые операции (Том 7, п. 7.6). */
export default function AdminSeo() {
  requireAuth();
  const overlays = readData().productOverlays;

  const rows = [
    ...categories.map((c) => {
      const m = categoryMeta(c);
      return { type: 'Категория', name: c.name, href: `/catalog/${c.slug}`, title: m.title, custom: false, edit: undefined as string | undefined };
    }),
    ...products.map((p) => {
      const ov = overlays[p.sku];
      const m = productMeta(p);
      return {
        type: 'Товар',
        name: p.name,
        href: `/catalog/${p.categorySlug}/${p.slug}`,
        title: ov?.seoTitle || m.title,
        custom: Boolean(ov?.seoTitle),
        edit: `/admin/products/${p.sku}`,
      };
    }),
  ];

  return (
    <>
      <PageHead
        title="SEO"
        sub="Мета-теги всех страниц. Пустые заполняются по шаблону; можно переопределить точечно. Шаблон не должен быть тюрьмой."
      />

      {/* GEO-факты — единое место company_facts (Том 7, п. 7.6; Том 6) */}
      <Panel title="GEO-факты (единый источник для llms.txt, цифр на главной, «О компании»)" className="mb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <Fact label="Год основания" value={String(company.foundedYear)} />
          <Fact label="Город производства" value={company.city} />
          <Fact label="Мин. срок изготовления" value={`${company.minProductionDays} дней`} />
          <Fact label="Городов доставки" value={String(company.cities.length)} />
        </div>
        <p className="mt-3 text-[11px] text-steel-500">
          Одно поле — а не пять мест для правки. Меняется в lib/company.ts (в бою — в базе), подставляется везде.
        </p>
      </Panel>

      <Panel title="Мета-теги страниц">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-ink-800 text-left text-xs text-steel-400">
                <th className="py-2 pr-3">Тип</th>
                <th className="py-2 pr-3">Страница</th>
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Статус</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.href} className="border-b border-ink-800/60 align-top">
                  <td className="py-2 pr-3 text-steel-400">{r.type}</td>
                  <td className="py-2 pr-3 text-steel-100">{r.name}</td>
                  <td className="py-2 pr-3 text-xs text-steel-400">{r.title}</td>
                  <td className="py-2 pr-3">
                    {r.custom ? <Badge tone="ok">вручную</Badge> : <Badge tone="muted">шаблон</Badge>}
                  </td>
                  <td className="py-2 pr-3">
                    {r.edit && <Link href={r.edit} className="text-xs text-accent-400 hover:underline">Изменить</Link>}
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-700 bg-ink-800 p-3">
      <div className="text-xs text-steel-400">{label}</div>
      <div className="mt-0.5 font-semibold text-white">{value}</div>
    </div>
  );
}
