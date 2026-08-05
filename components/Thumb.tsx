import type { ReactNode } from 'react';
import { IconPhoto } from './icons';

/**
 * Плейсхолдер изображения. Реальные фото товара/цеха ведутся на сайте
 * (Том 0, п. 0.1) и подставляются позже без изменения вёрстки. До съёмки —
 * аккуратная заглушка в фирменной гамме (металл + бетон) с монограммой PFS
 * и тонкой линейной иконкой. Никаких стоков и мультяшных эмодзи: стоки и
 * «детский» вид убивают доверие к производителю (Том 2, п. 2.4.1).
 */
export default function Thumb({
  icon,
  label,
  className = '',
  ratio = 'square',
}: {
  icon?: ReactNode;
  label?: string;
  className?: string;
  ratio?: 'square' | 'wide' | 'tall';
}) {
  const aspect = ratio === 'wide' ? 'aspect-[16/9]' : ratio === 'tall' ? 'aspect-[3/4]' : 'aspect-square';
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-ink-700 via-ink-800 to-ink-950 ${aspect} ${className}`}
      aria-hidden
    >
      {/* текстура металла/бетона + мягкий красный отсвет */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(circle at 78% 22%, rgba(225,29,42,0.14), transparent 46%), repeating-linear-gradient(120deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 20px)',
        }}
      />
      {/* монограмма-водяной знак */}
      <span className="pointer-events-none absolute -bottom-3 -right-1 select-none text-6xl font-black tracking-tighter text-white/[0.04]">
        PFS
      </span>
      {/* линейная иконка */}
      <span className="relative flex h-[36%] max-h-16 min-h-8 items-center justify-center text-steel-400 [&>svg]:h-full [&>svg]:w-auto">
        {icon ?? <IconPhoto />}
      </span>
      {/* красный акцент в углу */}
      <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-accent/50" />
      {label && (
        <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider text-steel-500">{label}</span>
      )}
    </div>
  );
}
