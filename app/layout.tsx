import type { Metadata } from 'next';
import { Oswald, Inter } from 'next/font/google';
import './globals.css';
import { company, siteUrl, indexable, verification } from '@/lib/company';

/**
 * Типографика (Том 8, п. 8.2: font-display swap). Oswald — узкий индустриальный
 * акцент для заголовков (характер производителя единоборств); Inter — чистый
 * корпус. Оба с кириллицей.
 */
const display = Oswald({ subsets: ['latin', 'cyrillic'], weight: ['500', '600', '700'], variable: '--font-display', display: 'swap' });
const sans = Inter({ subsets: ['latin', 'cyrillic'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });

/**
 * Корневой layout — только html/body. Оболочка сайта (шапка/подвал) живёт в
 * группе (site); у админки — собственная оболочка в app/admin/layout.tsx.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PFS — производство оборудования для единоборств в Казахстане | Profik.kz',
    template: '%s | PFS',
  },
  description: `Профессиональное оборудование для единоборств от производителя ${company.brand}. Боксёрские мешки, манекены, покрытия, лапы. Изготовление под заказ от ${company.minProductionDays} дней. Доставка по Казахстану.`,
  // Закрыто от индексации на техническом домене (Том 0, миграция, Этап 1)
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  verification: {
    google: verification.google,
    yandex: verification.yandex,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
