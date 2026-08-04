import { requireAuth } from '@/lib/admin/auth';
import { readData } from '@/lib/admin/store';
import { setLeadStatus } from '@/lib/admin/actions';
import { PageHead, Panel, Badge } from '@/components/admin/ui';

/** Заявки — входящие лиды (Том 7, п. 7.1). Форма с сайта складывает их сюда. */
export default function AdminLeads() {
  requireAuth();
  const leads = readData().leads;
  const nnew = leads.filter((l) => l.status === 'new').length;

  return (
    <>
      <PageHead title="Заявки" sub={`Входящие обращения с сайта. Новых: ${nnew}. Ни одна заявка не теряется при сбое API (Том 4, п. 4.2).`} />

      <Panel>
        {leads.length === 0 ? (
          <p className="text-sm text-steel-400">Заявок пока нет.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-ink-800 text-left text-xs text-steel-400">
                  <th className="py-2 pr-3">Дата</th>
                  <th className="py-2 pr-3">Имя</th>
                  <th className="py-2 pr-3">Телефон</th>
                  <th className="py-2 pr-3">Комментарий</th>
                  <th className="py-2 pr-3">Источник</th>
                  <th className="py-2 pr-3">Статус</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-ink-800/60 align-top">
                    <td className="py-2 pr-3 text-steel-400">{new Date(l.at).toLocaleString('ru-RU')}</td>
                    <td className="py-2 pr-3 text-steel-100">{l.name}</td>
                    <td className="py-2 pr-3 text-steel-200">{l.phone}</td>
                    <td className="py-2 pr-3 text-steel-400">{l.comment || '—'}</td>
                    <td className="py-2 pr-3 text-xs text-steel-500">{l.source}</td>
                    <td className="py-2 pr-3">
                      <Badge tone={l.status === 'new' ? 'warn' : 'ok'}>{l.status === 'new' ? 'Новая' : 'Обработана'}</Badge>
                    </td>
                    <td className="py-2 pr-3">
                      <form action={setLeadStatus}>
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="status" value={l.status === 'new' ? 'processed' : 'new'} />
                        <button className="text-xs text-accent-400 hover:underline">
                          {l.status === 'new' ? 'Отметить обработанной' : 'Вернуть в новые'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
