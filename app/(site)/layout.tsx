import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { organizationLd, websiteLd } from '@/lib/seo';

/** Оболочка публичного сайта: шапка, подвал, разметка Organization/WebSite. */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'ru_RU', siteName: 'Profik.kz' },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Organization + WebSite на всём сайте (Том 5, п. 5.3) — SSR, в HTML */}
      <JsonLd data={[organizationLd(), websiteLd()]} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
