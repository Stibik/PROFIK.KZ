import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/company';
import { categories } from '@/lib/categories';
import { products } from '@/lib/products';
import { articles } from '@/lib/content';

/**
 * sitemap.xml (Том 5, п. 5.1). Автогенерируемый, не статический. Товары,
 * снятые с производства, исключаются (Том 5, п. 5.1). В боевой версии
 * перестраивается по тому же вебхуку, что и каталог.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/catalog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/podbor/meshok`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/knowledge`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/resheniya/zal-pod-klyuch`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/resheniya/gos-zakupki`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/resheniya/turnir`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/catalog/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.stockStatus !== 'discontinued')
    .map((p) => ({
      url: `${siteUrl}/catalog/${p.categorySlug}/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteUrl}/knowledge/${a.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...articlePages];
}
