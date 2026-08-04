import type { Product, StockStatus } from './types';

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₸';
}

/**
 * Цена в трёх состояниях (Том 3, п. 3.4):
 * точная / «от N ₸» / «Рассчитаем стоимость».
 */
export function priceLabel(p: Product): string {
  if (p.priceRetail == null) return 'Рассчитаем стоимость';
  return (p.priceFrom ? 'от ' : '') + formatPrice(p.priceRetail);
}

/** Честный статус наличия по трём состояниям (Том 3, п. 3.4) */
export function stockLabel(p: Product): string {
  switch (p.stockStatus) {
    case 'in_stock':
      return 'В наличии, отгрузка сегодня-завтра';
    case 'made_to_order':
      return `Изготовим за ${p.productionDays ?? 5} дней`;
    case 'on_request':
      return 'Уточним у менеджера';
    case 'discontinued':
      return 'Снят с производства';
  }
}

/** Короткая метка статуса для листинга (Том 2, п. 2.5) */
export function stockBadge(p: Product): string {
  switch (p.stockStatus) {
    case 'in_stock':
      return 'В наличии';
    case 'made_to_order':
      return `Изготовим за ${p.productionDays ?? 5} дн.`;
    case 'on_request':
      return 'Под заказ';
    case 'discontinued':
      return 'Снят';
  }
}

export function stockTone(status: StockStatus): 'ok' | 'warn' | 'muted' {
  if (status === 'in_stock') return 'ok';
  if (status === 'made_to_order') return 'warn';
  return 'muted';
}

/** Основное действие карточки зависит от канала (Том 3, п. 3.1) */
export function primaryActionLabel(p: Product): string {
  const channel = p.salesChannel;
  if (channel === 'kaspi') return 'Купить на Kaspi';
  return 'Узнать цену и сроки';
}
