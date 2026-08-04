import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Простая cookie-авторизация админки для прототипа. В бою — полноценная
 * аутентификация с 2FA для ролей с публикацией (Том 8, п. 8.5) и хешированием
 * паролей (bcrypt/argon2). Здесь пароль в env, cookie подписана HMAC.
 */

const COOKIE = 'pfs_admin';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';

function sign(value: string): string {
  const mac = crypto.createHmac('sha256', SECRET).update(value).digest('hex').slice(0, 32);
  return `${value}.${mac}`;
}

function verify(token: string | undefined): string | null {
  if (!token) return null;
  const idx = token.lastIndexOf('.');
  if (idx < 0) return null;
  const value = token.slice(0, idx);
  if (sign(value) !== token) return null;
  return value;
}

export function checkPassword(pw: string): boolean {
  // сравнение постоянного времени
  const a = Buffer.from(pw);
  const b = Buffer.from(PASSWORD);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function sessionCookieValue(role = 'owner'): string {
  return sign(role);
}

export const COOKIE_NAME = COOKIE;

/** Текущая роль или null. Роли — Том 7, п. 7.7. */
export function currentRole(): string | null {
  const token = cookies().get(COOKIE)?.value;
  return verify(token);
}

export function isAuthed(): boolean {
  return currentRole() != null;
}

/** Защита страницы админки: редирект на логин, если нет сессии. */
export function requireAuth(): string {
  const role = currentRole();
  if (!role) redirect('/admin/login');
  return role;
}
