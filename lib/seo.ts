import type { Category, Product } from './types';
import { company, siteUrl } from './company';
import { priceLabel } from './format';

/**
 * Schema.org / JSON-LD (Том 5, п. 5.3). Факты о компании берутся из единого
 * источника company (Том 5, п. 5.5) — не дублируются по страницам вручную.
 */

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.legalName,
    alternateName: company.brand,
    url: siteUrl,
    foundingDate: String(company.foundedYear),
    email: company.email,
    telephone: company.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: company.city,
      addressCountry: 'KZ',
    },
    areaServed: company.cities,
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${company.brand} — ${company.domain}`,
    url: siteUrl,
    inLanguage: 'ru',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${siteUrl}${it.url}`,
    })),
  };
}

export function itemListLd(products: Product[], categorySlug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${siteUrl}/catalog/${categorySlug}/${p.slug}`,
      name: p.name,
    })),
  };
}

/**
 * Product + Offer (Том 3, п. 3.11). availability синхронизирован с реальным
 * статусом; AggregateRating не публикуем без реальных отзывов (Том 3, п. 3.7).
 */
export function productLd(p: Product, categorySlug: string) {
  const availability =
    p.stockStatus === 'in_stock'
      ? 'https://schema.org/InStock'
      : p.stockStatus === 'discontinued'
        ? 'https://schema.org/Discontinued'
        : 'https://schema.org/PreOrder';

  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    priceCurrency: 'KZT',
    availability,
    url: `${siteUrl}/catalog/${categorySlug}/${p.slug}`,
    seller: { '@type': 'Organization', name: company.brand },
  };
  if (p.priceRetail != null) offer.price = p.priceRetail;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.sku,
    brand: { '@type': 'Brand', name: company.brand },
    description: p.description,
    offers: offer,
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

/** Шаблон Title/Description категории (Том 2, п. 2.7) */
export function categoryMeta(cat: Category) {
  return {
    title: `${cat.name} — купить в ${company.city} | Производство ${company.brand}`,
    description: `${cat.name} от производителя ${company.brand}. Изготовление от ${company.minProductionDays} дней, любые размеры под заказ. Доставка по Казахстану. ☎ ${company.phone}`,
  };
}

/** Шаблон Title/Description карточки (Том 3, п. 3.11) */
export function productMeta(p: Product) {
  const priceText = p.priceRetail != null ? `цена ${priceLabel(p)}` : 'изготовление под заказ';
  const spec = p.keyParams.slice(0, 2).map((k) => `${k.label} ${k.value}`).join(', ');
  return {
    title: `${p.name} купить в ${company.city} — ${priceText} | ${company.brand}`,
    description: `${p.name}. ${spec}. Производство ${company.brand}, доставка по Казахстану.`,
  };
}
