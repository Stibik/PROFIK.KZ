'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from './auth';
import { writeData, logAction, type Review } from './store';
import type { SalesChannel } from '../types';

/** Сохранить витринные поля товара (Том 7, п. 7.3). Цены/остатки не трогаем. */
export async function saveProductOverlay(formData: FormData) {
  requireAuth();
  const sku = String(formData.get('sku'));
  const overlay = {
    salesChannel: (String(formData.get('salesChannel')) as SalesChannel) || undefined,
    kaspiUrl: String(formData.get('kaspiUrl') || '') || undefined,
    description: String(formData.get('description') || '') || undefined,
    seoTitle: String(formData.get('seoTitle') || '') || undefined,
    seoDescription: String(formData.get('seoDescription') || '') || undefined,
    relatedSkus: String(formData.get('relatedSkus') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  };
  writeData((d) => {
    d.productOverlays[sku] = overlay;
  });
  logAction('Контент-менеджер', `Изменены витринные поля товара ${sku}`);
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${sku}`);
  redirect('/admin/products?saved=' + encodeURIComponent(sku));
}

/** Добавить заказ вручную (можно указать номер) — Том 7, раздел «Заказы». */
export async function addOrder(formData: FormData) {
  requireAuth();
  const number = String(formData.get('number') || '').trim();
  const date = String(formData.get('date') || '').trim();
  if (!number || !date) redirect('/admin/orders?e=req');
  writeData((d) => {
    d.orders.unshift({
      id: 'o' + Date.now().toString(36),
      number,
      date,
      customer: String(formData.get('customer') || '').trim() || '—',
      phone: String(formData.get('phone') || '').trim() || undefined,
      items: String(formData.get('items') || '').trim(),
      sum: Number(String(formData.get('sum') || '0').replace(/[^\d.-]/g, '')) || 0,
      channel: (String(formData.get('channel')) as 'kaspi' | 'site' | 'manual') || 'manual',
      status: (String(formData.get('status')) as 'new' | 'paid' | 'shipped' | 'done' | 'canceled') || 'new',
    });
  });
  logAction('Менеджер по продажам', `Добавлен заказ ${number}`);
  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  redirect('/admin/orders?saved=1');
}

export async function setOrderStatus(formData: FormData) {
  requireAuth();
  const id = String(formData.get('id'));
  const status = String(formData.get('status')) as 'new' | 'paid' | 'shipped' | 'done' | 'canceled';
  writeData((d) => {
    const o = d.orders.find((x) => x.id === id);
    if (o) o.status = status;
  });
  revalidatePath('/admin/orders');
  revalidatePath('/admin');
}

export async function deleteOrder(formData: FormData) {
  requireAuth();
  const id = String(formData.get('id'));
  writeData((d) => {
    d.orders = d.orders.filter((o) => o.id !== id);
  });
  logAction('Менеджер по продажам', `Удалён заказ ${id}`);
  revalidatePath('/admin/orders');
  revalidatePath('/admin');
}

export async function saveKaspiSettings(formData: FormData) {
  requireAuth();
  writeData((d) => {
    d.settings = {
      kaspiToken: String(formData.get('kaspiToken') || '').trim() || undefined,
      kaspiShop: String(formData.get('kaspiShop') || '').trim() || undefined,
    };
  });
  logAction('Владелец', 'Обновлены настройки интеграции Kaspi');
  revalidatePath('/admin/orders');
  redirect('/admin/orders?kaspi=saved');
}

/** Сохранить контент категории (Том 7): баннер, тексты, порядок, SEO. */
export async function saveCategoryOverlay(formData: FormData) {
  requireAuth();
  const slug = String(formData.get('slug'));
  writeData((d) => {
    const cur = d.categoryOverlays[slug] ?? {};
    d.categoryOverlays[slug] = {
      ...cur,
      name: String(formData.get('name') || '') || undefined,
      tagline: String(formData.get('tagline') || '') || undefined,
      summary: String(formData.get('summary') || '') || undefined,
      seoTitle: String(formData.get('seoTitle') || '') || undefined,
      seoDescription: String(formData.get('seoDescription') || '') || undefined,
      order: formData.get('order') ? Number(formData.get('order')) : undefined,
      hidden: formData.get('hidden') === 'on',
    };
  });
  logAction('Контент-менеджер', `Изменена категория ${slug}`);
  revalidatePath('/', 'layout');
  redirect('/admin/categories?saved=' + encodeURIComponent(slug));
}

/** Удалить загруженное фото товара (Том 7, п. 7.3) */
export async function deleteProductMedia(formData: FormData) {
  requireAuth();
  const sku = String(formData.get('sku'));
  const url = String(formData.get('url'));
  writeData((d) => {
    const cur = d.productOverlays[sku];
    if (cur?.media) cur.media = cur.media.filter((m) => m !== url);
  });
  logAction('Контент-менеджер', `Удалено фото товара ${sku}`);
  revalidatePath(`/admin/products/${sku}`);
  revalidatePath('/', 'layout');
}

/** Массовая смена канала продажи (Том 7, п. 7.3) */
export async function bulkSetChannel(formData: FormData) {
  requireAuth();
  const channel = String(formData.get('channel')) as SalesChannel;
  const skus = formData.getAll('sku').map(String);
  writeData((d) => {
    for (const sku of skus) {
      d.productOverlays[sku] = { ...(d.productOverlays[sku] ?? {}), salesChannel: channel };
    }
  });
  logAction('Контент-менеджер', `Массовая смена канала (${channel}) для ${skus.length} товаров`);
  revalidatePath('/admin/products');
  redirect('/admin/products?bulk=' + skus.length);
}

/** Модерация отзыва (Том 7, п. 7.5) */
export async function setReviewStatus(formData: FormData) {
  requireAuth();
  const id = String(formData.get('id'));
  const status = String(formData.get('status')) as Review['status'];
  writeData((d) => {
    const r = d.reviews.find((x) => x.id === id);
    if (r) r.status = status;
  });
  logAction('Контент-менеджер', `Отзыв ${id} → ${status}`);
  revalidatePath('/admin/reviews');
}

export async function replyReview(formData: FormData) {
  requireAuth();
  const id = String(formData.get('id'));
  const reply = String(formData.get('reply') || '');
  writeData((d) => {
    const r = d.reviews.find((x) => x.id === id);
    if (r) r.reply = reply;
  });
  logAction('Контент-менеджер', `Ответ на отзыв ${id}`);
  revalidatePath('/admin/reviews');
}

/** Добавить отзыв вручную — источник обязателен (Том 7, п. 7.5) */
export async function addReview(formData: FormData) {
  requireAuth();
  const source = String(formData.get('source') || '').trim();
  const date = String(formData.get('date') || '').trim();
  if (!source || !date) {
    // технический барьер: без даты и источника не сохраняем (Том 7, п. 7.5)
    redirect('/admin/reviews?e=source');
  }
  writeData((d) => {
    d.reviews.unshift({
      id: 'r' + Date.now().toString(36),
      sku: String(formData.get('sku') || ''),
      author: String(formData.get('author') || 'Клиент'),
      rating: Number(formData.get('rating') || 5),
      text: String(formData.get('text') || ''),
      date,
      source,
      status: 'pending',
    });
  });
  logAction('Контент-менеджер', 'Добавлен отзыв вручную');
  revalidatePath('/admin/reviews');
  redirect('/admin/reviews');
}

/** Пометить заявку обработанной (Том 7, п. 7.1 — раздел «Заявки») */
export async function setLeadStatus(formData: FormData) {
  requireAuth();
  const id = String(formData.get('id'));
  const status = String(formData.get('status')) as 'new' | 'processed';
  writeData((d) => {
    const l = d.leads.find((x) => x.id === id);
    if (l) l.status = status;
  });
  logAction('Менеджер по продажам', `Заявка ${id} → ${status}`);
  revalidatePath('/admin/leads');
}

/** Конструктор главной (Том 7, п. 7.4): порядок, скрытие, публикация. */
export async function moveHomeBlock(formData: FormData) {
  requireAuth();
  const id = String(formData.get('id'));
  const dir = String(formData.get('dir')); // up | down
  writeData((d) => {
    const arr = d.home.draft;
    const i = arr.findIndex((b) => b.id === id);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i >= 0 && j >= 0 && j < arr.length) [arr[i], arr[j]] = [arr[j], arr[i]];
  });
  revalidatePath('/admin/home');
}

export async function toggleHomeBlock(formData: FormData) {
  requireAuth();
  const id = String(formData.get('id'));
  writeData((d) => {
    const b = d.home.draft.find((x) => x.id === id);
    if (b) b.hidden = !b.hidden;
  });
  revalidatePath('/admin/home');
}

export async function publishHome() {
  requireAuth();
  writeData((d) => {
    d.home.published = d.home.draft.map((b) => ({ ...b }));
  });
  logAction('Контент-менеджер', 'Опубликована новая версия главной страницы');
  revalidatePath('/admin/home');
  revalidatePath('/'); // применяем на живой сайт
}

export async function resetHomeDraft() {
  requireAuth();
  writeData((d) => {
    d.home.draft = d.home.published.map((b) => ({ ...b }));
  });
  revalidatePath('/admin/home');
}
