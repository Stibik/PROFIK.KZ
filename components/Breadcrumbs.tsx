import Link from 'next/link';

export interface Crumb {
  name: string;
  url: string;
}

/** Хлебные крошки на всех уровнях (Том 2, п. 2.7; Том 5, п. 5.3) */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="py-4 text-sm text-steel-400">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={it.url} className="flex items-center gap-2">
              {last ? (
                <span className="text-steel-300" aria-current="page">
                  {it.name}
                </span>
              ) : (
                <Link href={it.url} className="transition-colors hover:text-white">
                  {it.name}
                </Link>
              )}
              {!last && <span className="text-ink-500">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
