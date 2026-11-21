'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Copy, MapPin } from 'lucide-react';
import { Page } from '@/components/Page';
import { Hero } from '@/components/Hero';
import { MovieCard } from '@/components/MovieCard';
import { Rail } from '@/components/Rail';
import { Chip, SectionHeader } from '@/components/ui';
import { OFFERS } from '@/lib/catalog';
import { useArea, useCinemas, useTicketX } from '@/context/TicketXContext';
import { useCatalog } from '@/context/CatalogContext';
import type { Language } from '@/lib/types';

export default function HomePage() {
  const area = useArea();
  const allCinemas = useCinemas();
  const { toast, openCityPicker, hydrated, area: chosenArea } = useTicketX();
  // First visit: ask which city and area the user is in, so cinemas sort by real distance
  useEffect(() => {
    if (hydrated && !chosenArea) openCityPicker(true);
  }, [hydrated, chosenArea, openCityPicker]);
  const { featured, nowShowing: allNow, comingSoon, city } = useCatalog();
  const [lang, setLang] = useState<Language | 'All'>('All');
  // Language chips: the languages actually playing in this city, most common first
  const LANGS = useMemo<(Language | 'All')[]>(() => {
    const count = new Map<string, number>();
    allNow.forEach((m) => m.languages.forEach((l) => count.set(l, (count.get(l) ?? 0) + 1)));
    return ['All', ...[...count.entries()].sort((a, b) => b[1] - a[1]).map(([l]) => l).slice(0, 8)];
  }, [allNow]);
  const nowShowing = useMemo(() => allNow.filter((m) => lang === 'All' || m.languages.includes(lang)), [lang, allNow]);
  const cinemas = allCinemas.slice(0, 4);

  return (
    <Page>
      {featured.length > 0 && <Hero movies={featured} />}

      <div className="mx-auto max-w-7xl space-y-16 px-4 pt-12 sm:px-6">
        <section>
          <SectionHeader
            title={`Now showing in ${city.name}`}
            sub={`${allNow.length} films · ${allCinemas.length} cinemas · showtimes as listed on District`}
            action={
              <Link href="/movies" className="flex shrink-0 items-center gap-1 text-sm font-medium text-muted hover:text-cream">
                See all <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
            {LANGS.map((l) => (
              <Chip key={l} active={lang === l} onClick={() => setLang(l)}>
                {l}
              </Chip>
            ))}
          </div>
          <AnimatePresence mode="popLayout">
            {nowShowing.length > 0 ? (
              <motion.div key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Rail>
                  {nowShowing.map((m) => (
                    <MovieCard key={m.id} movie={m} />
                  ))}
                </Rail>
              </motion.div>
            ) : (
              <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-dashed border-line py-14 text-center text-sm text-muted">
                No {lang} films are playing this week.
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        <section id="offers" className="scroll-mt-24">
          <SectionHeader title="Offers for you" sub="Apply the code at checkout" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OFFERS.map((o) => (
              <div key={o.code} className="relative flex overflow-hidden rounded-xl border border-line bg-panel">
                <div className="flex-1 p-4">
                  <p className="text-[15px] font-semibold leading-snug">{o.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{o.description}</p>
                  <p className="mt-3 text-[11.5px] text-faint">{o.terms}</p>
                </div>
                <div className="relative w-px border-l border-dashed border-line-strong">
                  <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-canvas" />
                  <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-canvas" />
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(o.code).catch(() => {});
                    toast(`Copied ${o.code}`, 'success');
                  }}
                  className="group flex w-[74px] flex-col items-center justify-center gap-2 text-faint transition-colors hover:text-cream"
                  aria-label={`Copy code ${o.code}`}
                >
                  <span className="font-mono text-[11px] font-semibold tracking-wider text-marquee [writing-mode:vertical-rl] rotate-180">{o.code}</span>
                  <Copy size={13} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Coming soon"
            sub="Get notified when bookings open"
            action={
              <Link href="/movies?status=coming_soon" className="flex shrink-0 items-center gap-1 text-sm font-medium text-muted hover:text-cream">
                See all <ArrowRight size={14} />
              </Link>
            }
          />
          <Rail>
            {comingSoon.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </Rail>
        </section>

        <section>
          <SectionHeader
            title="Cinemas near you"
            sub={
              <button onClick={() => openCityPicker(true)} className="hover:text-cream">
                Nearest to {area.name} · <span className="text-marquee">change</span>
              </button>
            }
            action={
              <Link href="/cinemas" className="flex shrink-0 items-center gap-1 text-sm font-medium text-muted hover:text-cream">
                All cinemas <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {cinemas.map((c) => (
              <Link key={c.id} href={`/cinemas/${c.id}`} transitionTypes={['nav-forward']} className="group flex items-start gap-4 bg-panel p-5 transition-colors hover:bg-panel-2">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-panel-3 text-xs font-bold tracking-wide text-muted">
                  {c.chain
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate font-semibold">{c.name}</h3>
                    <span className="shrink-0 text-xs text-faint">{c.distanceKm} km</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 truncate text-[13px] text-muted">
                    <MapPin size={12} className="shrink-0" /> {c.address}
                  </p>
                  <p className="mt-2 truncate text-xs text-faint">{c.amenities.slice(0, 4).join(' · ')}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}
