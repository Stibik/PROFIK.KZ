import { requireAuth } from '@/lib/admin/auth';
import { company } from '@/lib/company';
import { PageHead, Panel, Badge } from '@/components/admin/ui';

/** Гео-страницы (локальное SEO по городам, Том 2, п. 2.9; Том 5, п. 5.6). */
export default function AdminGeo() {
  requireAuth();
  return (
    <>
      <PageHead
        title="Гео-страницы"
        sub="Только города реального присутствия. 30–50 качественных страниц лучше 400 шаблонных (риск дорвеев)."
      />
      <Panel title="Города присутствия">
        <div className="flex flex-wrap gap-2">
          {company.cities.map((c) => (
            <Badge key={c} tone="muted">{c}</Badge>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-steel-500">
          Каждая гео-страница — уникальная информация о городе: доставка, адрес, местные клиенты, LocalBusiness-разметка и
          привязка к 2GIS. Автогенерация даёт каркас, дальше — ручная доработка топ-связок.
        </p>
      </Panel>
    </>
  );
}
