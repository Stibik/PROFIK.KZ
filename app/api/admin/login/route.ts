import { NextResponse } from 'next/server';
import { checkPassword, sessionCookieValue, COOKIE_NAME } from '@/lib/admin/auth';
import { logAction } from '@/lib/admin/store';

export async function POST(request: Request) {
  const form = await request.formData();
  const pw = String(form.get('password') ?? '');

  if (!checkPassword(pw)) {
    return NextResponse.redirect(new URL('/admin/login?e=1', request.url), { status: 303 });
  }

  logAction('Владелец', 'Вход в админку');
  const res = NextResponse.redirect(new URL('/admin', request.url), { status: 303 });
  res.cookies.set(COOKIE_NAME, sessionCookieValue('owner'), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // сессия истекает по таймауту (Том 8, п. 8.5)
  });
  return res;
}
