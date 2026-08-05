import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import CategoryListing from '@/components/CategoryListing';
import LeadCTA from '@/components/LeadCTA';
import JsonLd from '@/components/JsonLd';
import { categoryIcon } from '@/components/icons';
import { categories, getCategory } from '@/lib/categories';
import { productsByCategory } from '@/lib/products';
import { breadcrumbLd, itemListLd, faqLd, categoryMeta } from '@/lib/seo';

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const cat = getCategory(params.category);
  if (!cat) return {};
  const m = categoryMeta(cat);
  return { ...m, alternates: { canonical: `/catalog/${cat.slug}` } };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = getCategory(params.category);
  if (!cat) notFound();
  const products = productsByCategory(cat.slug);

  const crumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Каталог', url: '/catalog' },
    { name: cat.name, url: `/catalog/${cat.slug}` },
  ];

  return (
    <>
      {/* Баннер на 40% высоты экрана, не полноэкранный (Том 2, п. 2.4.1) */}
      <section className="relative overflow-hidden border-b border-ink-800">
        <div className="absolute inset-0 -z-10">
          <div className="h-full w-full animate-slow-zoom bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 80% 20%, rgba(225,29,42,0.2), transparent 45%), repeating-linear-gradient(120deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 24px)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
        </div>
        <div className="container-page py-14 md:py-20">
          <div className="flex h-12 w-12 items-center justify-center text-accent-400 [&>svg]:h-full [&>svg]:w-full">
            {categoryIcon(cat.slug)}
          </div>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">{cat.name}</h1>
          {/* Одна строка: производим, а не перепродаём (Том 2, п. 2.4.1) */}
          <p className="mt-2 max-w-xl text-steel-300">{cat.tagline}</p>
        </div>
      </section>

      <div className="container-page">
        <Breadcrumbs items={crumbs} />

        {/* Блок «Не подходит стандарт?» — до просмотра товаров (Том 2, п. 2.4.2) */}
        {cat.madeToOrder && cat.customCta && (
          <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-lg border border-accent/30 bg-accent/5 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-white">Не подходит стандарт?</h2>
              <p className="mt-1 text-sm text-steel-300">{cat.customCta}</p>
            </div>
            <LeadCTA
              label="Рассчитать под заказ"
              source={`madeorder-${cat.slug}`}
              title={`Изготовление: ${cat.name}`}
              defaultComment={`Категория: ${cat.name}. Нужные параметры: `}
            />
          </div>
        )}

        {/* Подкатегории как быстрые фильтры по назначению (Том 2, п. 2.4.2) */}
        {cat.subcategories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {cat.subcategories.map((s) => (
              <span key={s.slug} className="rounded-full border border-ink-600 bg-ink-800 px-3 py-1 text-xs text-steel-300">
                {s.name}
              </span>
            ))}
          </div>
        )}

        <Suspense fallback={<div className="py-10 text-steel-400">Загрузка каталога…</div>}>
          <CategoryListing category={cat} products={products} />
        </Suspense>

        {/* Образовательный блок под товарами — для конверсии и SEO (Том 2, п. 2.7) */}
        {cat.faq && cat.faq.length > 0 && (
          <section className="mt-16 border-t border-ink-800 pt-10">
            <h2 className="text-2xl font-bold">Как выбрать {cat.name.toLowerCase()}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {cat.faq.map((f) => (
                <div key={f.q} className="card p-5">
                  {/* Прямой ответ первым предложением — для людей и ИИ (Том 6, п. 6.2) */}
                  <h3 className="font-semibold text-white">{f.q}</h3>
                  <p className="mt-2 text-sm text-steel-300">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <JsonLd data={[breadcrumbLd(crumbs), itemListLd(products, cat.slug), ...(cat.faq ? [faqLd(cat.faq)] : [])]} />
    </>
  );
}
