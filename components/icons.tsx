import type { ReactNode, SVGProps } from 'react';

/**
 * Набор монохромных линейных иконок вместо эмодзи-заглушек.
 * Единый стиль: 24×24, тонкая обводка currentColor — «взрослый» вид под
 * фирменную гамму (металл/бетон), а не мультяшные смайлы.
 */
function S(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

/* ── Категории ─────────────────────────────────────────────── */
export const IconBag = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M9 3h6M10 3v3M14 3v3" /><rect x="7" y="6" width="10" height="15" rx="3" /><path d="M7 11h10" /></S>
);
export const IconDummy = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><circle cx="12" cy="5.5" r="2.5" /><path d="M8 21c0-5 1.6-8 4-8s4 3 4 8" /><path d="M8.5 12h7" /></S>
);
export const IconWeight = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><rect x="5" y="7" width="14" height="12" rx="3" /><path d="M9 7V5.5A2.5 2.5 0 0 1 11.5 3h1A2.5 2.5 0 0 1 15 5.5V7" /><path d="M12 11v4" /></S>
);
export const IconPad = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><ellipse cx="12" cy="10" rx="7" ry="6" /><ellipse cx="12" cy="10" rx="3" ry="2.5" /><path d="M12 16v5" /></S>
);
export const IconWallPad = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M4 3v18" /><path d="M4 6l2-2M4 10l3-3M4 14l3-3M4 18l3-3" opacity="0.5" /><rect x="8" y="6" width="12" height="12" rx="2" /></S>
);
export const IconMat = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M3 8l9-4 9 4-9 4-9-4Z" /><path d="M3 12l9 4 9-4M3 16l9 4 9-4" opacity="0.6" /></S>
);
export const IconGlove = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M8 11V6a2 2 0 0 1 4 0v4" /><path d="M12 10V7a2 2 0 0 1 4 0v4c0 5-2 9-5 9s-6-2-6-6a2 2 0 0 1 4 0" /></S>
);
export const IconChain = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><rect x="4" y="8" width="9" height="6" rx="3" /><rect x="11" y="10" width="9" height="6" rx="3" /></S>
);

/* ── Галерея / прочее ──────────────────────────────────────── */
export const IconPhoto = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="M4 17l5-4 4 3 3-2 4 3" /></S>
);
export const IconDetail = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M20 20l-4.2-4.2" /></S>
);
export const IconInterior = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M3 21h18" /><path d="M5 21V8l7-4 7 4v13" /><path d="M9 21v-6h6v6" /></S>
);
export const IconVideo = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9l5 3-5 3V9Z" /></S>
);
export const IconSizes = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M3 7h18" /><path d="M6 4v6M18 4v6" /><path d="M3 15h18" /><path d="M3 12v6M21 12v6" opacity="0.6" /></S>
);
export const IconWorkshop = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M3 21V10l6 4V10l6 4V6l6 4v11H3Z" /><path d="M7 21v-4h3v4" /></S>
);
export const IconStitch = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M4 16l4-4 4 4 4-4 4-4" /><path d="M4 12l4-4 4 4 4-4 4-4" opacity="0.5" /></S>
);
export const IconAssembly = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M14 6a3.5 3.5 0 0 0-4.6 4.6L4 16l3 3 5.4-5.4A3.5 3.5 0 0 0 17 9l-2 2-2-2 2-2Z" /></S>
);

/* ── Аудитория / задачи ────────────────────────────────────── */
export const IconBuilding = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" /><path d="M10 21v-3h4v3" /></S>
);
export const IconHome = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></S>
);
export const IconChild = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><circle cx="12" cy="6" r="2.5" /><path d="M9 21v-5H8l1.5-5h5L16 16h-1v5" /></S>
);
export const IconTrophy = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" /><path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" /><path d="M12 12v4M9 20h6M10 20l.5-4h3l.5 4" /></S>
);
export const IconDoc = (p: SVGProps<SVGSVGElement>) => (
  <S {...p}><path d="M6 3h8l4 4v14H6V3Z" /><path d="M14 3v4h4" /><path d="M9 12h6M9 15h6M9 18h4" /></S>
);

/* ── Карты соответствий ─────────────────────────────────────── */
const CATEGORY_ICONS: Record<string, (p: SVGProps<SVGSVGElement>) => ReactNode> = {
  'boksyorskie-meshki': IconBag,
  manekeny: IconDummy,
  utyazheliteli: IconWeight,
  'lapy-i-pedy': IconPad,
  'nastennye-podushki': IconWallPad,
  'pokrytiya-i-maty': IconMat,
  'perchatki-i-zashchita': IconGlove,
  aksessuary: IconChain,
};

export function categoryIcon(slug: string, props: SVGProps<SVGSVGElement> = {}): ReactNode {
  const Icon = CATEGORY_ICONS[slug] ?? IconPhoto;
  return <Icon {...props} />;
}

const TASK_ICONS: Record<string, (p: SVGProps<SVGSVGElement>) => ReactNode> = {
  zal: IconBuilding,
  dom: IconHome,
  deti: IconChild,
  turnir: IconTrophy,
  goszakupki: IconDoc,
};

export function taskIcon(slug: string, props: SVGProps<SVGSVGElement> = {}): ReactNode {
  const Icon = TASK_ICONS[slug] ?? IconBuilding;
  return <Icon {...props} />;
}
