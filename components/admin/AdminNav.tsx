'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Разделы админки (Том 7, п. 7.1) */
const sections = [
  { href: '/admin', label: 'Панель управления', icon: '📊', exact: true },
  { href: '/admin/products', label: 'Товары', icon: '🛍', note: 'чтение' },
  { href: '/admin/categories', label: 'Категории', icon: '📁' },
  { href: '/admin/home', label: 'Главная страница', icon: '🖼' },
  { href: '/admin/articles', label: 'База знаний', icon: '📝' },
  { href: '/admin/reviews', label: 'Отзывы', icon: '💬' },
  { href: '/admin/cases', label: 'Кейсы залов', icon: '🏆' },
  { href: '/admin/seo', label: 'SEO', icon: '🔍' },
  { href: '/admin/geo', label: 'Гео-страницы', icon: '📍' },
  { href: '/admin/orders', label: 'Заказы', icon: '📦' },
  { href: '/admin/leads', label: 'Заявки', icon: '📨' },
  { href: '/admin/users', label: 'Пользователи и роли', icon: '👥' },
  { href: '/admin/log', label: 'Журнал действий', icon: '📋' },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="space-y-0.5">
      {sections.map((s) => {
        const active = s.exact ? path === s.href : path.startsWith(s.href);
        return (
          <Link
            key={s.href}
            href={s.href}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
              active ? 'bg-accent/15 text-white' : 'text-steel-300 hover:bg-ink-800 hover:text-white'
            }`}
          >
            <span className="text-base">{s.icon}</span>
            <span className="flex-1">{s.label}</span>
            {s.note && <span className="text-[10px] uppercase text-steel-500">{s.note}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
