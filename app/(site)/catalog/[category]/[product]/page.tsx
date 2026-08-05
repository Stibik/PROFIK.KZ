import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductActions from '@/components/ProductActions';
import Gallery from '@/components/Gallery';
import ProductCard from '@/components/ProductCard';
import LeadCTA from '@/components/LeadCTA';
import JsonLd from '@/components/JsonLd';
import { categoryIcon } from '@/components/icons';
import { getCategory } from '@/lib/categories';
import { products } from '@/lib/products';
import { getProductBySlug, getProductBySku, productsInCategory } from '@/lib/catalog';
import { articles } from '@/lib/content';
import { company } from '@/lib/company';
import { priceLabel, stockLabel, stockTone } from '@/lib/format';
import { breadcrumbLd, productLd, faqLd, productMeta } from '@/lib/seo';

// ISR: подхватываем правки/импорт без полной пересборки (Том 4, п. 4.5)
export const revalidate = 60;

export function generateStaticParams() {
  return products.map((p) => ({ category: p.categorySlug, product: p.slug }));
}

export function generateMetadata({ params }: { params: { category: string; product: string } }): Metadata {
  const p = getProductBySlug(params.product);
  if (!p) return {};
  const m = productMeta(p);
  return { ...m, alternates: { canonical: `/catalog/${p.categorySlug}/${p.slug}` } };
}

export default function ProductPage({ params }: { params: { category: string; product: string } }) {
  const p = getProductBySlug(params.product);
  const cat = getCategory(params.category);
  if (!p || !cat || p.categorySlug !== cat.slug) notFound();

  const related = (p.relatedSkus ?? []).map(getProductBySku).filter(Boolean) as typeof products;
  const similar = productsInCategory(cat.slug).filter((x) => x.sku !== p.sku).slice(0, 4);
  const catArticles = articles.filter((a) => a.categorySlug === cat.slug).slice(0, 3);
  const tone = stockTone(p.stockStatus);

  const crumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Каталог', url: '/catalog' },
    { name: cat.name, url: `/catalog/${cat.slug}` },
    { name: p.name, url: `/catalog/${cat.slug}/${p.slug}` },
  ];

  return (
    <div className="container-page pb-24 md:pb-0">
      <Breadcrumbs items={crumbs} />

      {/* Верхний блок: галерея + цена/статус/кнопка (Том 3, п. 3.2) */}
      <div className="grid gap-8 md:grid-cols-2">
        <Gallery slug={cat.slug} name={p.name} media={p.media} />

        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{p.name}</h1>
          <div className="mt-1 text-sm text-steel-500">
            {p.sku} · <Link href={`/catalog/${cat.slug}`} className="hover:text-steel-300">{cat.name}</Link>
          </div>

          <div className="my-5 border-y border-ink-800 py-5">
            <div className="text-3xl font-black text-white">{priceLabel(p)}</div>
            <div
              className={`mt-2 text-sm ${
                tone === 'ok' ? 'text-green-400' : tone === 'warn' ? 'text-amber-400' : 'text-steel-400'
              }`}
            >
              {stockLabel(p)}
            </div>
          </div>

          {p.made && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="badge-made">Наше производство</span>
              <a href="#production" className="text-sm text-steel-300 hover:text-white">
                Изготавливаем в {company.city}. Можно заказать другой размер →
              </a>
            </div>
          )}

          {/* Ключевые параметры 3–4 (Том 3, п. 3.2) */}
          <dl className="mb-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {p.keyParams.map((k) => (
              <div key={k.label} className="flex justify-between border-b border-ink-800 py-1.5">
                <dt className="text-steel-400">{k.label}</dt>
                <dd className="font-medium text-steel-100">{k.value}</dd>
              </div>
            ))}
          </dl>

          {/* Кнопка действия — высоко, до вкладок (Том 3, п. 3.2) */}
          <div className="hidden md:block">
            <ProductActions product={p} />
          </div>
          <div className="mt-3 flex gap-4 text-sm text-steel-400">
            <button className="hover:text-white">＋ Сравнить</button>
            <button className="hover:text-white">♡ В избранное</button>
          </div>
        </div>
      </div>

      {/* Секции-«вкладки» — всё в SSR HTML для SEO/AI SEO (Том 3, п. 3.5; Том 6) */}
      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12">
          {/* Описание */}
          <section id="description">
            <h2 className="text-xl font-bold">Описание</h2>
            <p className="mt-3 text-steel-300">{p.description}</p>
            {p.forWhom && (
              <div className="mt-4 rounded-lg border border-ink-700 bg-ink-900 p-4">
                <div className="text-sm font-semibold text-white">Для кого подходит</div>
                <p className="mt-1 text-sm text-steel-300">{p.forWhom}</p>
              </div>
            )}
          </section>

          {/* Характеристики — таблица, ключи совпадают с фильтрами (Том 3, п. 3.5) */}
          <section id="specs">
            <h2 className="text-xl font-bold">Характеристики</h2>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {cat.filters
                  .filter((f) => f.key !== 'price' && p.attributes[f.key] !== undefined)
                  .map((f) => (
                    <tr key={f.key} className="border-b border-ink-800">
                      <td className="py-2 pr-4 text-steel-400">{f.label}</td>
                      <td className="py-2 font-medium text-steel-100">
                        {formatAttr(p.attributes[f.key], f.unit)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>

          {/* Производство — дифференцирующий блок (Том 3, п. 3.6) */}
          {p.made && (
            <section id="production" className="rounded-lg border border-accent/30 bg-accent/5 p-6">
              <h2 className="text-xl font-bold">Наше производство</h2>
              <p className="mt-3 text-steel-300">
                Этот товар мы изготавливаем сами в {company.city}. Прошивка, набивка и сборка —
                под контролем технолога. Можем изменить размер, вес или цвет под вашу задачу.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {['🧵 Прошивка', '🥊 Набивка', '🔧 Сборка'].map((s) => (
                  <div key={s} className="rounded-md border border-ink-700 bg-ink-900 p-3 text-center text-xs text-steel-300">
                    {s}
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <LeadCTA
                  label="Заказать свой размер"
                  source={`product-custom-${p.sku}`}
                  sku={p.sku}
                  title={`Изготовление под заказ: ${p.name}`}
                  defaultComment={`${p.name} (${p.sku}). Желаемые параметры: `}
                />
              </div>
            </section>
          )}

          {/* Отзывы — только реальные, без накрутки (Том 3, п. 3.7) */}
          <section id="reviews">
            <h2 className="text-xl font-bold">Отзывы</h2>
            <div className="mt-3 rounded-lg border border-dashed border-ink-600 bg-ink-900 p-6 text-center">
              <p className="text-sm text-steel-400">Купили этот товар? Поделитесь опытом — это поможет другим.</p>
              <div className="mt-3">
                <LeadCTA label="Оставить отзыв" variant="secondary" source={`review-${p.sku}`} sku={p.sku} title="Ваш отзыв о товаре" />
              </div>
            </div>
          </section>

          {/* Доставка, оплата, гарантия (Том 3, п. 3.9) */}
          <section id="delivery">
            <h2 className="text-xl font-bold">Доставка, оплата и гарантия</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <InfoCard title="Доставка">По {company.country}: транспортными компаниями и самовывозом из {company.city}. Сроки зависят от города.</InfoCard>
              <InfoCard title="Оплата">Наличные, безнал для юрлиц, Kaspi для физлиц. Счёт и документы для бухгалтерии.</InfoCard>
              <InfoCard title="Гарантия">Гарантия на швы и материалы этой категории. Ремонт и перетяжка нашего производства.</InfoCard>
              <InfoCard title="Возврат">Возврат и обмен стандартных позиций по договорённости. Изделия под заказ — по согласованным параметрам.</InfoCard>
            </div>
          </section>

          {/* FAQ товара — прямой ответ первым предложением (Том 3, п. 3.10; Том 6) */}
          {p.faq && p.faq.length > 0 && (
            <section id="faq">
              <h2 className="text-xl font-bold">Частые вопросы</h2>
              <div className="mt-3 space-y-3">
                {p.faq.map((f) => (
                  <div key={f.q} className="card p-4">
                    <h3 className="font-semibold text-white">{f.q}</h3>
                    <p className="mt-1 text-sm text-steel-300">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Правая колонка: с этим покупают (Том 3, п. 3.8) */}
        {related.length > 0 && (
          <aside>
            <h2 className="text-lg font-bold">С этим покупают</h2>
            <div className="mt-3 space-y-3">
              {related.map((r) => (
                <Link
                  key={r.sku}
                  href={`/catalog/${r.categorySlug}/${r.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-900 p-3 transition-colors hover:border-ink-500"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center text-steel-400 [&>svg]:h-6 [&>svg]:w-6">{categoryIcon(r.categorySlug)}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white">{r.name}</span>
                    <span className="block text-xs text-steel-400">{priceLabel(r)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* Похожие товары */}
      {similar.length > 0 && (
        <section className="mt-16 border-t border-ink-800 pt-10">
          <h2 className="text-xl font-bold">Похожие товары</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {similar.map((s) => (
              <ProductCard key={s.sku} product={s} />
            ))}
          </div>
        </section>
      )}

      {/* Статьи по теме — перелинковка (Том 5, п. 5.2) */}
      {catArticles.length > 0 && (
        <section className="mt-16 border-t border-ink-800 pt-10">
          <h2 className="text-xl font-bold">Статьи по теме</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {catArticles.map((a) => (
              <Link key={a.slug} href={`/knowledge/${a.slug}`} className="group card p-5 transition-colors hover:border-ink-500">
                <h3 className="font-semibold text-white group-hover:text-accent-400">{a.title}</h3>
                <p className="mt-2 text-sm text-steel-400">{a.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Липкая кнопка на мобильном (Том 3, п. 3.12) */}
      <ProductActions product={p} sticky />

      <JsonLd data={[breadcrumbLd(crumbs), productLd(p, cat.slug), ...(p.faq ? [faqLd(p.faq)] : [])]} />
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 p-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="mt-1 text-sm text-steel-400">{children}</p>
    </div>
  );
}

function formatAttr(v: unknown, unit?: string): string {
  if (typeof v === 'boolean') return v ? 'Да' : 'Нет';
  if (typeof v === 'number') return `${v}${unit ? ' ' + unit : ''}`;
  return String(v);
}
