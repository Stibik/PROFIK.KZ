import { requireAuth } from '@/lib/admin/auth';
import { readData } from '@/lib/admin/store';
import { salesStats } from '@/lib/admin/analytics';
import { addOrder, setOrderStatus, deleteOrder, saveKaspiSettings } from '@/lib/admin/actions';
import { PageHead, Panel, Badge } from '@/components/admin/ui';

const statusLabel: Record<string, string> = { new: 'Новый', paid: 'Оплачен', shipped: 'Отгружен', done: 'Выполнен', canceled: 'Отменён' };
const statusTone: Record<string, 'ok' | 'warn' | 'muted' | 'bad'> = { new: 'warn', paid: 'ok', shipped: 'ok', done: 'ok', canceled: 'bad' };
const channelLabel: Record<string, string> = { kaspi: 'Kaspi', site: 'Сайт', manual: 'Вручную' };

/** Заказы и статистика продаж (Том 7). Ручной ввод + интеграция Kaspi. */
export default function AdminOrders({ searchParams }: { searchParams: { saved?: string; e?: string; kaspi?: string } }) {
  requireAuth();
  const d = readData();
  const s = salesStats();
  const kaspi = d.settings.kaspiToken;

  return (
    <>
      <PageHead title="Заказы" sub="Продажи из Kaspi и вручную. Из заказов считается статистика продаж." />

      {searchParams.saved && <Note ok>Заказ сохранён.</Note>}
      {searchParams.kaspi === 'saved' && <Note ok>Настройки Kaspi сохранены.</Note>}
      {searchParams.kaspi === 'notoken' && <Note>Сначала задайте токен API Kaspi.</Note>}
      {searchParams.kaspi === 'stub' && (
        <Note>Токен сохранён. Реальную выкачку заказов из Kaspi включим после проверки токена на боевом API.</Note>
      )}
      {searchParams.e === 'req' && <Note>Укажите номер и дату заказа.</Note>}

      {/* Статистика продаж */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Сумма продаж" value={s.sumLabel} />
        <Stat label="Заказов" value={String(s.count)} />
        <Stat label="Средний чек" value={s.avgLabel} />
        <Stat label="Доля Kaspi" value={s.kaspiShare + '%'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Таблица заказов */}
        <Panel title="Список заказов">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-ink-800 text-left text-xs text-steel-400">
                  <th className="py-2 pr-3">Номер</th>
                  <th className="py-2 pr-3">Дата</th>
                  <th className="py-2 pr-3">Клиент</th>
                  <th className="py-2 pr-3">Состав</th>
                  <th className="py-2 pr-3">Сумма</th>
                  <th className="py-2 pr-3">Канал</th>
                  <th className="py-2 pr-3">Статус</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {d.orders.map((o) => (
                  <tr key={o.id} className="border-b border-ink-800/60 align-top">
                    <td className="py-2 pr-3 font-medium text-steel-100">{o.number}</td>
                    <td className="py-2 pr-3 text-steel-400">{o.date}</td>
                    <td className="py-2 pr-3 text-steel-200">
                      {o.customer}
                      {o.phone && <div className="text-xs text-steel-500">{o.phone}</div>}
                    </td>
                    <td className="py-2 pr-3 text-steel-400">{o.items}</td>
                    <td className="py-2 pr-3 text-steel-100">{new Intl.NumberFormat('ru-RU').format(o.sum)} ₸</td>
                    <td className="py-2 pr-3 text-steel-400">{channelLabel[o.channel]}</td>
                    <td className="py-2 pr-3">
                      <form action={setOrderStatus} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={o.id} />
                        <select name="status" defaultValue={o.status} className="rounded border border-ink-600 bg-ink-800 px-1.5 py-1 text-xs">
                          {Object.entries(statusLabel).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                        <button className="text-xs text-accent-400 hover:underline">ок</button>
                      </form>
                    </td>
                    <td className="py-2 pr-3">
                      <form action={deleteOrder}>
                        <input type="hidden" name="id" value={o.id} />
                        <button className="text-xs text-steel-500 hover:text-accent-400">удалить</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-4">
          {/* Добавить заказ вручную */}
          <Panel title="Добавить заказ">
            <form action={addOrder} className="space-y-2.5 text-sm">
              <div className="flex gap-2">
                <input name="number" required placeholder="Номер *" className="w-1/2 rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
                <input name="date" type="date" required className="w-1/2 rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
              </div>
              <input name="customer" placeholder="Клиент" className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
              <input name="phone" placeholder="Телефон" className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
              <input name="items" placeholder="Состав (напр. MSH-120-40 ×2)" className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
              <div className="flex gap-2">
                <input name="sum" inputMode="numeric" placeholder="Сумма, ₸" className="w-1/2 rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
                <select name="channel" className="w-1/2 rounded-md border border-ink-600 bg-ink-800 px-3 py-2">
                  <option value="manual">Вручную</option>
                  <option value="kaspi">Kaspi</option>
                  <option value="site">Сайт</option>
                </select>
              </div>
              <select name="status" className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2">
                {Object.entries(statusLabel).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <button className="btn-primary w-full">Сохранить заказ</button>
            </form>
          </Panel>

          {/* Интеграция Kaspi */}
          <Panel title="Интеграция Kaspi">
            <div className="mb-3 flex items-center gap-2 text-sm">
              <Badge tone={kaspi ? 'ok' : 'muted'}>{kaspi ? 'токен задан' : 'токен не задан'}</Badge>
            </div>
            <form action={saveKaspiSettings} className="space-y-2.5 text-sm">
              <input name="kaspiShop" defaultValue={d.settings.kaspiShop} placeholder="Название магазина" className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
              <input name="kaspiToken" type="password" defaultValue={kaspi} placeholder="Токен API Kaspi" className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
              <button className="btn-secondary w-full py-2">Сохранить токен</button>
            </form>
            <form action="/api/admin/kaspi-sync" method="post" className="mt-2">
              <button className="btn-ghost w-full text-sm">Синхронизировать заказы</button>
            </form>
            <p className="mt-2 text-[11px] text-steel-500">
              Токен берётся в кабинете продавца Kaspi (раздел API). После этого синхронизация подтянет заказы и номера
              автоматически, и статистика продаж будет считаться по ним.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 p-4">
      <div className="text-xs text-steel-400">{label}</div>
      <div className="mt-1 text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function Note({ children, ok }: { children: React.ReactNode; ok?: boolean }) {
  return (
    <div className={`mb-4 rounded-md border px-4 py-2 text-sm ${ok ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-accent/40 bg-accent/10 text-accent-400'}`}>
      {children}
    </div>
  );
}
