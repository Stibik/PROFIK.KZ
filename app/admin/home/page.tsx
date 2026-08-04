import { requireAuth } from '@/lib/admin/auth';
import { readData } from '@/lib/admin/store';
import { moveHomeBlock, toggleHomeBlock, publishHome, resetHomeDraft } from '@/lib/admin/actions';
import { PageHead, Panel, Badge } from '@/components/admin/ui';
import DevicePreview from '@/components/admin/DevicePreview';

/**
 * Конструктор главной (Том 7, п. 7.4): порядок блоков перетаскиванием/стрелками,
 * скрытие блока, предпросмотр по устройствам, черновик и публикация раздельно.
 * Новый тип блока создать нельзя — гибкость внутри заданных блоков.
 */
export default function AdminHome() {
  requireAuth();
  const { draft, published } = readData().home;
  const changed = JSON.stringify(draft) !== JSON.stringify(published);

  return (
    <>
      <PageHead
        title="Главная страница"
        sub="Меняйте порядок и видимость блоков. Изменения сохраняются в черновик; «Опубликовать» выводит их на живой сайт."
        action={
          <div className="flex items-center gap-2">
            <form action={resetHomeDraft}>
              <button className="btn-ghost" disabled={!changed}>Сбросить черновик</button>
            </form>
            <form action={publishHome}>
              <button className="btn-primary" disabled={!changed}>
                {changed ? 'Опубликовать' : 'Опубликовано'}
              </button>
            </form>
          </div>
        }
      />

      {changed && (
        <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-400">
          Есть неопубликованные изменения черновика.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Panel title="Блоки главной (черновик)">
          <ol className="space-y-2">
            {draft.map((b, i) => (
              <li key={b.id} className={`flex items-center gap-2 rounded-md border border-ink-700 bg-ink-800 p-3 ${b.hidden ? 'opacity-50' : ''}`}>
                <span className="w-5 text-center text-xs text-steel-500">{i + 1}</span>
                <span className="flex-1 text-sm text-steel-100">{b.title}</span>
                {b.hidden && <Badge tone="muted">скрыт</Badge>}
                <div className="flex items-center gap-1">
                  <FormBtn action={moveHomeBlock} fields={{ id: b.id, dir: 'up' }} disabled={i === 0} title="Вверх">↑</FormBtn>
                  <FormBtn action={moveHomeBlock} fields={{ id: b.id, dir: 'down' }} disabled={i === draft.length - 1} title="Вниз">↓</FormBtn>
                  <FormBtn action={toggleHomeBlock} fields={{ id: b.id }} title={b.hidden ? 'Показать' : 'Скрыть'}>
                    {b.hidden ? '👁' : '🚫'}
                  </FormBtn>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[11px] text-steel-500">
            Порядок — стрелками (перетаскивание добавим на следующем шаге). Скрытый блок не отрисовывается на сайте.
          </p>
        </Panel>

        <Panel title="Предпросмотр (опубликованная версия)">
          <DevicePreview src="/?preview=1" />
        </Panel>
      </div>
    </>
  );
}

function FormBtn({
  action,
  fields,
  children,
  disabled,
  title,
}: {
  action: (fd: FormData) => void;
  fields: Record<string, string>;
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <form action={action}>
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        title={title}
        disabled={disabled}
        className="flex h-7 w-7 items-center justify-center rounded border border-ink-600 bg-ink-900 text-xs text-steel-300 hover:border-steel-400 disabled:opacity-30"
      >
        {children}
      </button>
    </form>
  );
}
