import 'server-only';
import type { Product, Category } from './types';
import { products as seedProducts } from './products';
import { categories as seedCategories } from './categories';
import { readData, type ProductOverlay, type StoredProduct } from './admin/store';

/**
 * Слой доступа к каталогу с наложением правок из админки (локальная копия,
 * Том 0, п. 0.3). Серверный — используется в серверных страницах. Каталог =
 * сид + товары, созданные импортом Excel. Поля цены/остатка приходят «фидом»
 * из импорта, маркетинговые фото и витринные поля — из ручных правок.
 */
function applyOverlay(p: Product, o?: ProductOverlay): Product {
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
}

function storedToProduct(sp: StoredProduct): Product {
  return {
    sku: sp.sku,
    slug: sp.slug,
    categorySlug: sp.categorySlug,
    name: sp.name,
    attributes: sp.attributes,
    priceRetail: sp.priceRetail,
    priceFrom: sp.priceFrom,
    stockStatus: sp.stockStatus,
    productionDays: sp.productionDays,
    salesChannel: sp.salesChannel,
    kaspiUrl: sp.kaspiUrl,
    made: sp.made,
    keyParams: sp.keyParams,
    description: sp.description,
    updatedAt: sp.updatedAt,
  };
}

export function allProducts(): Product[] {
  const d = readData();
  const ov = d.productOverlays;
  const seedIds = new Set(seedProducts.map((p) => p.sku));
  const base = seedProducts.map((p) => applyOverlay(p, ov[p.sku]));
  const imported = Object.values(d.importedProducts)
    .filter((sp) => !seedIds.has(sp.sku))
    .map((sp) => applyOverlay(storedToProduct(sp), ov[sp.sku]));
  return [...base, ...imported];
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
