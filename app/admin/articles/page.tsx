import Link from 'next/link';
import { requireAuth } from '@/lib/admin/auth';
import { articles } from '@/lib/content';
import { PageHead, Panel } from '@/components/admin/ui';

export default function AdminArticles() {
  requireAuth();
  return (
    <>
      <PageHead title="База знаний" sub="Статьи ведутся на сайте. Автор с должностью — фактор E-E-A-T (Том 5, п. 5.4)." action={<span className="btn-ghost cursor-default text-xs">Новая статья (скоро)</span>} />
      <Panel>
        <ul className="divide-y divide-ink-800">
          {articles.map((a) => (
            <li key={a.slug} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-steel-100">{a.title}</div>
                <div className="text-xs text-steel-500">{a.author} · {a.authorRole}</div>
              </div>
              <Link href={`/knowledge/${a.slug}`} target="_blank" className="shrink-0 text-xs text-accent-400 hover:underline">На сайте ↗</Link>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
