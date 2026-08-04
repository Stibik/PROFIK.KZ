'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Category, Product } from '@/lib/types';
import ProductCard from './ProductCard';
import LeadCTA from './LeadCTA';

/**
 * Листинг категории с фильтрами (Том 2, п. 2.6). Требования, каждое из которых
 * решает конкретную проблему:
 *  — применение без перезагрузки, URL через History API (ссылку можно отправить);
 *  — счётчик у каждого значения, ноль — неактивно, не скрывается;
 *  — нет тупиков: пустая выдача → предложение изготовить, а не пустой экран;
 *  — мобильные фильтры в шторке снизу с кнопкой «Показать N»;
 *  — выбранные фильтры чипами с крестиком;
 *  — сортировка управляемая.
 */

type SortKey = 'popular' | 'price_asc' | 'price_desc' | 'new' | 'available';

export default function CategoryListing({ category, products }: { category: Category; products: Product[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  // ── чтение фильтров из URL ────────────────────────────────────────────
  const getRange = useCallback(
    (key: string): [number | null, number | null] => {
      const raw = params.get(key);
      if (!raw) return [null, null];
      const [a, b] = raw.split('-');
      return [a ? Number(a) : null, b ? Number(b) : null];
    },
    [params],
  );
  const getSet = useCallback(
    (key: string): string[] => {
      const raw = params.get(key);
      return raw ? raw.split(',').map(decodeURIComponent) : [];
    },
    [params],
  );
  const availableOnly = params.get('availability') === '1';
  const sort = (params.get('sort') as SortKey) || 'popular';

  // ── запись фильтров в URL (History API, без перезагрузки) ─────────────
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );

  const toggleSetValue = useCallback(
    (key: string, value: string) => {
      const cur = getSet(key);
      const has = cur.includes(value);
      const nextArr = has ? cur.filter((v) => v !== value) : [...cur, value];
      setParam(key, nextArr.length ? nextArr.map(encodeURIComponent).join(',') : null);
    },
    [getSet, setParam],
  );

  // ── применение фильтров к товару ─────────────────────────────────────
  const matches = useCallback(
    (p: Product, skipKey?: string): boolean => {
      for (const f of category.filters) {
        if (f.key === skipKey) continue;
        if (f.type === 'range') {
          if (f.key === 'price') {
            const [mn, mx] = getRange('price');
            if (mn != null || mx != null) {
              if (p.priceRetail == null) return false;
              if (mn != null && p.priceRetail < mn) return false;
              if (mx != null && p.priceRetail > mx) return false;
            }
          } else {
            const [mn, mx] = getRange(f.key);
            const v = Number(p.attributes[f.key]);
            if (mn != null && (isNaN(v) || v < mn)) return false;
            if (mx != null && (isNaN(v) || v > mx)) return false;
          }
        } else if (f.type === 'checkbox') {
          const sel = getSet(f.key);
          if (sel.length) {
            const v = String(p.attributes[f.key] ?? '');
            if (!sel.includes(v)) return false;
          }
        } else if (f.type === 'toggle' && f.key === 'availability') {
          if (availableOnly && p.stockStatus !== 'in_stock') return false;
        }
      }
      return true;
    },
    [category.filters, getRange, getSet, availableOnly],
  );

  const filtered = useMemo(() => products.filter((p) => matches(p)), [products, matches]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case 'price_asc':
        return arr.sort((a, b) => (a.priceRetail ?? Infinity) - (b.priceRetail ?? Infinity));
      case 'price_desc':
        return arr.sort((a, b) => (b.priceRetail ?? -1) - (a.priceRetail ?? -1));
      case 'new':
        return arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      case 'available':
        return arr.sort((a, b) => Number(b.stockStatus === 'in_stock') - Number(a.stockStatus === 'in_stock'));
      default:
        return arr; // популярность = порядок из PFS APP
    }
  }, [filtered, sort]);

  // счётчик у значения чекбокса: сколько товаров при прочих активных фильтрах
  const optionCount = useCallback(
    (key: string, value: string): number =>
      products.filter((p) => matches(p, key) && String(p.attributes[key] ?? '') === value).length,
    [products, matches],
  );

  // ── активные чипы ────────────────────────────────────────────────────
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  for (const f of category.filters) {
    if (f.type === 'checkbox') {
      for (const v of getSet(f.key)) chips.push({ key: f.key + v, label: v, onRemove: () => toggleSetValue(f.key, v) });
    } else if (f.type === 'range') {
      const [mn, mx] = getRange(f.key);
      if (mn != null || mx != null)
        chips.push({
          key: f.key,
          label: `${f.label}: ${mn ?? '…'}–${mx ?? '…'}${f.unit ? ' ' + f.unit : ''}`,
          onRemove: () => setParam(f.key, null),
        });
    } else if (f.type === 'toggle' && availableOnly) {
      chips.push({ key: 'availability', label: 'В наличии', onRemove: () => setParam('availability', null) });
    }
  }

  const clearAll = () => router.replace('?', { scroll: false });

  const Filters = (
    <div className="space-y-6">
      {category.filters.map((f) => (
        <fieldset key={f.key}>
          <legend className="mb-2 text-sm font-semibold text-white">{f.label}</legend>
          {f.type === 'range' && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder={f.min != null ? String(f.min) : 'от'}
                defaultValue={getRange(f.key)[0] ?? ''}
                onBlur={(e) => {
                  const [, mx] = getRange(f.key);
                  const v = e.target.value;
                  setParam(f.key, v || mx != null ? `${v}-${mx ?? ''}` : null);
                }}
                className="w-full rounded-md border border-ink-600 bg-ink-800 px-2 py-1.5 text-sm"
              />
              <span className="text-steel-500">–</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder={f.max != null ? String(f.max) : 'до'}
                defaultValue={getRange(f.key)[1] ?? ''}
                onBlur={(e) => {
                  const [mn] = getRange(f.key);
                  const v = e.target.value;
                  setParam(f.key, mn != null || v ? `${mn ?? ''}-${v}` : null);
                }}
                className="w-full rounded-md border border-ink-600 bg-ink-800 px-2 py-1.5 text-sm"
              />
              {f.unit && <span className="text-xs text-steel-500">{f.unit}</span>}
            </div>
          )}
          {f.type === 'checkbox' && (
            <div className="space-y-1.5">
              {f.options?.map((opt) => {
                const n = optionCount(f.key, opt);
                const checked = getSet(f.key).includes(opt);
                return (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center gap-2 text-sm ${
                      n === 0 && !checked ? 'opacity-40' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSetValue(f.key, opt)}
                      className="h-4 w-4 rounded border-ink-500 bg-ink-800 accent-accent"
                    />
                    <span className="flex-1 text-steel-200">{opt}</span>
                    <span className="text-xs text-steel-500">{n}</span>
                  </label>
                );
              })}
            </div>
          )}
          {f.type === 'toggle' && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setParam('availability', e.target.checked ? '1' : null)}
                className="h-4 w-4 rounded border-ink-500 bg-ink-800 accent-accent"
              />
              <span className="text-steel-200">Только в наличии</span>
            </label>
          )}
        </fieldset>
      ))}
    </div>
  );

  return (
    <div className="grid gap-8 md:grid-cols-[240px_1fr]">
      {/* Боковая панель фильтров (десктоп) */}
      <aside className="hidden md:block">
        <div className="sticky top-24 rounded-lg border border-ink-700 bg-ink-900 p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Фильтры</span>
            {chips.length > 0 && (
              <button onClick={clearAll} className="text-xs text-steel-400 hover:text-white">Сбросить</button>
            )}
          </div>
          {Filters}
        </div>
      </aside>

      <div>
        {/* Панель управления: сортировка + чипы + мобильная кнопка */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button onClick={() => setSheetOpen(true)} className="btn-secondary py-2 md:hidden">
            Фильтры{chips.length ? ` (${chips.length})` : ''}
          </button>
          <span className="text-sm text-steel-400">{sorted.length} товаров</span>
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value === 'popular' ? null : e.target.value)}
            className="ml-auto rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-sm"
            aria-label="Сортировка"
          >
            <option value="popular">По популярности</option>
            <option value="price_asc">Сначала дешевле</option>
            <option value="price_desc">Сначала дороже</option>
            <option value="new">Новинки</option>
            <option value="available">Сначала в наличии</option>
          </select>
        </div>

        {chips.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c.key}
                onClick={c.onRemove}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-500 bg-ink-800 px-3 py-1 text-xs text-steel-200 hover:border-accent/50"
              >
                {c.label}
                <span className="text-steel-500">✕</span>
              </button>
            ))}
          </div>
        )}

        {sorted.length === 0 ? (
          // Никаких тупиков (Том 2, п. 2.6): пустая выдача — это лид
          <div className="card flex flex-col items-center gap-4 p-10 text-center">
            <span className="text-3xl">🛠️</span>
            <div>
              <h3 className="text-lg">Под ваши параметры готовых нет</h3>
              <p className="mt-2 max-w-md text-sm text-steel-400">
                Но мы это изготовим. Опишите, что нужно — рассчитаем нестандартный вариант за час.
              </p>
            </div>
            <LeadCTA
              label="Рассчитать под мои параметры"
              source={`empty-${category.slug}`}
              title="Изготовление под заказ"
              defaultComment={`Категория: ${category.name}. Нужные параметры: `}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Мобильная шторка снизу (Том 2, п. 2.6) */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 md:hidden" onClick={() => setSheetOpen(false)}>
          <div className="max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-ink-600 bg-ink-900 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold text-white">Фильтры</span>
              <button onClick={clearAll} className="text-xs text-steel-400">Сбросить</button>
            </div>
            {Filters}
            <button onClick={() => setSheetOpen(false)} className="btn-primary mt-6 w-full">
              Показать {sorted.length} товаров
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
