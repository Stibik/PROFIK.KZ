import type { Metadata } from 'next';
import Link from 'next/link';
import '../globals.css';
import AdminNav from '@/components/admin/AdminNav';
import { isAuthed } from '@/lib/admin/auth';

export const metadata: Metadata = {
  title: { default: 'Админка Profik.kz', template: '%s · Админка PFS' },
  robots: { index: false, follow: false }, // /admin закрыт от индексации (Том 5, п. 5.1)
};

// Админка всегда динамическая (сессия, изменяемые данные)
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // На странице логина и при отсутствии сессии — без оболочки.
  // Защищённые страницы сами вызывают requireAuth() и отрисуются только в шелле.
  if (!isAuthed()) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-ink-950 text-steel-100">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-800 bg-ink-900 md:flex">
        <div className="flex items-center justify-between border-b border-ink-800 px-4 py-4">
          <Link href="/admin" className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-white">PFS</span>
            <span className="text-xs text-steel-400">админка</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <AdminNav />
        </div>
        <div className="border-t border-ink-800 p-3">
          <Link href="/" className="mb-1 block rounded-md px-3 py-2 text-sm text-steel-300 hover:bg-ink-800 hover:text-white" target="_blank">
            ↗ Открыть сайт
          </Link>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="w-full rounded-md px-3 py-2 text-left text-sm text-steel-400 hover:bg-ink-800 hover:text-white">
              Выйти
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Мобильная шапка админки */}
        <header className="flex items-center gap-3 border-b border-ink-800 bg-ink-900 px-4 py-3 md:hidden">
          <Link href="/admin" className="text-lg font-black text-white">PFS</Link>
          <span className="text-xs text-steel-400">админка</span>
          <form action="/api/admin/logout" method="post" className="ml-auto">
            <button className="text-sm text-steel-400">Выйти</button>
          </form>
        </header>
        {/* Мобильная навигация — горизонтальная лента */}
        <div className="overflow-x-auto border-b border-ink-800 bg-ink-900 px-2 py-2 md:hidden">
          <div className="w-max"><AdminNav /></div>
        </div>
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
