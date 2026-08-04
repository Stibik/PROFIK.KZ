import { requireAuth } from '@/lib/admin/auth';
import { caseStudies } from '@/lib/content';
import { PageHead, Panel, Badge } from '@/components/admin/ui';

export default function AdminCases() {
  requireAuth();
  return (
    <>
      <PageHead title="Кейсы залов" sub="Реальные проекты. Вымышленные кейсы не публикуем (Том 4, п. 4.6)." action={<span className="btn-ghost cursor-default text-xs">Новый кейс (скоро)</span>} />
      <Panel>
        <ul className="space-y-3">
          {caseStudies.map((c) => (
            <li key={c.slug} className="flex items-center justify-between gap-3 rounded-md border border-ink-700 bg-ink-800 p-3">
              <div>
                <div className="text-sm text-steel-100">{c.gym}, {c.city}</div>
                <div className="text-xs text-steel-500">{c.summary}</div>
              </div>
              {c.real ? <Badge tone="ok">опубликован</Badge> : <Badge tone="warn">черновик / ждёт съёмки</Badge>}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-steel-500">
          Кейс ссылается на поставленные товары, а карточка товара — обратно на кейс (Том 5, п. 5.2).
        </p>
      </Panel>
    </>
  );
}
