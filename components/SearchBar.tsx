'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { search, type SearchHit } from '@/lib/search';

/**
 * Открытое поле поиска, всегда на виду (Том 2, режим 1). Не иконка-лупа,
 * а открытое поле с мгновенной выдачей по мере ввода.
 */
export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setHits(search(q));
    setActive(0);
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQ('');
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || hits.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(hits[active].href);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-md border border-ink-600 bg-ink-800 px-3 focus-within:border-steel-400">
        <SearchIcon />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={compact ? 'Поиск' : 'Поиск по каталогу — название, артикул, «мешок 40 кг»'}
          aria-label="Поиск по каталогу"
          className="w-full bg-transparent py-2.5 text-sm text-steel-100 placeholder:text-steel-400 focus:outline-none"
        />
      </div>

      {open && q.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border border-ink-600 bg-ink-900 shadow-xl">
          {hits.length === 0 ? (
            <div className="p-4 text-sm text-steel-400">
              Ничего не нашли по запросу «{q}».{' '}
              <Link href="/podbor/meshok" className="text-accent-400 hover:underline" onClick={() => setOpen(false)}>
                Подобрать через мастер
              </Link>
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto py-1">
              {hits.map((h, i) => (
                <li key={h.href}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(h.href)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      i === active ? 'bg-ink-700' : 'hover:bg-ink-800'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-steel-100">{h.title}</span>
                      <span className="block truncate text-xs text-steel-400">{h.subtitle}</span>
                    </span>
                    {h.sku && <span className="shrink-0 text-xs text-steel-500">{h.sku}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-steel-400" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
