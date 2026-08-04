import Link from 'next/link';

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {sub && <p className="mt-1 text-sm text-steel-400">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-ink-700 bg-ink-900 ${className}`}>
      {title && <div className="border-b border-ink-800 px-4 py-3 text-sm font-semibold text-white">{title}</div>}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function ReadOnlyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  // Поле, управляемое в PFS APP (Том 7, п. 7.0, 7.3) — только чтение
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-xs text-steel-400">
        {label}
        <span className="rounded bg-ink-700 px-1.5 py-0.5 text-[10px] text-steel-400">🔒 PFS APP</span>
      </div>
      <div className="rounded-md border border-ink-700 bg-ink-800/60 px-3 py-2 text-sm text-steel-300">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-steel-500">{hint}</div>}
    </div>
  );
}

export function Badge({ tone = 'muted', children }: { tone?: 'ok' | 'warn' | 'bad' | 'muted'; children: React.ReactNode }) {
  const cls =
    tone === 'ok'
      ? 'border-green-500/30 bg-green-500/10 text-green-400'
      : tone === 'warn'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
        : tone === 'bad'
          ? 'border-accent/40 bg-accent/10 text-accent-400'
          : 'border-ink-600 bg-ink-800 text-steel-400';
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${cls}`}>{children}</span>;
}

export function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn-secondary py-2 text-sm">
      {children}
    </Link>
  );
}
