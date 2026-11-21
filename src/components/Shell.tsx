'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Clapperboard, Film, Home, MapPin, Search, Ticket, User as UserIcon, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useTicketX, useArea } from '@/context/TicketXContext';
import { useCatalog } from '@/context/CatalogContext';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" transitionTypes={['nav-back']} className={clsx('flex items-center gap-2', className)} aria-label="TicketX home">
      <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
        <path
          d="M3 0h22a3 3 0 0 1 3 3v4.2a2.8 2.8 0 0 0 0 5.6V17a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-4.2a2.8 2.8 0 0 0 0-5.6V3a3 3 0 0 1 3-3Z"
          fill="#ef4a33"
        />
        <path d="M19 3.5v13" stroke="#0b0a09" strokeWidth="1.4" strokeDasharray="1.6 1.8" />
        <path d="M7.5 6.5 13 13.5M13 6.5l-5.5 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-[19px] font-bold tracking-tight">
        Ticket<span className="text-marquee">X</span>
      </span>
    </Link>
  );
}

const NAV = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/cinemas', label: 'Cinemas', icon: Clapperboard },
  { href: '/account', label: 'Bookings', icon: Ticket },
];

export function Header() {
  const pathname = usePathname();
  const area = useArea();
  const { city } = useCatalog();
  const { openCityPicker, setSearchOpen, user, requireSignIn, switchingCity, area: chosenArea } = useTicketX();
  const [scrolled, setScrolled] = useState(false);
  const inBooking = pathname.startsWith('/book');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === '/' && !(e.target as HTMLElement)?.closest('input,textarea')) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);

  if (inBooking) return null;

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 w-full transition-[background,border-color] duration-300',
        scrolled ? 'border-b border-line bg-canvas/85 backdrop-blur-xl' : 'border-b border-transparent bg-canvas/0',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        <button
          onClick={() => openCityPicker(true)}
          className="ml-1 hidden items-center gap-1 rounded-md px-2 py-1 text-sm text-muted transition-colors hover:text-cream sm:flex"
        >
          <MapPin size={14} className={switchingCity ? 'animate-pulse text-marquee' : ''} />
          <span className="font-semibold text-cream">{city.name}</span>
          {chosenArea && <span className="hidden max-w-[150px] truncate lg:inline">· {area.name}</span>}
          <ChevronDown size={14} />
        </button>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.slice(1).map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={clsx('relative rounded-md px-3 py-2 text-sm font-medium transition-colors', active ? 'text-cream' : 'text-muted hover:text-cream')}
              >
                {n.label}
                {active && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-marquee" />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg border border-line bg-panel/70 px-3 text-sm text-faint transition-colors hover:border-line-strong hover:text-muted md:w-72"
          >
            <Search size={15} />
            <span className="hidden md:inline">Search movies, cinemas</span>
            <kbd className="ml-auto hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] md:inline">Ctrl K</kbd>
          </button>
          <button
            onClick={() => openCityPicker(true)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted sm:hidden"
            aria-label="Change area"
          >
            <MapPin size={16} />
          </button>
          {user ? (
            <Link
              href="/account"
              className="grid h-9 w-9 place-items-center rounded-full bg-panel-3 text-sm font-semibold text-cream ring-1 ring-line-strong"
              aria-label="Your account"
            >
              {user.name.trim().charAt(0).toUpperCase()}
            </Link>
          ) : (
            <button onClick={() => requireSignIn()} className="hidden h-9 rounded-lg bg-cream px-4 text-sm font-semibold text-canvas hover:bg-white md:block">
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  if (pathname.startsWith('/book')) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-canvas/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {NAV.map((n) => {
          const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href);
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href} className={clsx('flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium', active ? 'text-cream' : 'text-faint')}>
              <Icon size={19} className={active ? 'text-marquee' : ''} />
              {n.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Footer() {
  const pathname = usePathname();
  const { city, fetchedAt } = useCatalog();
  if (pathname.startsWith('/book')) return null;
  return (
    <footer className="mt-24 border-t border-line pb-24 md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Films now playing in {city.name}, real showtimes at the city&apos;s cinemas, and a 3D view from your seat before you book.
          </p>
        </div>
        {[
          { h: 'Explore', l: [['Now showing', '/movies'], ['Coming soon', '/movies?status=coming_soon'], ['Cinemas', '/cinemas']] },
          { h: 'Your account', l: [['Bookings', '/account'], ['Watchlist', '/account?tab=watchlist'], ['Offers', '/#offers']] },
          { h: 'Help', l: [['Cancellation policy', '/help#cancellation'], ['Ticket FAQs', '/help'], ['Contact support', '/help#contact']] },
        ].map((col) => (
          <div key={col.h}>
            <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">{col.h}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.l.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted transition-colors hover:text-cream">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-2 border-t border-line px-4 pt-6 text-xs text-faint sm:flex-row sm:justify-between sm:px-6">
        <span>© {new Date().getFullYear()} TicketX. Ticket prices include GST. Convenience fee is charged per ticket.</span>
        <span className="max-w-xl sm:text-right">
          Films, posters, showtimes, screens and seat prices as listed on District (updated {new Date(fetchedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}). TicketX is
          not affiliated with District or BookMyShow. Seat positions are laid out from each class&apos;s seat count; bookings are a demo.
        </span>
      </div>
    </footer>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useTicketX();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = t.tone === 'success' ? CheckCircle2 : t.tone === 'error' ? AlertCircle : Info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-xl border border-line-strong bg-panel-2 py-2.5 pl-3 pr-2 text-[13px] shadow-2xl"
              role="status"
            >
              <Icon size={16} className={clsx('shrink-0', t.tone === 'success' ? 'text-ok' : t.tone === 'error' ? 'text-low' : 'text-muted')} />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismissToast(t.id)} className="rounded p-1 text-faint hover:text-cream" aria-label="Dismiss">
                <X size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
