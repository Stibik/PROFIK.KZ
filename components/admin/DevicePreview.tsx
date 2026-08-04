'use client';

import { useState } from 'react';

/** Предпросмотр «Десктоп / Планшет / Мобильный» перед публикацией (Том 7, п. 7.4). */
const widths = { desktop: '100%', tablet: '768px', mobile: '390px' } as const;
type Device = keyof typeof widths;

export default function DevicePreview({ src }: { src: string }) {
  const [device, setDevice] = useState<Device>('mobile');
  const [key, setKey] = useState(0);
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {(['desktop', 'tablet', 'mobile'] as Device[]).map((d) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            className={`rounded-md px-3 py-1.5 text-xs ${device === d ? 'bg-accent text-white' : 'bg-ink-800 text-steel-300'}`}
          >
            {d === 'desktop' ? 'Десктоп' : d === 'tablet' ? 'Планшет' : 'Мобильный'}
          </button>
        ))}
        <button onClick={() => setKey((k) => k + 1)} className="ml-auto text-xs text-steel-400 hover:text-white">
          ↻ Обновить
        </button>
      </div>
      <div className="flex justify-center rounded-lg border border-ink-700 bg-ink-950 p-3">
        <iframe
          key={key}
          src={src}
          title="Предпросмотр"
          className="h-[600px] rounded-md border border-ink-700 bg-white transition-all"
          style={{ width: widths[device], maxWidth: '100%' }}
        />
      </div>
    </div>
  );
}
