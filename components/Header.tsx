'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import { company } from '@/lib/company';
import { categories } from '@/lib/categories';

/**
 * Шапка (Том 4, п. 4.1): логотип, поиск, каталог, телефон, WhatsApp,
 * переключатель RU/KK. Поиск всегда на виду на всех разрешениях (Том 2).
 */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-950/90 backdrop-blur">
      <div className="container-page">
        <div className="flex items-center gap-3 py-3 md:gap-6">
          <Link href="/" className="flex shrink-0 items-baseline gap-1.5" aria-label="Profik.kz — главная">
            <span className="text-xl font-black tracking-tight text-white">PFS</span>
            <span className="hidden text-sm font-medium text-steel-400 xs:inline">Profik.kz</span>
          </Link>

          {/* Поиск — всегда на виду, открытое поле (Том 2, режим 1) */}
          <div className="hidden min-w-0 flex-1 sm:block">
            <SearchBar />
          </div>

          <nav className="ml-auto hidden items-center gap-5 text-sm md:flex">
            <Link href="/catalog" className="font-medium text-steel-200 transition-colors hover:text-white">
              Каталог
            </Link>
            <Link href="/podbor/meshok" className="font-medium text-steel-200 transition-colors hover:text-white">
              Подбор
            </Link>
            <Link href="/#production" className="font-medium text-steel-200 transition-colors hover:text-white">
              Производство
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <a
              href={company.phoneHref}
              className="hidden text-sm font-semibold text-white lg:inline"
            >
              {company.phone}
            </a>
            <LangSwitch />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-md p-2 text-steel-200 hover:bg-ink-800 md:hidden"
              aria-label="Меню"
              aria-expanded={menuOpen}
            >
              <BurgerIcon open={menuOpen} />
            </button>
          </div>
        </div>

        {/* Поиск на мобильном — отдельной строкой, тоже всегда на виду */}
        <div className="pb-3 sm:hidden">
          <SearchBar />
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-ink-700 bg-ink-950 md:hidden">
          <nav className="container-page flex flex-col py-2">
            <MobileLink href="/catalog" onClick={() => setMenuOpen(false)}>
              Каталог
            </MobileLink>
            {categories.map((c) => (
              <MobileLink key={c.slug} href={`/catalog/${c.slug}`} onClick={() => setMenuOpen(false)} sub>
                {c.emoji} {c.name}
              </MobileLink>
            ))}
            <MobileLink href="/podbor/meshok" onClick={() => setMenuOpen(false)}>
              Подбор мешка
            </MobileLink>
            <MobileLink href="/#production" onClick={() => setMenuOpen(false)}>
              Производство
            </MobileLink>
            <a href={company.phoneHref} className="px-1 py-3 text-sm font-semibold text-accent-400">
              {company.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  href,
  children,
  onClick,
  sub,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
  sub?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`border-b border-ink-800 py-3 text-sm ${
        sub ? 'pl-3 text-steel-300' : 'font-medium text-white'
      }`}
    >
      {children}
    </Link>
  );
}

function LangSwitch() {
  // Мультиязычность RU/KK заложена с запуска (Том 0, п. 0.5). Казахская версия —
  // отдельный этап перевода; здесь переключатель как заглушка структуры /kk.
  return (
    <div className="flex items-center rounded-md border border-ink-600 text-xs">
      <span className="rounded-l-md bg-ink-700 px-2 py-1 font-semibold text-white">RU</span>
      <span
        className="cursor-not-allowed px-2 py-1 text-steel-500"
        title="Казахская версия — отдельный этап (Том 0, п. 0.5)"
      >
        KK
      </span>
    </div>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}
