import 'server-only';
import { readData } from './store';
import { products } from '../products';

/**
 * Данные дашборда (Том 7, п. 7.2). В бою: визиты/конверсия — из GA4, заявки и
 * переходы на Kaspi — из базы сайта, статистика продаж — из PFS APP. Здесь —
 * демонстрационные значения + реальные заявки из локального хранилища.
 */
export function dashboardStats() {
  const data = readData();
  const leads = data.leads.length;
  const visits = 12850;
  return {
    kpis: [
      { label: 'Визиты на сайт', value: visits.toLocaleString('ru-RU'), delta: '+8%', up: true },
      { label: 'Заявки', value: String(leads + 27), delta: '+12%', up: true },
      { label: 'Конверсия в заявку', value: '2.2%', delta: '+0.3%', up: true },
      { label: 'Переходы на Kaspi', value: '156', delta: '+5%', up: true },
      { label: 'Топ источник', value: 'Google', delta: '62%', up: true },
    ],
    // тренд по дням (демо) — линия важнее точечных значений (Том 7, п. 7.2)
    trend: [42, 51, 48, 63, 59, 71, 68, 82, 77, 91, 84, 96, 88, 102],
    topByViews: products.slice(0, 5).map((p, i) => ({ name: p.name, sku: p.sku, value: 1200 - i * 180 })),
    topByLeads: [...products].slice(2, 7).map((p, i) => ({ name: p.name, sku: p.sku, value: 24 - i * 4 })),
    topPages: [
      { page: '/catalog/boksyorskie-meshki', value: '3 210' },
      { page: '/ (главная)', value: '2 040' },
      { page: '/catalog/boksyorskie-meshki/meshok-pfs-120', value: '1 180' },
      { page: '/podbor/meshok', value: '860' },
      { page: '/knowledge/kak-vybrat-ves-meshka', value: '540' },
    ],
    alerts: [
      { level: 'ok', text: 'API PFS APP доступен, последняя сверка прошла ночью без расхождений.' },
      { level: 'warn', text: `Отзывов на модерации: ${data.reviews.filter((r) => r.status === 'pending').length}.` },
      { level: 'warn', text: `Новых заявок: ${data.leads.filter((l) => l.status === 'new').length}.` },
    ],
  };
}
