import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeadCTA from '@/components/LeadCTA';
import JsonLd from '@/components/JsonLd';
import { company } from '@/lib/company';
import { breadcrumbLd } from '@/lib/seo';

/**
 * Входы «по задаче» — посадочные страницы под сценарий (Том 2, п. 2.2; Том 4, п. 4.3).
 * Это ключевое отличие от Kaspi, где входа по задаче нет и быть не может.
 */
interface Solution {
  slug: string;
  title: string;
  lead: string;
  audience: string;
  steps: { t: string; d: string }[];
  bullets: string[];
  cta: string;
}

const solutions: Record<string, Solution> = {
  'zal-pod-klyuch': {
    slug: 'zal-pod-klyuch',
    title: 'Оснащение зала под ключ',
    audience: 'Залам, клубам, федерациям',
    lead: 'Оборудуем зал единоборств под ключ: от подбора инвентаря до доставки и монтажа. Выезжаем на замер, работаем с юрлицами, даём отсрочку и полный пакет документов.',
    steps: [
      { t: 'Замер и проект', d: 'Выезжаем в зал, снимаем размеры, предлагаем расстановку и комплект оборудования.' },
      { t: 'Смета и договор', d: 'Готовим коммерческое предложение в PDF, счёт и договор для юрлица.' },
      { t: 'Изготовление', d: 'Производим комплект под ваши задачи, включая нестандартные размеры.' },
      { t: 'Доставка и монтаж', d: 'Доставляем по Казахстану, помогаем с установкой и креплением.' },
    ],
    bullets: [
      'Комплексное оснащение: мешки, манекены, покрытия, лапы, защита',
      'Нестандартные размеры под геометрию вашего зала',
      'Отсрочка и документы для бухгалтерии',
      'Гарантия, ремонт и перетяжка инвентаря',
    ],
    cta: 'Заявка на оснащение зала',
  },
  'gos-zakupki': {
    slug: 'gos-zakupki',
    title: 'Оборудование для госзакупок',
    audience: 'Спортшколам, ДЮСШ, вузам, силовым структурам',
    lead: 'Поставляем спортивное оборудование по государственным закупкам: технические характеристики под спецификацию, счёт, реквизиты и полный пакет документов. Казахстанское производство — преференции по СТ-KZ.',
    steps: [
      { t: 'Спецификация', d: 'Даём точные характеристики в формате, готовом для копирования в техническое задание.' },
      { t: 'Документы', d: 'Счёт, реквизиты, сертификаты и подтверждение казахстанского происхождения.' },
      { t: 'Поставка', d: 'Изготовление и доставка в срок по условиям закупки.' },
    ],
    bullets: [
      'Характеристики под техническую спецификацию закупки',
      'Полный пакет документов и реквизиты',
      'Казахстанское производство (преференции СТ-KZ)',
      'Работа с бюджетными организациями',
    ],
    cta: 'Запросить документы и счёт',
  },
  turnir: {
    slug: 'turnir',
    title: 'Оборудование для турниров',
    audience: 'Организаторам мероприятий',
    lead: 'Изготавливаем и поставляем оборудование для турниров: ринг, октагон, маты, покрытия и брендирование. Разовые крупные заказы под конкретное мероприятие в срок.',
    steps: [
      { t: 'Задача мероприятия', d: 'Обсуждаем формат, площадку, сроки и брендирование.' },
      { t: 'Изготовление', d: 'Производим комплект, наносим символику турнира и спонсоров.' },
      { t: 'Доставка к дате', d: 'Доставляем и помогаем с монтажом к началу мероприятия.' },
    ],
    bullets: ['Ринг и октагон', 'Маты и покрытия', 'Брендирование под турнир', 'Соблюдение сроков к дате события'],
    cta: 'Обсудить турнир',
  },
};

export function generateStaticParams() {
  return Object.keys(solutions).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = solutions[params.slug];
  if (!s) return {};
  return {
    title: s.title,
    description: s.lead.slice(0, 155),
    alternates: { canonical: `/resheniya/${s.slug}` },
  };
}

export default function SolutionPage({ params }: { params: { slug: string } }) {
  const s = solutions[params.slug];
  if (!s) notFound();

  const crumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Решения', url: '/catalog' },
    { name: s.title, url: `/resheniya/${s.slug}` },
  ];

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={crumbs} />

      <div className="max-w-3xl">
        <div className="text-sm font-semibold uppercase tracking-wider text-accent-400">{s.audience}</div>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{s.title}</h1>
        <p className="mt-4 text-lg text-steel-300">{s.lead}</p>
        <div className="mt-6">
          <LeadCTA label={s.cta} source={`resheniya-${s.slug}`} title={s.cta} />
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold">Как мы работаем</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {s.steps.map((st, i) => (
            <div key={st.t} className="card p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 font-bold text-accent-400">
                {i + 1}
              </div>
              <h3 className="mt-3 font-semibold text-white">{st.t}</h3>
              <p className="mt-1 text-sm text-steel-400">{st.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">Что входит</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {s.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-steel-300">
              <span className="mt-1 text-accent-400">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-lg border border-ink-700 bg-ink-900 p-6">
        <p className="text-steel-300">
          Готовы обсудить задачу? Позвоните {' '}
          <a href={company.phoneHref} className="font-semibold text-white">{company.phone}</a> или оставьте заявку —
          свяжемся сами.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <LeadCTA label={s.cta} source={`resheniya-bottom-${s.slug}`} title={s.cta} />
          <Link href="/catalog" className="btn-secondary">Открыть каталог</Link>
        </div>
      </section>

      <JsonLd data={breadcrumbLd(crumbs)} />
    </div>
  );
}
