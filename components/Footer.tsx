import Link from 'next/link';
import { company } from '@/lib/company';
import { categories } from '@/lib/categories';

/** Подвал: контакты, реквизиты, соцсети, навигация (Том 4, п. 4.1) */
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-700 bg-ink-900">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-white">PFS</span>
            <span className="text-sm text-steel-400">Profik.kz</span>
          </div>
          <p className="mt-3 text-sm text-steel-400">
            Производитель оборудования для единоборств в {company.city}. Изготовление под заказ
            от {company.minProductionDays} дней. Доставка по Казахстану.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Каталог</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/catalog/${c.slug}`} className="text-steel-400 transition-colors hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Покупателю</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/podbor/meshok" className="text-steel-400 hover:text-white">Подбор мешка</Link></li>
            <li><Link href="/knowledge" className="text-steel-400 hover:text-white">База знаний</Link></li>
            <li><Link href="/resheniya/zal-pod-klyuch" className="text-steel-400 hover:text-white">Зал под ключ</Link></li>
            <li><Link href="/resheniya/gos-zakupki" className="text-steel-400 hover:text-white">Госзакупки</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Контакты</h3>
          <ul className="mt-3 space-y-2 text-sm text-steel-400">
            <li><a href={company.phoneHref} className="hover:text-white">{company.phone}</a></li>
            <li><a href={`mailto:${company.email}`} className="hover:text-white">{company.email}</a></li>
            <li>{company.addressLine}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-5 text-xs text-steel-500 sm:flex-row sm:items-center">
          <span>© {company.foundedYear}–2026 {company.legalName}. Все права защищены.</span>
          <span>Цены и наличие уточняйте у менеджера.</span>
        </div>
      </div>
    </footer>
  );
}
