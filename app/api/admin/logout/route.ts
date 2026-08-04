import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/admin/auth';

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 });
  res.cookies.set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return res;
}
