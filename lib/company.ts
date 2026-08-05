import type { CompanyFacts } from './types';

/**
 * Единый источник фактов о компании (Том 5, п. 5.5; Том 6, п. 6.1).
 * Меняется в одном месте, подставляется везде: llms.txt, блок цифр на главной,
 * Schema.org, подвал. Значения [РЕАЛ] уточняются заказчиком до запуска
 * (Том 4, п. 4.8) — здесь стоят рабочие плейсхолдеры.
 */
export const company: CompanyFacts = {
  brand: 'PFS',
  domain: 'profik.kz',
  legalName: 'PFS (Professional Fighting Sport)',
  city: 'Алматы',
  country: 'Казахстан',
  foundedYear: 2018, // [РЕАЛ] уточнить
  phone: '+7 (700) 000-00-00', // [РЕАЛ] уточнить
  phoneHref: 'tel:+77000000000',
  whatsapp: '+7 (700) 000-00-00', // [РЕАЛ] уточнить
  email: 'info@profik.kz',
  minProductionDays: 5,
  cities: ['Алматы', 'Астана', 'Караганда', 'Шымкент', 'Усть-Каменогорск', 'Павлодар', 'Семей'],
  addressLine: 'г. Алматы', // [РЕАЛ] уточнить адрес цеха
};

export const siteUrl = `https://${company.domain}`;

/**
 * Индексация поисковиками (Том 0, миграция, Этап 1). На техническом домене
 * Render сайт ДОЛЖЕН быть закрыт от индексации, иначе тестовый адрес создаёт
 * дубли и портит основной сайт. Открываем только при переключении DNS —
 * выставив SITE_INDEXABLE=true в переменных окружения продакшена.
 */
export const indexable = process.env.SITE_INDEXABLE === 'true';

/** Коды подтверждения для вебмастеров (вставляются при подключении). */
export const verification = {
  google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  yandex: process.env.YANDEX_VERIFICATION || undefined,
};
