import { NextResponse } from 'next/server';
import { appendLead } from '@/lib/admin/store';

/**
 * Приём заявки с сайта (Том 0, п. 0.2: POST /api/v1/leads).
 * В боевой версии заявка передаётся в PFS APP; при недоступности API
 * встаёт в очередь на стороне сайта и ни при каком сбое не теряется
 * (Том 4, п. 4.2). Здесь — заглушка приёма для автономной работы витрины:
 * валидируем и подтверждаем, реальную передачу подключаем к API PFS APP.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  const phone = String(body.phone ?? '').trim();

  if (!name || phone.replace(/\D/g, '').length < 10) {
    return NextResponse.json({ ok: false, error: 'validation' }, { status: 422 });
  }

  // TODO: передать в PFS APP (POST /api/v1/leads) или поставить в очередь
  // при недоступности (Том 4, п. 4.2). Пока — складываем в базу сайта,
  // откуда заявка видна в админке (раздел «Заявки»).
  appendLead({
    name,
    phone,
    comment: String(body.comment ?? '').slice(0, 2000),
    source: String(body.source ?? 'site'),
    sku: body.sku ? String(body.sku) : undefined,
  });

  return NextResponse.json({ ok: true });
}
