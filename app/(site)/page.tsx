import Link from 'next/link';
import { Section, SectionHead } from '@/components/Section';
import CategoryTile from '@/components/CategoryTile';
import LeadCTA from '@/components/LeadCTA';
import Thumb from '@/components/Thumb';
import { taskIcon, IconWorkshop, IconStitch, IconAssembly } from '@/components/icons';
import Reveal from '@/components/Reveal';
import CountUp from '@/components/CountUp';
import JsonLd from '@/components/JsonLd';
import { categories } from '@/lib/categories';
import { taskEntries, articles } from '@/lib/content';
import { company } from '@/lib/company';
import { faqLd } from '@/lib/seo';
import { readData } from '@/lib/admin/store';

/**
 * Главная страница (Том 4). Порядок блоков не произволен (Том 4, п. 4.1):
 * эмоция → разделение по аудитории → товар → доказательства → мягкий призыв.
 * Главная — витрина доверия к компании, а не витрина товаров (Том 4, п. 4.0).
 *
 * Порядок и видимость блоков управляются конструктором в админке (Том 7, п. 7.4):
 * рендерим опубликованную конфигурацию. revalidatePath('/') при публикации
 * обновляет статическую страницу без полной пересборки.
 */
const BLOCKS: Record<string, () => JSX.Element> = {
  hero: Hero,
  audience: AudienceEntries,
  categories: CategoriesBlock,
  manufacture: WeManufacture,
  cases: Cases,
  madeToOrder: MadeToOrder,
  numbers: Numbers,
  knowledge: KnowledgeBlock,
  finalCta: FinalCta,
};

export default function HomePage() {
  const published = readData().home.published;
  return (
    <>
      {published
        .filter((b) => !b.hidden && BLOCKS[b.id])
        .map((b) => {
          const Block = BLOCKS[b.id];
          // Герой над сгибом — без reveal; остальные блоки плавно появляются
          if (b.id === 'hero') return <Block key={b.id} />;
          return (
            <Reveal key={b.id}>
              <Block />
            </Reveal>
          );
        })}

      <JsonLd
        data={faqLd([
          {
            q: 'Кто производит боксёрское оборудование в Казахстане?',
            a: `${company.brand} производит оборудование для единоборств в ${company.city} с ${company.foundedYear} года: боксёрские мешки, манекены, покрытия, лапы. Собственное производство, изготовление под заказ от ${company.minProductionDays} дней.`,
          },
          {
            q: 'Можно ли заказать оборудование нестандартного размера?',
            a: 'Да. Это собственное производство — изготавливаем мешки, манекены, настенные подушки и покрытия по вашим размерам. Назовите параметры, рассчитаем стоимость и срок.',
          },
        ])}
      />
    </>
  );
}

/* 1. Герой (Том 4, п. 4.2) */
function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-800">
      {/* «Видеофон» — постер-заглушка до собственной съёмки цеха (Том 4, п. 4.2) */}
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full animate-slow-zoom bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 75% 30%, rgba(225,29,42,0.22), transparent 40%), repeating-linear-gradient(120deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 26px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        {/* тонкий световой блик, проходящий по герою */}
        <div className="absolute inset-y-0 -left-1/4 w-1/3 animate-sheen bg-gradient-to-r from-transparent via-white/[0.06] to-transparent motion-reduce:hidden" />
      </div>

      <div className="container-page py-20 md:py-28 lg:py-36">
        <div className="max-w-3xl">
          <span className="badge-made animate-rise-in">Собственное производство · {company.city}</span>
          <h1 className="mt-5 animate-rise-in text-3xl font-black leading-[1.1] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Оборудование для единоборств.
            <br />
            <span className="text-accent-400">Делаем сами</span> — в {company.city}.
          </h1>
          <p className="mt-5 max-w-xl animate-rise-in text-lg text-steel-300">
            Изготовление под заказ от {company.minProductionDays} дней. Любые размеры. Доставка по Казахстану.
          </p>
          <div className="mt-8 flex animate-rise-in flex-wrap gap-3">
            <Link href="/catalog" className="btn-primary">
              Смотреть каталог
            </Link>
            <Link href="/#production" className="btn-secondary">
              Наше производство
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 2. Три входа по аудитории (Том 4, п. 4.3) */
function AudienceEntries() {
  const entries = taskEntries.filter((t) => ['zal', 'dom', 'goszakupki'].includes(t.slug));
  return (
    <Section>
      <SectionHead
        eyebrow="С чем пришли?"
        title="Выберите свою задачу"
        sub="Мы отвечаем не «каким товаром», а «какой задачей» — и этим отличаемся от маркетплейса."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {entries.map((e) => (
          <Link
            key={e.slug}
            href={e.href}
            className="group card glow-hover flex flex-col p-6 hover:-translate-y-1 hover:border-accent/50"
          >
            <span className="flex h-8 w-8 items-center justify-center text-accent-400 [&>svg]:h-full [&>svg]:w-full">
              {taskIcon(e.slug)}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-accent-400">{e.title}</h3>
            <p className="mt-2 flex-1 text-sm text-steel-400">{e.description}</p>
            <span className="mt-4 text-sm font-medium text-accent-400">Подробнее →</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

/* 3. Категории каталога (Том 4, п. 4.4) */
function CategoriesBlock() {
  return (
    <Section className="border-t border-ink-800 bg-ink-900/40">
      <SectionHead title="Что мы производим" sub="Восемь категорий оборудования — от боксёрских мешков до покрытий для зала." />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((c) => (
          <CategoryTile key={c.slug} category={c} />
        ))}
      </div>
    </Section>
  );
}

/* 4. «Мы производим, а не перепродаём» [РЕАЛ] (Том 4, п. 4.5) */
function WeManufacture() {
  return (
    <Section id="production">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <SectionHead eyebrow="Почему мы" title="Мы производим, а не перепродаём" />
          <p className="text-steel-300">
            {company.brand} изготавливает боксёрское оборудование в {company.city} с {company.foundedYear} года.
            Своё производство — значит: сделаем под заказ, ответим за качество, отремонтируем и перетянем,
            назовём точный срок. Ценой с перекупщиком конкурировать бессмысленно — мы конкурируем тем,
            чего у него нет в принципе.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-steel-300">
            {['Изготовление под заказ и нестандартные размеры', 'Гарантия на швы и материалы', 'Ремонт и перетяжка инвентаря', 'Документы для бухгалтерии и юрлиц'].map((li) => (
              <li key={li} className="flex items-start gap-2">
                <span className="mt-1 text-accent-400">✓</span>
                <span>{li}</span>
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <LeadCTA label="Хотите приехать? Покажем цех" source="visit-workshop" title="Запись на визит в цех" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* [РЕАЛ] место под фото цеха — общий план и детали процесса */}
          <Thumb icon={<IconWorkshop />} ratio="tall" className="rounded-lg" label="Цех — фото" />
          <div className="grid gap-3">
            <Thumb icon={<IconStitch />} ratio="wide" className="rounded-lg" label="Прошивка" />
            <Thumb icon={<IconAssembly />} ratio="wide" className="rounded-lg" label="Сборка" />
          </div>
        </div>
      </div>
    </Section>
  );
}

/* 5. Кейсы залов [РЕАЛ] (Том 4, п. 4.6) — до реальной съёмки не публикуем вымышленные */
function Cases() {
  return (
    <Section className="border-y border-ink-800 bg-ink-900/40">
      <SectionHead eyebrow="Кейсы" title="Оборудованные залы" sub="Реальные проекты с фотографиями — блок наполняется по мере съёмки залов." />
      <div className="card flex flex-col items-center justify-center gap-3 border-dashed p-10 text-center">
        <span className="text-3xl">🏟️</span>
        <p className="max-w-md text-sm text-steel-400">
          Здесь появятся реальные залы, которые мы оборудовали: список поставленного оборудования,
          фотогалерея и отзыв тренера. Мы не показываем вымышленные кейсы.
        </p>
        <LeadCTA label="Оборудовать зал под ключ" variant="secondary" source="home-cases" title="Заявка на оснащение зала" />
      </div>
    </Section>
  );
}

/* 6. Изготовление под заказ (Том 4, п. 4.7) */
function MadeToOrder() {
  const steps = [
    { n: 1, t: 'Расскажите параметры', d: 'Форма или WhatsApp — вес, размер, задача' },
    { n: 2, t: 'Рассчитаем и изготовим', d: `Срок от ${company.minProductionDays} дней` },
    { n: 3, t: 'Доставим', d: 'По всему Казахстану' },
  ];
  return (
    <Section>
      <SectionHead title="Изготовление под заказ" sub="Нужен нестандартный размер или вес? Это то, чего нет у перекупщика на маркетплейсе." />
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-lg font-bold text-accent-400">
              {s.n}
            </div>
            <h3 className="mt-4 font-semibold text-white">{s.t}</h3>
            <p className="mt-1 text-sm text-steel-400">{s.d}</p>
          </div>
        ))}
      </div>
      <div className="mt-7">
        <LeadCTA label="Рассчитать нестандарт" source="home-made-to-order" title="Заявка на изготовление под заказ" />
      </div>
    </Section>
  );
}

/* 7. Цифры и доверие [РЕАЛ] (Том 4, п. 4.8) — только реальные, с анимацией счётчика */
function Numbers() {
  const stats = [
    { to: company.foundedYear, prefix: 'с ', suffix: '', l: 'год основания' },
    { to: 8, prefix: '', suffix: '', l: 'категорий в производстве' },
    { to: company.cities.length, prefix: '', suffix: '+', l: 'городов доставки' },
    { to: company.minProductionDays, prefix: 'от ', suffix: ' дн.', l: 'срок изготовления' },
  ];
  return (
    <Section className="border-y border-ink-800 bg-ink-900/40">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <div className="text-3xl font-black text-white md:text-4xl">
              <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
            </div>
            <div className="mt-1 text-sm text-steel-400">{s.l}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* 8. База знаний (Том 4, п. 4.9) */
function KnowledgeBlock() {
  return (
    <Section>
      <SectionHead eyebrow="База знаний" title="Помогаем выбрать" sub="Разбираем частые вопросы — читают люди и цитируют ИИ-ассистенты." />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {articles.slice(0, 3).map((a) => (
          <Link key={a.slug} href={`/knowledge/${a.slug}`} className="group card p-5 transition-colors hover:border-ink-500">
            <h3 className="font-semibold text-white group-hover:text-accent-400">{a.title}</h3>
            <p className="mt-2 text-sm text-steel-400">{a.excerpt}</p>
            <span className="mt-3 inline-block text-sm text-accent-400">Читать →</span>
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <Link href="/knowledge" className="link-underline text-sm">Все статьи базы знаний</Link>
      </div>
    </Section>
  );
}

/* 9. Финальный призыв (Том 4, п. 4.10) */
function FinalCta() {
  return (
    <Section className="border-t border-ink-800">
      <div className="card overflow-hidden bg-gradient-to-br from-ink-800 to-ink-900 p-8 md:p-12">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold md:text-3xl">Не нашли то, что нужно?</h2>
          <p className="mt-3 text-steel-300">
            Расскажите, что оборудуете — подберём готовое или изготовим под ваши параметры.
          </p>
          <div className="mt-6">
            <LeadCTA label="Оставить заявку" source="home-final" title="Расскажите о задаче" />
          </div>
        </div>
      </div>
    </Section>
  );
}
