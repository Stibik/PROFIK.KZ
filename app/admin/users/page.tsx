import { requireAuth } from '@/lib/admin/auth';
import { PageHead, Panel, Badge } from '@/components/admin/ui';

/** Пользователи и роли (Том 7, п. 7.7). Минимальный набор ролей для старта. */
const roles = [
  { role: 'Владелец', access: 'Всё, включая управление ролями и просмотр журнала действий', tone: 'bad' as const },
  { role: 'Контент-менеджер', access: 'Товары (витрина), статьи, главная страница, отзывы', tone: 'warn' as const },
  { role: 'SEO-специалист', access: 'SEO-раздел, гео-страницы, GEO-факты', tone: 'ok' as const },
  { role: 'Только просмотр', access: 'Дашборд статистики без права редактирования', tone: 'muted' as const },
];

export default function AdminUsers() {
  requireAuth();
  return (
    <>
      <PageHead title="Пользователи и роли" sub="Минимальный набор ролей для старта, расширяется без изменения архитектуры." />

      <Panel title="Роли" className="mb-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-ink-800 text-left text-xs text-steel-400">
                <th className="py-2 pr-3">Роль</th>
                <th className="py-2 pr-3">Доступ</th>
                <th className="py-2 pr-3">2FA</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.role} className="border-b border-ink-800/60">
                  <td className="py-2 pr-3"><Badge tone={r.tone}>{r.role}</Badge></td>
                  <td className="py-2 pr-3 text-steel-300">{r.access}</td>
                  <td className="py-2 pr-3">
                    {r.role === 'Владелец' || r.role === 'Контент-менеджер' ? (
                      <Badge tone="ok">обязательна</Badge>
                    ) : (
                      <span className="text-xs text-steel-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-steel-500">
          Двухфакторная аутентификация обязательна для ролей с публикацией контента (Том 8, п. 8.5).
        </p>
      </Panel>

      <Panel title="Пользователи">
        <div className="flex items-center justify-between rounded-md border border-ink-700 bg-ink-800 p-3">
          <div>
            <div className="text-sm text-white">Владелец (вы)</div>
            <div className="text-xs text-steel-500">Полный доступ · вход выполнен</div>
          </div>
          <Badge tone="bad">Владелец</Badge>
        </div>
        <p className="mt-3 text-[11px] text-steel-500">
          Добавление пользователей и приглашения по email — на следующем шаге. Хеширование паролей bcrypt/argon2 (Том 8).
        </p>
      </Panel>
    </>
  );
}
