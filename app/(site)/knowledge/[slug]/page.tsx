import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductCard from '@/components/ProductCard';
import JsonLd from '@/components/JsonLd';
import { articles, getArticle } from '@/lib/content';
import { productsByCategory } from '@/lib/products';
import { getCategory } from '@/lib/categories';
import { company, siteUrl } from '@/lib/company';
import { breadcrumbLd } from '@/lib/seo';

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticle(params.slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.definition,
    alternates: { canonical: `/knowledge/${a.slug}` },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = getArticle(params.slug);
  if (!a) notFound();

  const cat = a.categorySlug ? getCategory(a.categorySlug) : undefined;
  const related = a.categorySlug ? productsByCategory(a.categorySlug).slice(0, 4) : [];

  const crumbs = [
    { name: 'Главная', url: '/' },
    { name: 'База знаний', url: '/knowledge' },
    { name: a.title, url: `/knowledge/${a.slug}` },
  ];

  // Article + E-E-A-T автор (Том 5, п. 5.3, 5.4)
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.definition,
    author: { '@type': 'Person', name: a.author, jobTitle: a.authorRole },
    publisher: { '@type': 'Organization', name: company.brand },
    mainEntityOfPage: `${siteUrl}/knowledge/${a.slug}`,
    inLanguage: 'ru',
  };

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={crumbs} />

      <article className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold md:text-4xl">{a.title}</h1>
        <div className="mt-3 text-sm text-steel-500">
          {a.author} · {a.authorRole}
        </div>

        {/* Определение / прямой ответ первым — для людей и ИИ (Том 6, п. 6.2) */}
        <p className="mt-6 border-l-2 border-accent pl-4 text-lg text-steel-100">{a.definition}</p>

        <div className="mt-6 space-y-4 text-steel-300">
          {a.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {related.length > 0 && cat && (
          <div className="mt-10 rounded-lg border border-ink-700 bg-ink-900 p-5">
            <div className="text-sm font-semibold text-white">Из статьи упомянуты</div>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.sku} product={p} />
              ))}
            </div>
            <div className="mt-4">
              <Link href={`/catalog/${cat.slug}`} className="link-underline text-sm">
                Все товары: {cat.name} →
              </Link>
            </div>
          </div>
        )}
      </article>

      <JsonLd data={[breadcrumbLd(crumbs), articleLd]} />
    </div>
  );
}
