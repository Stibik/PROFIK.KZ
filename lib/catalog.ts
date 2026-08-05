import 'server-only';
import type { Product, Category } from './types';
import { products as seedProducts } from './products';
import { categories as seedCategories } from './categories';
import { readData } from './admin/store';

/**
 * Слой доступа к каталогу с наложением правок из админки (локальная копия,
 * Том 0, п. 0.3). Серверный — используется в серверных страницах. Поля
 * каталога (цена/остаток/название) приходят «фидом» из Excel-импорта,
 * маркетинговые фото и витринные поля — из ручных правок.
 */
export function allProducts(): Product[] {
  const ov = readData().productOverlays;
  return seedProducts.map((p) => {
    const o = ov[p.sku];
    if (!o) return p;
    return {
      ...p,
      name: o.name ?? p.name,
      priceRetail: o.priceRetail !== undefined ? o.priceRetail : p.priceRetail,
      priceFrom: o.priceFrom ?? p.priceFrom,
      stockStatus: o.stockStatus ?? p.stockStatus,
      productionDays: o.productionDays ?? p.productionDays,
      salesChannel: o.salesChannel ?? p.salesChannel,
      kaspiUrl: o.kaspiUrl ?? p.kaspiUrl,
      description: o.description ?? p.description,
      relatedSkus: o.relatedSkus ?? p.relatedSkus,
      media: o.media && o.media.length ? o.media : p.media,
    };
  });
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts().find((p) => p.slug === slug);
}

export function getProductBySku(sku: string): Product | undefined {
  return allProducts().find((p) => p.sku === sku);
}

export function productsInCategory(categorySlug: string): Product[] {
  return allProducts().filter((p) => p.categorySlug === categorySlug);
}

export function allCategoriesMerged(): Category[] {
  const ov = readData().categoryOverlays;
  return seedCategories
    .map((c, i) => {
      const o = ov[c.slug];
      return {
        cat: {
          ...c,
          name: o?.name ?? c.name,
          tagline: o?.tagline ?? c.tagline,
          summary: o?.summary ?? c.summary,
        } as Category,
        order: o?.order ?? i,
        hidden: o?.hidden ?? false,
      };
    })
    .filter((x) => !x.hidden)
    .sort((a, b) => a.order - b.order)
    .map((x) => x.cat);
}

export function getCategoryMerged(slug: string): Category | undefined {
  return allCategoriesMerged().find((c) => c.slug === slug);
}

/** Загруженный баннер категории (если есть). */
export function categoryBanner(slug: string): string | undefined {
  return readData().categoryOverlays[slug]?.bannerImage;
}
