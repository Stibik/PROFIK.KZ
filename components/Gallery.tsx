'use client';

import { useState, type ReactNode } from 'react';
import Thumb from './Thumb';
import { categoryIcon, IconDetail, IconInterior, IconSizes, IconVideo } from './icons';

/**
 * Галерея (Том 3, п. 3.3): 5–8 кадров, включая деталь материала и фото в
 * интерьере зала. Первое фото совпадает с листингом (доверие). Реальные фото
 * подставляются позже — здесь подписанные заглушки под будущие кадры.
 */
export default function Gallery({ slug, name }: { slug: string; name: string }) {
  const shots: { icon: ReactNode; label: string }[] = [
    { icon: categoryIcon(slug), label: 'Основное фото' },
    { icon: <IconDetail />, label: 'Деталь материала' },
    { icon: <IconInterior />, label: 'В интерьере зала' },
    { icon: <IconSizes />, label: 'Размеры' },
    { icon: <IconVideo />, label: 'Видео: в движении' },
  ];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-ink-700">
        <Thumb icon={shots[active].icon} label={shots[active].label} ratio="square" />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={`Галерея: ${name}`}>
        {shots.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            role="tab"
            aria-selected={i === active}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border ${
              i === active ? 'border-accent' : 'border-ink-700 opacity-70 hover:opacity-100'
            }`}
          >
            <Thumb icon={s.icon} ratio="square" />
          </button>
        ))}
      </div>
    </div>
  );
}
