import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type { SalesChannel } from '../types';
import { products } from '../products';

/**
 * Хранилище данных, которыми управляет САЙТ (Том 0, п. 0.1; Том 7, п. 7.3):
 * витринные поля товара, отзывы, заявки, конфигурация главной, журнал действий.
 * Цены/остатки/номенклатура здесь НЕ хранятся — это зона PFS APP.
 *
 * Для прототипа — JSON-файл на диске (на Render ФС записываемая). В бою
 * заменяется на PostgreSQL базы сайта (Том 0, п. 0.4).
 */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'admin.json');

export interface ProductOverlay {
  salesChannel?: SalesChannel;
  kaspiUrl?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  relatedSkus?: string[];
}

export interface Review {
  id: string;
  sku: string;
  author: string;
  rating: number;
  text: string;
  date: string; // реальная дата обращения (Том 3, п. 3.7)
  source: string; // обязателен для внутреннего учёта (Том 7, п. 7.5)
  status: 'pending' | 'published' | 'rejected';
  reply?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  comment?: string;
  source: string;
  sku?: string;
  at: string;
  status: 'new' | 'processed';
}

export interface HomeBlock {
  id: string;
  title: string;
  hidden: boolean;
}

export interface LogEntry {
  id: string;
  at: string;
  user: string;
  action: string;
}

export interface AdminData {
  productOverlays: Record<string, ProductOverlay>;
  reviews: Review[];
  leads: Lead[];
  home: { draft: HomeBlock[]; published: HomeBlock[] };
  log: LogEntry[];
}

const DEFAULT_HOME_BLOCKS: HomeBlock[] = [
  { id: 'hero', title: 'Герой-блок', hidden: false },
  { id: 'audience', title: 'Три входа по аудитории', hidden: false },
  { id: 'categories', title: 'Категории каталога', hidden: false },
  { id: 'manufacture', title: 'Мы производим, а не перепродаём', hidden: false },
  { id: 'cases', title: 'Кейсы оборудованных залов', hidden: false },
  { id: 'madeToOrder', title: 'Изготовление под заказ', hidden: false },
  { id: 'numbers', title: 'Цифры и доверие', hidden: false },
  { id: 'knowledge', title: 'База знаний / статьи', hidden: false },
  { id: 'finalCta', title: 'Финальный призыв', hidden: false },
];

function seed(): AdminData {
  return {
    productOverlays: {},
    reviews: [
      {
        id: 'r1',
        sku: 'MSH-120-40',
        author: 'Тренер, клуб «Батыр»',
        rating: 5,
        text: 'Взяли четыре мешка в зал. Шьют крепко, швы держат, за полгода интенсивных тренировок ни одного нарекания.',
        date: '2026-05-14',
        source: 'звонок клиенту',
        status: 'published',
      },
      {
        id: 'r2',
        sku: 'MSH-120-40',
        author: 'Аскар',
        rating: 4,
        text: 'Хороший мешок, но приехал на день позже обещанного.',
        date: '2026-06-02',
        source: 'форма на сайте',
        status: 'pending',
      },
      {
        id: 'r3',
        sku: 'MAN-BOR-160',
        author: 'ДЮСШ №3',
        rating: 5,
        text: 'Манекен под наш рост, дети занимаются с удовольствием. Спасибо за документы для бухгалтерии.',
        date: '2026-06-20',
        source: 'перенос с Kaspi',
        status: 'pending',
      },
    ],
    leads: [
      {
        id: 'l1',
        name: 'Ерлан',
        phone: '+7 701 000 00 00',
        comment: 'Нужен мешок 50 кг под тайский бокс, зал в Астане.',
        source: 'product-MSH-150-55',
        sku: 'MSH-150-55',
        at: '2026-07-30T09:12:00.000Z',
        status: 'new',
      },
    ],
    home: { draft: DEFAULT_HOME_BLOCKS, published: DEFAULT_HOME_BLOCKS },
    log: [{ id: 'g1', at: '2026-07-30T09:00:00.000Z', user: 'Владелец', action: 'Первый вход в админку' }],
  };
}

function ensure(): AdminData {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
      const s = seed();
      fs.writeFileSync(DATA_FILE, JSON.stringify(s, null, 2));
      return s;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as AdminData;
  } catch {
    // ФС только для чтения (напр. на serverless) — работаем с сидом в памяти
    return seed();
  }
}

export function readData(): AdminData {
  return ensure();
}

export function writeData(mutator: (d: AdminData) => void): AdminData {
  const d = ensure();
  mutator(d);
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
  } catch {
    /* ФС только для чтения — изменения не персистятся, но UI отработает */
  }
  return d;
}

export function logAction(user: string, action: string) {
  writeData((d) => {
    d.log.unshift({ id: 'a' + d.log.length + Date.now().toString(36), at: new Date().toISOString(), user, action });
    d.log = d.log.slice(0, 500); // хранение (Том 7, п. 7.8)
  });
}

/** Слить сид товара с витринным оверлеем (то, что редактируется на сайте). */
export function getOverlay(sku: string): ProductOverlay {
  return readData().productOverlays[sku] ?? {};
}

/** Публичные отзывы по товару (Том 3, п. 3.7: только опубликованные). */
export function publishedReviews(sku: string): Review[] {
  return readData().reviews.filter((r) => r.sku === sku && r.status === 'published');
}

export function appendLead(lead: Omit<Lead, 'id' | 'at' | 'status'>) {
  writeData((d) => {
    d.leads.unshift({ ...lead, id: 'l' + Date.now().toString(36), at: new Date().toISOString(), status: 'new' });
  });
}
