import { requireAuth } from '@/lib/admin/auth';
import { readData } from '@/lib/admin/store';
import { productBySku } from '@/lib/products';
import { setReviewStatus, replyReview, addReview } from '@/lib/admin/actions';
import { PageHead, Panel, Badge } from '@/components/admin/ui';

/** Модерация отзывов (Том 7, п. 7.5). Только реальные, источник обязателен. */
export default function AdminReviews({ searchParams }: { searchParams: { e?: string } }) {
  requireAuth();
  const reviews = readData().reviews;
  const pending = reviews.filter((r) => r.status === 'pending');
  const rest = reviews.filter((r) => r.status !== 'pending');

  return (
    <>
      <PageHead
        title="Отзывы"
        sub="Входящие не публикуются автоматически — модерация вручную. Только реальные отзывы, источник и дата обязательны."
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Panel title={`На модерации (${pending.length})`}>
            {pending.length === 0 ? (
              <p className="text-sm text-steel-400">Очередь пуста.</p>
            ) : (
              <ul className="space-y-3">
                {pending.map((r) => (
                  <ReviewCard key={r.id} r={r} />
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Опубликованные и отклонённые">
            <ul className="space-y-3">
              {rest.map((r) => (
                <ReviewCard key={r.id} r={r} />
              ))}
            </ul>
          </Panel>
        </div>

        {/* Добавить отзыв вручную — источник и дата обязательны (Том 7, п. 7.5) */}
        <Panel title="Добавить отзыв вручную">
          {searchParams.e === 'source' && (
            <div className="mb-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent-400">
              Проверьте, откуда этот отзыв — источник и дата обязательны.
            </div>
          )}
          <form action={addReview} className="space-y-2.5 text-sm">
            <input name="author" placeholder="Автор" className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
            <input name="sku" placeholder="Артикул товара" className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
            <div className="flex gap-2">
              <input name="rating" type="number" min={1} max={5} defaultValue={5} className="w-20 rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
              <input name="date" type="date" required className="flex-1 rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
            </div>
            <input name="source" required placeholder="Источник (звонок / Kaspi / форма) *" className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
            <textarea name="text" rows={3} placeholder="Текст отзыва" className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2" />
            <button className="btn-primary w-full">Добавить на модерацию</button>
            <p className="text-[11px] text-steel-500">Система не даёт сохранить отзыв без источника и реальной даты.</p>
          </form>
        </Panel>
      </div>
    </>
  );
}

function ReviewCard({ r }: { r: import('@/lib/admin/store').Review }) {
  const p = productBySku(r.sku);
  return (
    <li className="rounded-lg border border-ink-700 bg-ink-800 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-white">{r.author}</div>
        <Badge tone={r.status === 'published' ? 'ok' : r.status === 'rejected' ? 'bad' : 'warn'}>
          {r.status === 'published' ? 'Опубликован' : r.status === 'rejected' ? 'Отклонён' : 'На модерации'}
        </Badge>
      </div>
      <div className="mt-0.5 text-xs text-steel-500">
        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} · {r.date} · {p?.name ?? r.sku} · источник: {r.source}
      </div>
      <p className="mt-2 text-sm text-steel-300">{r.text}</p>
      {r.reply && <p className="mt-2 border-l-2 border-accent pl-2 text-sm text-steel-400">Ответ PFS: {r.reply}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {r.status !== 'published' && <StatusBtn id={r.id} status="published" label="Опубликовать" />}
        {r.status !== 'rejected' && <StatusBtn id={r.id} status="rejected" label="Отклонить" />}
        <form action={replyReview} className="flex flex-1 items-center gap-2">
          <input type="hidden" name="id" value={r.id} />
          <input name="reply" defaultValue={r.reply} placeholder="Ответить от имени PFS…" className="min-w-0 flex-1 rounded-md border border-ink-600 bg-ink-900 px-2 py-1 text-xs" />
          <button className="btn-ghost text-xs">Ответить</button>
        </form>
      </div>
    </li>
  );
}

function StatusBtn({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setReviewStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="rounded-md border border-ink-600 bg-ink-900 px-2.5 py-1 text-xs text-steel-200 hover:border-steel-400">{label}</button>
    </form>
  );
}
