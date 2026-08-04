import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { organizationLd, websiteLd } from '@/lib/seo';
import { company, siteUrl } from '@/lib/company';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PFS — производство оборудования для единоборств в Казахстане | Profik.kz',
    template: '%s | PFS',
  },
  description: `Профессиональное оборудование для единоборств от производителя ${company.brand}. Боксёрские мешки, манекены, покрытия, лапы. Изготовление под заказ от ${company.minProductionDays} дней. Доставка по Казахстану.`,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Profik.kz',
    url: siteUrl,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="flex min-h-screen flex-col">
        {/* Organization + WebSite на всём сайте (Том 5, п. 5.3) — SSR, в HTML */}
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
