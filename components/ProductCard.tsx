import Link from 'next/link';
import type { Product } from '@/lib/types';
import { priceLabel, stockBadge, stockTone } from '@/lib/format';
import Thumb from './Thumb';
import { categoryIcon } from './icons';

/**
 * Карточка товара в листинге (Том 2, п. 2.5). Каждый элемент отрабатывает
 * возражение: фото, название, артикул, 2–3 ключевых параметра, цена, метка
 * статуса, метка «Наше производство», кнопка действия. Премиальный
 * индустриальный стиль: моно-артикул, засечки, крупная цена.
 */
export default function ProductCard({ product }: { product: Product }) {
  const href = `/catalog/${product.categorySlug}/${product.slug}`;
  const tone = stockTone(product.stockStatus);

  return (
    <div className="group card glow-hover flex flex-col overflow-hidden hover:-translate-y-1 hover:border-accent/40">
      <Link href={href} className="relative block overflow-hidden">
        {product.media && product.media.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.media[0]}
            alt={product.name}
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="transition-transform duration-500 group-hover:scale-105">
            <Thumb icon={categoryIcon(product.categorySlug)} label={product.sku} />
          </div>
        )}
        {product.made && (
          <span className="absolute left-2 top-2 rounded-sm bg-accent px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wider text-white">
            Наше производство
          </span>
        )}
        <span
          className={`absolute right-2 top-2 rounded-sm border px-2 py-0.5 text-[10px] font-medium backdrop-blur ${
            tone === 'ok'
              ? 'border-green-500/40 bg-black/50 text-green-400'
              : tone === 'warn'
                ? 'border-amber-500/40 bg-black/50 text-amber-400'
                : 'border-ink-500 bg-black/50 text-steel-300'
          }`}
        >
          {stockBadge(product)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mono text-[11px] text-steel-500">{product.sku}</div>
        <Link href={href} className="mt-1 block">
          <h3 className="text-sm font-semibold leading-snug text-white transition-colors group-hover:text-accent-400">
            {product.name}
          </h3>
        </Link>

        {product.keyParams.length > 0 && (
          <dl className="mt-3 space-y-1 border-t border-ink-800 pt-3 text-xs text-steel-400">
            {product.keyParams.slice(0, 3).map((k) => (
              <div key={k.label} className="flex justify-between gap-2">
                <dt>{k.label}</dt>
                <dd className="mono text-steel-200">{k.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-auto pt-4">
          <div className="font-display text-xl font-bold text-white">{priceLabel(product)}</div>
          <Link
            href={href}
            className={`mt-3 block rounded-md py-2 text-center font-display text-sm font-semibold uppercase tracking-wider transition-colors ${
              product.salesChannel === 'kaspi'
                ? 'border border-ink-500 bg-ink-800 text-steel-100 hover:border-steel-400 hover:bg-ink-700'
                : 'bg-accent text-white hover:bg-accent-600'
            }`}
          >
            {product.salesChannel === 'kaspi' ? 'Купить на Kaspi' : 'Подробнее'}
          </Link>
        </div>
      </div>
    </div>
  );
}
