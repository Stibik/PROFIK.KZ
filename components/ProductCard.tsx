import Link from 'next/link';
import type { Product } from '@/lib/types';
import { priceLabel, stockBadge, stockTone } from '@/lib/format';
import Thumb from './Thumb';
import { categoryIcon } from './icons';

/**
 * Карточка товара в листинге (Том 2, п. 2.5). Каждый элемент отрабатывает
 * возражение: фото, название (артикул мелко ниже), 2–3 ключевых параметра,
 * цена, метка статуса, метка «Наше производство», кнопка действия.
 * Никаких фальшивых рейтингов и таймеров (Том 2, п. 2.5).
 */
export default function ProductCard({ product }: { product: Product }) {
  const href = `/catalog/${product.categorySlug}/${product.slug}`;
  const tone = stockTone(product.stockStatus);

  return (
    <div className="group card glow-hover flex flex-col overflow-hidden hover:-translate-y-1 hover:border-accent/40">
      <Link href={href} className="block">
        {product.media && product.media.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.media[0]} alt={product.name} className="aspect-square w-full object-cover" />
        ) : (
          <Thumb icon={categoryIcon(product.categorySlug)} label={product.sku} />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {product.made && <span className="badge-made">Наше производство</span>}
          <span
            className={`badge-status ${
              tone === 'ok' ? 'text-green-400' : tone === 'warn' ? 'text-amber-400' : 'text-steel-400'
            }`}
          >
            {stockBadge(product)}
          </span>
        </div>

        <Link href={href} className="block">
          <h3 className="text-sm font-semibold leading-snug text-white transition-colors group-hover:text-accent-400">
            {product.name}
          </h3>
        </Link>
        <div className="mt-0.5 text-xs text-steel-500">{product.sku}</div>

        <dl className="mt-3 space-y-1 text-xs text-steel-400">
          {product.keyParams.slice(0, 3).map((k) => (
            <div key={k.label} className="flex justify-between gap-2">
              <dt>{k.label}</dt>
              <dd className="text-steel-200">{k.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex items-end justify-between gap-2 pt-2">
          <div className="text-base font-semibold text-white">{priceLabel(product)}</div>
        </div>

        <Link
          href={href}
          className={`mt-3 block rounded-md py-2 text-center text-sm font-semibold transition-colors ${
            product.salesChannel === 'kaspi'
              ? 'btn-secondary'
              : 'bg-accent text-white hover:bg-accent-600'
          }`}
        >
          {product.salesChannel === 'kaspi' ? 'Купить на Kaspi' : 'Подробнее'}
        </Link>
      </div>
    </div>
  );
}
