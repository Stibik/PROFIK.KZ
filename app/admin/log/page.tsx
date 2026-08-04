import { requireAuth } from '@/lib/admin/auth';
import { readData } from '@/lib/admin/store';
import { PageHead, Panel } from '@/components/admin/ui';

/** Журнал действий (Том 7, п. 7.8). Кто, что и когда изменил. */
export default function AdminLog() {
  requireAuth();
  const log = readData().log;
  return (
    <>
      <PageHead
        title="Журнал действий"
        sub="Кто, что и когда изменил. Хранится не менее 90 дней, экспортируется в CSV."
        action={<span className="btn-ghost cursor-default text-xs">Экспорт в CSV (скоро)</span>}
      />
      <Panel>
        <ul className="divide-y divide-ink-800">
          {log.map((e) => (
            <li key={e.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span className="w-40 shrink-0 text-xs text-steel-500">{new Date(e.at).toLocaleString('ru-RU')}</span>
              <span className="w-40 shrink-0 text-steel-400">{e.user}</span>
              <span className="text-steel-200">{e.action}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
