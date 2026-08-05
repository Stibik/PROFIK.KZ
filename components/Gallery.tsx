'use client';

import { useState, type ReactNode } from 'react';
import Thumb from './Thumb';
import { categoryIcon, IconDetail, IconInterior, IconSizes, IconVideo } from './icons';

/**
 * Галерея (Том 3, п. 3.3). Если для товара загружены реальные фото — показываем
 * их; иначе — подписанные фирменные заглушки под будущие кадры.
 */
export default function Gallery({ slug, name, media = [] }: { slug: string; name: string; media?: string[] }) {
  const hasMedia = media.length > 0;
  const placeholders: { icon: ReactNode; label: string }[] = [
    { icon: categoryIcon(slug), label: 'Основное фото' },
    { icon: <IconDetail />, label: 'Деталь материала' },
    { icon: <IconInterior />, label: 'В интерьере зала' },
    { icon: <IconSizes />, label: 'Размеры' },
    { icon: <IconVideo />, label: 'Видео: в движении' },
  ];
  const count = hasMedia ? media.length : placeholders.length;
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-ink-700">
        {hasMedia ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media[active]} alt={name} className="aspect-square w-full object-cover" />
        ) : (
          <Thumb icon={placeholders[active].icon} label={placeholders[active].label} ratio="square" />
        )}
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={`Галерея: ${name}`}>
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            role="tab"
            aria-selected={i === active}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border ${
              i === active ? 'border-accent' : 'border-ink-700 opacity-70 hover:opacity-100'
            }`}
          >
            {hasMedia ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media[i]} alt="" className="h-full w-full object-cover" />
            ) : (
              <Thumb icon={placeholders[i].icon} ratio="square" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
