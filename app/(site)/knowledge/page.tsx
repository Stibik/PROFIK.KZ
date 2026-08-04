import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { articles } from '@/lib/content';
import { breadcrumbLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'База знаний — как выбрать оборудование для единоборств',
  description:
    'Экспертные статьи PFS: подбор веса мешка, наполнители, крепление в квартире, СТ-KZ и госзакупки. Отвечаем на частые вопросы.',
  alternates: { canonical: '/knowledge' },
};

export default function KnowledgePage() {
  const crumbs = [
    { name: 'Главная', url: '/' },
    { name: 'База знаний', url: '/knowledge' },
  ];
  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold md:text-4xl">База знаний</h1>
      <p className="mt-2 max-w-2xl text-steel-400">
        Разбираем, как выбрать оборудование — от веса мешка до госзакупок. Пишут специалисты
        производства PFS.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {articles.map((a) => (
          <Link key={a.slug} href={`/knowledge/${a.slug}`} className="group card p-6 transition-colors hover:border-ink-500">
            <h2 className="text-lg font-semibold text-white group-hover:text-accent-400">{a.title}</h2>
            <p className="mt-2 text-sm text-steel-300">{a.definition}</p>
            <div className="mt-4 text-xs text-steel-500">{a.author} · {a.authorRole}</div>
          </Link>
        ))}
      </div>

      <JsonLd data={breadcrumbLd(crumbs)} />
    </div>
  );
}
