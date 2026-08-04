import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/admin/auth';

export const metadata: Metadata = { title: 'Вход в админку', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default function AdminLogin({ searchParams }: { searchParams: { e?: string } }) {
  if (isAuthed()) redirect('/admin');

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink-700 bg-ink-900 p-8">
        <div className="mb-6 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-white">PFS</span>
          <span className="text-sm text-steel-400">админка Profik.kz</span>
        </div>
        <form action="/api/admin/login" method="post" className="space-y-3">
          <input
            name="password"
            type="password"
            required
            autoFocus
            placeholder="Пароль"
            className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm text-steel-100 placeholder:text-steel-500 focus:border-steel-400 focus:outline-none"
          />
          {searchParams.e && <p className="text-sm text-accent-400">Неверный пароль.</p>}
          <button type="submit" className="btn-primary w-full">Войти</button>
        </form>
        <p className="mt-4 text-center text-xs text-steel-500">
          Демо-доступ: пароль <code className="text-steel-300">admin</code> (задаётся через ADMIN_PASSWORD).
        </p>
      </div>
    </div>
  );
}
