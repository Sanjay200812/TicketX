import type { Metadata, Viewport } from 'next';
import { Anton, DM_Serif_Display, Instrument_Sans, Instrument_Serif, Oswald, Space_Grotesk, Zilla_Slab } from 'next/font/google';
import './globals.css';
import { TicketXProvider } from '@/context/TicketXContext';
import { CatalogProvider } from '@/context/CatalogContext';
import { getCatalog } from '@/lib/tmdb';
import { Footer, Header, MobileNav, Toasts } from '@/components/Shell';
import { CityPicker, SearchOverlay, SignInModal, TrailerModal } from '@/components/Overlays';

const ui = Instrument_Sans({ subsets: ['latin'], variable: '--font-ui', display: 'swap' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton', display: 'swap' });
const dmserif = DM_Serif_Display({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-dmserif', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-grotesk', display: 'swap' });
const oswald = Oswald({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-oswald', display: 'swap' });
const slab = Zilla_Slab({ subsets: ['latin'], weight: '700', variable: '--font-slab', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'TicketX · Movie tickets, showtimes & seats', template: '%s · TicketX' },
  description: 'Book movie tickets in Hyderabad. Real films now in cinemas, showtimes at AMB, Prasads, PVR, INOX and more, and a 3D seat picker.',
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#0b0a09',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const catalog = await getCatalog();
  return (
    <html
      lang="en"
      className={[ui.variable, serif.variable, anton.variable, dmserif.variable, grotesk.variable, oswald.variable, slab.variable].join(' ')}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-canvas text-cream antialiased" suppressHydrationWarning>
        <CatalogProvider movies={catalog.movies} source={catalog.source}>
        <TicketXProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer source={catalog.source} />
          <MobileNav />
          <CityPicker />
          <SignInModal />
          <SearchOverlay />
          <TrailerModal />
          <Toasts />
        </TicketXProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
