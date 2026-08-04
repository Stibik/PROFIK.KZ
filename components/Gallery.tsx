'use client';

import { useState } from 'react';
import Thumb from './Thumb';

/**
 * Галерея (Том 3, п. 3.3): 5–8 кадров, включая деталь материала и фото в
 * интерьере зала. Первое фото совпадает с листингом (доверие). Реальные фото
 * подставляются позже — здесь подписанные заглушки под будущие кадры.
 */
export default function Gallery({ emoji, name }: { emoji: string; name: string }) {
  const shots = [
    { emoji, label: 'Основное фото' },
    { emoji: '🔍', label: 'Деталь материала' },
    { emoji: '🏟️', label: 'В интерьере зала' },
    { emoji: '📐', label: 'Размеры' },
    { emoji: '🎥', label: 'Видео: удар по мешку' },
  ];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-ink-700">
        <Thumb emoji={shots[active].emoji} label={shots[active].label} ratio="square" />
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
            <Thumb emoji={s.emoji} ratio="square" />
          </button>
        ))}
      </div>
    </div>
  );
}
