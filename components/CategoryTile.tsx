import Link from 'next/link';
import type { Category } from '@/lib/types';
import { productsInCategory, categoryBanner } from '@/lib/catalog';
import Thumb from './Thumb';
import { categoryIcon } from './icons';

/** Плитка категории (Том 4, п. 4.4): фото, название, счётчик «N моделей» */
export default function CategoryTile({ category }: { category: Category }) {
  const count = productsInCategory(category.slug).length;
  const banner = categoryBanner(category.slug);
  return (
    <Link
      href={`/catalog/${category.slug}`}
      className="group card glow-hover relative overflow-hidden hover:-translate-y-1 hover:border-accent/40"
    >
      <div className="overflow-hidden">
        <div className="transition-transform duration-500 group-hover:scale-105">
          {banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={banner} alt={category.name} className="aspect-[16/9] w-full object-cover" />
          ) : (
            <Thumb icon={categoryIcon(category.slug)} ratio="wide" />
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors group-hover:text-accent-400">
          {category.name}
        </h3>
        <p className="mono mt-0.5 text-[11px] text-steel-400">{count} моделей →</p>
      </div>
    </Link>
  );
}
