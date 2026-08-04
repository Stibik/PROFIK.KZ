'use client';

import type { Product } from '@/lib/types';
import LeadCTA from './LeadCTA';

/**
 * Кнопки действия карточки (Том 3, п. 3.1, 3.4). Логика канала:
 *  — kaspi: «Купить на Kaspi» (вторичный цвет, новая вкладка);
 *  — request: «Узнать цену и сроки» (красный, форма в модалке);
 *  — both: обе кнопки, разделены по значимости.
 * На мобильном основная кнопка липкая внизу (Том 3, п. 3.12).
 */
export default function ProductActions({ product, sticky = false }: { product: Product; sticky?: boolean }) {
  const kaspi = (
    <a
      href={product.kaspiUrl || 'https://kaspi.kz/shop/'}
      target="_blank"
      rel="noopener"
      className="btn-secondary w-full"
    >
      Купить на Kaspi
    </a>
  );

  const request = (
    <LeadCTA
      label="Узнать цену и сроки"
      variant="full"
      source={`product-${product.sku}`}
      sku={product.sku}
      title={product.name}
      defaultComment={`Интересует: ${product.name} (${product.sku}). `}
    />
  );

  let content: React.ReactNode;
  if (product.salesChannel === 'kaspi') content = kaspi;
  else if (product.salesChannel === 'request') content = request;
  else
    content = (
      <div className="flex flex-col gap-2">
        {request}
        {kaspi}
      </div>
    );

  if (sticky) {
    // Липкая панель на мобильном (Том 3, п. 3.12)
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-700 bg-ink-950/95 p-3 backdrop-blur md:hidden">
        {content}
      </div>
    );
  }
  return <div>{content}</div>;
}
