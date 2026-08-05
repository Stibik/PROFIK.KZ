import Link from 'next/link';
import type { Category } from '@/lib/types';
import { productsByCategory } from '@/lib/products';
import Thumb from './Thumb';
import { categoryIcon } from './icons';

/** Плитка категории (Том 4, п. 4.4): фото, название, счётчик «N моделей» */
export default function CategoryTile({ category }: { category: Category }) {
  const count = productsByCategory(category.slug).length;
  return (
    <Link
      href={`/catalog/${category.slug}`}
      className="group card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-ink-500"
    >
      <Thumb icon={categoryIcon(category.slug)} ratio="wide" />
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white transition-colors group-hover:text-accent-400">
          {category.name}
        </h3>
        <p className="mt-1 text-xs text-steel-500">{count} моделей</p>
      </div>
    </Link>
  );
}
