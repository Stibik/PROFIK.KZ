import { categories } from './categories';
import type { Product } from './types';

export interface SearchHit {
  type: 'product' | 'category';
  title: string;
  subtitle: string;
  href: string;
  sku?: string;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/gi, ' ').trim();
}

/**
 * Мгновенный поиск (Том 2, режим 1). Чистая функция — принимает список товаров,
 * чтобы искать по актуальному каталогу (сид + импорт) на сервере. Базовая
 * нормализация под опечатки регистра/ё; Meilisearch — отдельный сервис на
 * будущее (Том 0, п. 0.4).
 */
export function runSearch(products: Product[], query: string, limit = 8): SearchHit[] {
  const q = norm(query);
  if (!q) return [];
  const terms = q.split(' ').filter(Boolean);

  const scoreProduct = (p: Product): number => {
    const hay = norm(
      [
        p.name,
        p.sku,
        p.categorySlug,
        ...p.keyParams.map((k) => `${k.label} ${k.value}`),
        ...Object.values(p.attributes).map(String),
      ].join(' '),
    );
    let score = 0;
    for (const t of terms) {
      if (!hay.includes(t)) return 0;
      score += 1;
      if (norm(p.sku).includes(t)) score += 3;
      if (norm(p.name).includes(t)) score += 2;
    }
    return score;
  };

  const productHits: SearchHit[] = products
    .map((p) => ({ p, score: scoreProduct(p) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ p }) => ({
      type: 'product' as const,
      title: p.name,
      subtitle: p.keyParams.map((k) => k.value).join(' · '),
      href: `/catalog/${p.categorySlug}/${p.slug}`,
      sku: p.sku,
    }));

  const categoryHits: SearchHit[] = categories
    .filter((c) => terms.every((t) => norm(c.name + ' ' + c.slug).includes(t)))
    .map((c) => ({
      type: 'category' as const,
      title: c.name,
      subtitle: 'Категория',
      href: `/catalog/${c.slug}`,
    }));

  return [...categoryHits, ...productHits].slice(0, limit);
}
