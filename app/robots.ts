import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/company';

/**
 * robots.txt (Том 5, п. 5.1 + Том 6, п. 6.1).
 * Служебное закрыто; ИИ-краулеры явно допущены — блокировать их значит
 * «закрыть магазин на амбарный замок и жаловаться на отсутствие покупателей».
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
