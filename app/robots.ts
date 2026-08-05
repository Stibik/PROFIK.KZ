import type { MetadataRoute } from 'next';
import { siteUrl, indexable } from '@/lib/company';

/**
 * robots.txt (Том 5, п. 5.1 + Том 6, п. 6.1).
 * На техническом домене (SITE_INDEXABLE != true) закрываем сайт целиком —
 * Этап 1 миграции (Том 0). На продакшене: служебное закрыто, ИИ-краулеры
 * явно допущены — блокировать их значит «закрыть магазин на амбарный замок».
 */
const aiBots = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'anthropic-ai',
  'Claude-Web',
  'PerplexityBot',
  'Google-Extended',
  'YandexGPT',
];

export default function robots(): MetadataRoute.Robots {
  if (!indexable) {
    // Технический домен — закрыто целиком (Том 0, миграция, Этап 1)
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  const disallow = ['/admin', '/api'];
  return {
    rules: [
      // Обычные поисковые роботы
      { userAgent: '*', allow: '/', disallow },
      // ИИ-краулеры — явно разрешены (Том 6, п. 6.1)
      ...aiBots.map((ua) => ({ userAgent: ua, allow: '/', disallow })),
    ],
    sitemap: [`${siteUrl}/sitemap.xml`],
    host: siteUrl,
  };
}
