import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

/**
 * Честная 404 с оформлением сайта, поиском и ссылкой на каталог —
 * не редирект на главную (Том 5, п. 5.1.4; Том 0, п. М.2).
 */
export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl font-black text-ink-600">404</div>
      <h1 className="mt-4 text-2xl font-bold">Страница не найдена</h1>
      <p className="mt-2 max-w-md text-steel-400">
        Возможно, товар снят с производства или ссылка устарела. Найдите нужное через поиск или откройте каталог.
      </p>
      <div className="mt-6 w-full max-w-md">
        <SearchBar />
      </div>
      <div className="mt-6 flex gap-3">
        <Link href="/catalog" className="btn-primary">Открыть каталог</Link>
        <Link href="/" className="btn-secondary">На главную</Link>
      </div>
    </div>
  );
}
