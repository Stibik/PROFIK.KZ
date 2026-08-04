/**
 * Модель данных витрины Profik.kz.
 *
 * По Тому 0 (п. 0.1) PFS APP владеет данными, сайт хранит их локальную копию.
 * Здесь — форма этой локальной копии. Поля товара повторяют минимальный
 * контракт из Тома 0 (п. 0.2) плюс витринные поля, которыми управляет сайт
 * (Том 7, п. 7.3): sales_channel, kaspiUrl, маркетинговое описание, связи.
 */

export type StockStatus = 'in_stock' | 'made_to_order' | 'on_request' | 'discontinued';

/** Канал продажи (Том 3, п. 3.1) */
export type SalesChannel = 'kaspi' | 'request' | 'both';

export interface FilterDef {
  /** ключ в attributes товара */
  key: string;
  label: string;
  type: 'range' | 'checkbox' | 'toggle';
  /** для range */
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** для checkbox */
  options?: string[];
  comment?: string;
}

export interface Subcategory {
  slug: string;
  name: string;
}

export interface Category {
  slug: string;
  name: string;
  /** H1 подзаголовок — «производим, а не перепродаём» (Том 2, п. 2.4.1) */
  tagline: string;
  /** короткое описание для плиток и мета */
  summary: string;
  /** структурный принцип подкатегорий (Том 2, п. 2.4.2) */
  subcategories: Subcategory[];
  filters: FilterDef[];
  /** канал по умолчанию для новых товаров (Том 3, п. 3.1) */
  defaultChannel: SalesChannel;
  /** реально ли возможно изготовление под заказ (Том 2, п. 2.13) */
  madeToOrder: boolean;
  /** блок «Не подходит стандарт?» призыв (Том 2, п. 2.4.2) */
  customCta?: string;
  /** образовательные вопросы под товарами / FAQ категории (Том 2, п. 2.7) */
  faq?: { q: string; a: string }[];
  emoji: string;
}

export interface ProductFaq {
  q: string;
  a: string;
}

export interface Product {
  sku: string;
  slug: string;
  categorySlug: string;
  subcategorySlug?: string;
  name: string;
  /** характеристики, ключи совпадают с ключами фильтров (Том 3, п. 3.5) */
  attributes: Record<string, string | number | boolean>;
  /** розничная цена; null — «рассчитаем» */
  priceRetail: number | null;
  /** true → показываем «от N ₸» (есть модификации) */
  priceFrom?: boolean;
  stockStatus: StockStatus;
  /** срок изготовления под заказ, дней (Том 3, п. 3.4) */
  productionDays?: number;
  salesChannel: SalesChannel;
  kaspiUrl?: string;
  /** наше производство — главный дифференциатор (Том 2, п. 2.5) */
  made: boolean;
  /** 2–3 ключевых параметра для карточки в листинге (Том 2, п. 2.5) */
  keyParams: { label: string; value: string }[];
  /** маркетинговое описание, ведётся на сайте (Том 7) */
  description: string;
  /** «Для кого подходит» — перевод характеристик на язык задачи (Том 3, п. 3.5) */
  forWhom?: string;
  /** с этим покупают — slug'и товаров (Том 3, п. 3.8) */
  relatedSkus?: string[];
  faq?: ProductFaq[];
  updatedAt: string;
}

/** Единый источник фактов о компании (Том 5, п. 5.5; Том 6) */
export interface CompanyFacts {
  brand: string;
  domain: string;
  legalName: string;
  city: string;
  country: string;
  /** [РЕАЛ] — уточняется заказчиком, Том 4 п. 4.8 */
  foundedYear: number;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  email: string;
  minProductionDays: number;
  cities: string[];
  addressLine: string;
}
