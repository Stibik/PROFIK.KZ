/**
 * Плейсхолдер изображения. Реальные фото товара/цеха ведутся на сайте
 * (Том 0, п. 0.1) и подставляются позже без изменения вёрстки. До съёмки
 * показываем аккуратную заглушку в фирменной гамме (металл + бетон),
 * а не сток — стоки убивают доверие к производителю (Том 2, п. 2.4.1).
 */
export default function Thumb({
  emoji,
  label,
  className = '',
  ratio = 'square',
}: {
  emoji: string;
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
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 20%, rgba(225,29,42,0.18), transparent 45%), repeating-linear-gradient(115deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 22px)',
        }}
      />
      <span className="relative text-5xl grayscale-[0.2] drop-shadow-lg">{emoji}</span>
      {label && <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider text-steel-500">{label}</span>}
    </div>
  );
}
