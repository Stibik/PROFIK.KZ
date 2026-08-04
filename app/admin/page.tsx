import { requireAuth } from '@/lib/admin/auth';
import { dashboardStats } from '@/lib/admin/analytics';
import { PageHead, Panel, Badge } from '@/components/admin/ui';

/** Панель управления (Том 7, п. 7.2) — обязательна в первом релизе. */
export default function AdminDashboard() {
  requireAuth();
  const s = dashboardStats();
  const max = Math.max(...s.trend);

  return (
    <>
      <PageHead
        title="Панель управления"
        sub="Ключевые показатели за месяц. Визиты и конверсия — GA4, заявки и переходы на Kaspi — база сайта."
      />

      {/* Верхний ряд KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {s.kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-ink-700 bg-ink-900 p-4">
            <div className="text-xs text-steel-400">{k.label}</div>
            <div className="mt-1 text-2xl font-bold text-white">{k.value}</div>
            <div className={`mt-1 text-xs ${k.up ? 'text-green-400' : 'text-accent-400'}`}>
              {k.up ? '↑' : '↓'} {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* График-линия (тренд важнее столбцов, Том 7, п. 7.2) */}
        <Panel title="Посещения и заявки по дням" className="lg:col-span-2">
          <Sparkline data={s.trend} max={max} />
        </Panel>

        {/* Блок алертов из тома «Синхронизация» (Том 7, п. 7.2) */}
        <Panel title="Технические события">
          <ul className="space-y-2">
            {s.alerts.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Badge tone={a.level === 'ok' ? 'ok' : 'warn'}>{a.level === 'ok' ? 'OK' : '!'}</Badge>
                <span className="text-steel-300">{a.text}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Panel title="Топ товаров по просмотрам">
          <TopList items={s.topByViews} unit="просм." />
        </Panel>
        <Panel title="Топ товаров по заявкам">
          <TopList items={s.topByLeads} unit="заявок" />
        </Panel>
        <Panel title="Топ страниц входа">
          <ul className="space-y-2 text-sm">
            {s.topPages.map((p) => (
              <li key={p.page} className="flex items-center justify-between gap-2">
                <span className="truncate text-steel-300">{p.page}</span>
                <span className="shrink-0 text-steel-400">{p.value}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

function Sparkline({ data, max }: { data: number[]; max: number }) {
  const w = 100;
  const h = 40;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="#e11d2a" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill="url(#g)" opacity="0.25" />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e11d2a" />
          <stop offset="100%" stopColor="#e11d2a" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TopList({ items, unit }: { items: { name: string; sku: string; value: number }[]; unit: string }) {
  const max = Math.max(...items.map((i) => i.value));
  return (
    <ul className="space-y-2.5">
      {items.map((it) => (
        <li key={it.sku}>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate text-steel-300">{it.name}</span>
            <span className="shrink-0 text-xs text-steel-400">{it.value} {unit}</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink-700">
            <div className="h-full bg-accent/60" style={{ width: `${(it.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
