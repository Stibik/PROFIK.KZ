import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import BagWizard from '@/components/BagWizard';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, faqLd } from '@/lib/seo';

const faq = [
  {
    q: 'Какой вес мешка нужен для начинающего?',
    a: 'Начинающему подойдёт мешок легче — примерно половина веса тела минус 5 кг. Для человека 75 кг это около 30–35 кг.',
  },
  {
    q: 'Можно ли повесить мешок на гипсокартон?',
    a: 'Нет, гипсокартон не держит вес мешка. Нужен напольный мешок, модель на растяжках или крепление к бетонному перекрытию.',
  },
  {
    q: 'Как рассчитывается вес мешка?',
    a: 'Ориентир — примерно половина веса бьющего, с поправкой на уровень: начинающему легче, профессионалу тяжелее при той же массе тела.',
  },
];

export const metadata: Metadata = {
  title: 'Подбор боксёрского мешка — мастер за 30 секунд',
  description:
    'Подберём боксёрский мешок по вашему весу, уровню и месту установки. Учитываем гипсокартон и натяжные потолки. Производство PFS, Казахстан.',
  alternates: { canonical: '/podbor/meshok' },
};

// Мастер индексируется, с блоком вопросов внизу (Том 9.3: SEO мастера)
export default function PodborMeshokPage() {
  return (
    <div className="container-page pb-16">
      <Breadcrumbs
        items={[
          { name: 'Главная', url: '/' },
          { name: 'Подбор', url: '/podbor/meshok' },
          { name: 'Мешок', url: '/podbor/meshok' },
        ]}
      />

      <div className="py-8">
        <BagWizard />
      </div>

      <section className="mx-auto mt-10 max-w-xl border-t border-ink-800 pt-8">
        <h2 className="text-lg font-bold">Частые вопросы о подборе мешка</h2>
        <div className="mt-4 space-y-3">
          {faq.map((f) => (
            <div key={f.q} className="card p-4">
              <h3 className="font-semibold text-white">{f.q}</h3>
              <p className="mt-1 text-sm text-steel-300">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbLd([
            { name: 'Главная', url: '/' },
            { name: 'Подбор мешка', url: '/podbor/meshok' },
          ]),
          faqLd(faq),
        ]}
      />
    </div>
  );
}
