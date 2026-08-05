import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CategoryTile from '@/components/CategoryTile';
import SearchBar from '@/components/SearchBar';
import JsonLd from '@/components/JsonLd';
import { categories } from '@/lib/categories';
import { taskEntries } from '@/lib/content';
import { taskIcon } from '@/components/icons';
import { breadcrumbLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Каталог оборудования для единоборств',
  description:
    'Каталог PFS: боксёрские мешки, манекены, утяжелители, лапы, покрытия, перчатки. Подбор по задаче или категории. Производство в Казахстане.',
  alternates: { canonical: '/catalog' },
};

/**
 * Вход в каталог — не сетка категорий, а «развилка на три дороги» (Том 2, п. 2.2):
 * поиск (режим 1) → вход по задаче (режим 2) → категории (режим 3).
 */
export default function CatalogPage() {
  return (
    <div className="container-page">
      <Breadcrumbs items={[{ name: 'Главная', url: '/' }, { name: 'Каталог', url: '/catalog' }]} />
      <JsonLd data={breadcrumbLd([{ name: 'Главная', url: '/' }, { name: 'Каталог', url: '/catalog' }])} />

      <h1 className="text-3xl font-bold md:text-4xl">Каталог</h1>
      <p className="mt-2 max-w-2xl text-steel-400">
        500 позиций в 8 категориях. Знаете, что ищете — воспользуйтесь поиском. Знаете задачу, но
        не товар — начните с неё.
      </p>

      {/* Режим 1 — поиск */}
      <div className="mt-6 max-w-2xl">
        <SearchBar />
      </div>

      {/* Режим 2 — вход по задаче */}
      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-400">Что вы оборудуете?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {taskEntries.map((e) => (
            <Link
              key={e.slug}
              href={e.href}
              className="group card flex flex-col items-start gap-2 p-4 transition-all hover:-translate-y-0.5 hover:border-accent/50"
            >
              <span className="flex h-7 w-7 items-center justify-center text-accent-400 [&>svg]:h-full [&>svg]:w-full">{taskIcon(e.slug)}</span>
              <span className="font-semibold text-white group-hover:text-accent-400">{e.title}</span>
              <span className="text-xs text-steel-400">{e.audience}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Режим 3 — выбор категории */}
      <section className="mt-12 pb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-steel-400">Или выберите категорию</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <CategoryTile key={c.slug} category={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
