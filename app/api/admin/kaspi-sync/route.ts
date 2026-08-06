import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/admin/auth';
import { readData, logAction } from '@/lib/admin/store';

/**
 * Синхронизация заказов с Kaspi (Том 0: Kaspi как канал; см. также order-tracker
 * PFS APP). Честная заглушка: без реального токена ничего не тянем. При наличии
 * токена здесь идёт запрос к https://kaspi.kz/shop/api/... с маппингом заказов.
 */
export async function POST(request: Request) {
  if (!isAuthed()) return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 });

  const { settings } = readData();
  if (!settings.kaspiToken) {
    return NextResponse.redirect(new URL('/admin/orders?kaspi=notoken', request.url), { status: 303 });
  }

  // TODO: реальный вызов Kaspi Orders API с settings.kaspiToken и маппинг в Order[].
  // Пока токен не проверялся на боевом API — не выдаём фейковых заказов.
  logAction('Владелец', 'Запрошена синхронизация Kaspi (требуется проверка токена на боевом API)');
  return NextResponse.redirect(new URL('/admin/orders?kaspi=stub', request.url), { status: 303 });
}
