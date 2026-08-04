'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { products } from '@/lib/products';
import { priceLabel } from '@/lib/format';
import LeadCTA from './LeadCTA';
import Thumb from './Thumb';

/**
 * Мастер подбора мешка (Том 9.1). Переводит бытовое описание («тренируюсь дома,
 * вешу 75 кг») в технический параметр — работу продавца-консультанта. Минимум
 * шагов, один вопрос на экран, мобильный приоритет, сохранение прогресса
 * в рамках сессии (Том 9.3). Формула веса скрыта, показывается результат.
 */

type Who = 'adult' | 'teen' | 'child';
type Level = 'beginner' | 'regular' | 'pro';
type Place = 'gym' | 'concrete' | 'drywall' | 'floor';

interface Answers {
  who?: Who;
  weight?: number;
  level?: Level;
  place?: Place;
}

const STORAGE_KEY = 'pfs_bag_wizard';

export default function BagWizard() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({});

  // сохранение прогресса в рамках сессии браузера (Том 9.3)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setA(saved.a ?? {});
        setStep(saved.step ?? 0);
      }
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ a, step }));
    } catch {
      /* ignore */
    }
  }, [a, step]);

  const totalSteps = a.who === 'child' ? 3 : 4; // ребёнку не спрашиваем вес/уровень

  const reset = () => {
    setA({});
    setStep(0);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      {step > 0 && step <= totalSteps && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-steel-400">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="hover:text-white">← Назад</button>
            <span>Шаг {step} из {totalSteps}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-ink-700">
            <div className="h-full bg-accent transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>
      )}

      {step === 0 && <Intro onStart={() => setStep(1)} />}

      {step === 1 && (
        <Question title="Для кого выбираете мешок?">
          <Choices
            options={[
              { v: 'adult', label: 'Для взрослого', emoji: '🧑' },
              { v: 'teen', label: 'Для подростка (12–16)', emoji: '🧒' },
              { v: 'child', label: 'Для ребёнка (до 12)', emoji: '👦' },
            ]}
            onPick={(v) => {
              setA((p) => ({ ...p, who: v as Who }));
              setStep(v === 'child' ? 3 : 2);
            }}
            active={a.who}
          />
        </Question>
      )}

      {step === 2 && (
        <Question title="Ваш вес и уровень подготовки">
          <WeightLevel
            weight={a.weight}
            level={a.level}
            onChange={(weight, level) => setA((p) => ({ ...p, weight, level }))}
            onNext={() => setStep(3)}
          />
        </Question>
      )}

      {step === 3 && (
        <Question title="Где будет висеть мешок?">
          <Choices
            options={[
              { v: 'gym', label: 'В зале, есть потолочное крепление', emoji: '🏟️' },
              { v: 'concrete', label: 'Дома, потолок бетонный', emoji: '🧱' },
              { v: 'drywall', label: 'Дома, гипсокартон / натяжной', emoji: '⚠️' },
              { v: 'floor', label: 'Напольный (крепление не нужно)', emoji: '🟢' },
            ]}
            onPick={(v) => {
              setA((p) => ({ ...p, place: v as Place }));
              setStep(4);
            }}
            active={a.place}
          />
        </Question>
      )}

      {step === 4 && <Result answers={a} onReset={reset} />}
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center">
      <div className="text-5xl">🥊</div>
      <h1 className="mt-4 text-2xl font-bold md:text-3xl">Подбор боксёрского мешка за 30 секунд</h1>
      <p className="mx-auto mt-3 max-w-md text-steel-400">
        Ответьте на 3–4 вопроса про себя и место — подберём вес, крепление и подходящие модели.
        Термины знать не нужно.
      </p>
      <button onClick={onStart} className="btn-primary mt-6">Начать подбор</button>
    </div>
  );
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Choices({
  options,
  onPick,
  active,
}: {
  options: { v: string; label: string; emoji: string }[];
  onPick: (v: string) => void;
  active?: string;
}) {
  return (
    <div className="space-y-3">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onPick(o.v)}
          className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
            active === o.v ? 'border-accent bg-accent/10' : 'border-ink-600 bg-ink-800 hover:border-steel-400'
          }`}
        >
          <span className="text-2xl">{o.emoji}</span>
          <span className="font-medium text-white">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function WeightLevel({
  weight,
  level,
  onChange,
  onNext,
}: {
  weight?: number;
  level?: Level;
  onChange: (w: number, l: Level) => void;
  onNext: () => void;
}) {
  const [w, setW] = useState(weight ?? 75);
  const [l, setL] = useState<Level>(level ?? 'regular');
  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center justify-between text-sm text-steel-300">
          <span>Ваш вес</span>
          <span className="text-lg font-semibold text-white">{w} кг</span>
        </label>
        <input
          type="range"
          min={40}
          max={120}
          step={1}
          value={w}
          onChange={(e) => setW(Number(e.target.value))}
          className="mt-2 w-full accent-accent"
        />
      </div>
      <div>
        <div className="mb-2 text-sm text-steel-300">Уровень</div>
        <div className="grid grid-cols-3 gap-2">
          {([['beginner', 'Начинающий'], ['regular', 'Регулярно'], ['pro', 'Профи']] as [Level, string][]).map(
            ([val, lbl]) => (
              <button
                key={val}
                onClick={() => setL(val)}
                className={`rounded-md border py-2 text-sm transition-colors ${
                  l === val ? 'border-accent bg-accent/10 text-white' : 'border-ink-600 bg-ink-800 text-steel-300'
                }`}
              >
                {lbl}
              </button>
            ),
          )}
        </div>
      </div>
      <button
        onClick={() => {
          onChange(w, l);
          onNext();
        }}
        className="btn-primary w-full"
      >
        Далее
      </button>
    </div>
  );
}

/** Скрытая логика подбора (Том 9.1.2): ~половина веса, корректировка уровнем. */
function recommendWeight(a: Answers): number {
  if (a.who === 'child') return 15;
  if (a.who === 'teen') return 20;
  const base = (a.weight ?? 75) / 2;
  const adj = a.level === 'beginner' ? -5 : a.level === 'pro' ? 5 : 0;
  return Math.max(20, Math.round((base + adj) / 5) * 5);
}

function Result({ answers, onReset }: { answers: Answers; onReset: () => void }) {
  const targetWeight = recommendWeight(answers);
  const place = answers.place;

  // подбор моделей из локального каталога по весу и типу крепления
  const bags = products.filter((p) => p.categorySlug === 'boksyorskie-meshki');

  const needsNoCeiling = place === 'drywall' || place === 'floor';
  const scored = bags
    .map((p) => {
      const w = Number(p.attributes.weight) || 0;
      const mount = String(p.attributes.mount);
      let score = 100 - Math.abs(w - targetWeight); // ближе к целевому весу — выше
      if (needsNoCeiling) {
        if (mount === 'Растяжки' || mount === 'Напольный') score += 40;
        else score -= 60; // цепи не годятся для гипсокартона
      }
      if (answers.who === 'child' && String(p.attributes.purpose) === 'Дети') score += 30;
      return { p, score };
    })
    .sort((x, y) => y.score - x.score)
    .filter((x) => x.score > 0)
    .slice(0, 3);

  const filterHref = `/catalog/boksyorskie-meshki?weight=${Math.max(20, targetWeight - 10)}-${targetWeight + 10}${
    needsNoCeiling ? '&mount=' + encodeURIComponent('Растяжки') : ''
  }`;

  return (
    <div>
      <h2 className="text-xl font-bold md:text-2xl">Ваши варианты</h2>

      {place === 'drywall' && (
        <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          Гипсокартон не выдержит вес мешка — рекомендуем напольный вариант или мешок на растяжках,
          либо консультацию по усилению крепления.
        </div>
      )}

      <p className="mt-3 text-sm text-steel-400">
        Под ваши ответы подойдёт мешок примерно <span className="font-semibold text-white">{targetWeight} кг</span>
        {needsNoCeiling ? ' с креплением без потолочного крюка' : ''}.
      </p>

      {scored.length > 0 ? (
        <div className="mt-5 space-y-3">
          {scored.map(({ p }) => (
            <div key={p.sku} className="flex gap-4 rounded-lg border border-ink-700 bg-ink-900 p-3">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md">
                <Thumb emoji="🥊" ratio="square" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white">{p.name}</h3>
                <p className="mt-1 text-xs text-steel-400">
                  Подходит: вес {p.attributes.weight} кг под ваш вес и уровень
                  {needsNoCeiling ? `, крепление «${p.attributes.mount}» — то, что нужно для вашего места` : ''}.
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{priceLabel(p)}</span>
                  <Link href={`/catalog/${p.categorySlug}/${p.slug}`} className="text-sm text-accent-400 hover:underline">
                    Смотреть товар →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // нет тупика (Том 9.1.5): форма с уже введёнными ответами
        <div className="mt-5 rounded-lg border border-ink-700 bg-ink-900 p-6 text-center">
          <p className="text-sm text-steel-300">
            Под такие параметры готовых решений нет — рассчитаем нестандартный вариант.
          </p>
          <div className="mt-4">
            <LeadCTA
              label="Рассчитать нестандарт"
              source="wizard-meshok"
              title="Подбор: нестандартный мешок"
              defaultComment={`Подбор мешка: вес ~${targetWeight} кг, место — ${placeLabel(place)}.`}
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={filterHref} className="btn-secondary">Показать ещё варианты</Link>
        <button onClick={onReset} className="btn-ghost">Пройти заново</button>
      </div>
    </div>
  );
}

function placeLabel(p?: Place): string {
  switch (p) {
    case 'gym':
      return 'зал с креплением';
    case 'concrete':
      return 'дом, бетонный потолок';
    case 'drywall':
      return 'дом, гипсокартон/натяжной';
    case 'floor':
      return 'напольный';
    default:
      return '—';
  }
}
