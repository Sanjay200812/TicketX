'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, Heart, Info, MapPin, Search, SlidersHorizontal, Utensils, X } from 'lucide-react';
import { Page } from '@/components/Page';
import { DateStrip } from '@/components/DateStrip';
import { AvailabilityLegend, ShowtimeChip } from '@/components/ShowtimeChip';
import { CertBadge, Chip, Dot } from '@/components/ui';
import { showsForMovie, upcomingDates } from '@/lib/shows';
import { useCatalog } from '@/context/CatalogContext';
import { runtime, timeBand } from '@/lib/format';
import { isPast, useFavCinemas, useNow } from '@/lib/hooks';
import { useArea, useCinemas, useTicketX } from '@/context/TicketXContext';
import type { Format, Language } from '@/lib/types';

const BANDS = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;
const PRICES = [
  { id: 'lt200', label: 'Under ₹200', test: (min: number) => min < 200 },
  { id: '200-400', label: '₹200 – ₹400', test: (min: number) => min >= 200 && min <= 400 },
  { id: 'gt400', label: '₹400+', test: (min: number) => min > 400 },
];

export default function ShowsPage() {
  return (
    <Suspense fallback={null}>
      <Shows />
    </Suspense>
  );
}

function Shows() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const { getMovie } = useCatalog();
  const movie = getMovie(id);
  const area = useArea();
  const cinemas = useCinemas();
  const { openCityPicker } = useTicketX();
  const now = useNow();
  const { favs, toggle } = useFavCinemas();
  const dates = useMemo(() => upcomingDates(7), []);
  const [date, setDate] = useState(dates[0]);
  const [lang, setLang] = useState<Language | null>((params.get('lang') as Language) || null);
  const [format, setFormat] = useState<Format | null>((params.get('format') as Format) || null);
  const [bands, setBands] = useState<string[]>([]);
  const [price, setPrice] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const emptyDates = useMemo(
    () => (movie ? dates.filter((d) => showsForMovie(movie, cinemas, d).length === 0) : dates),
    [movie, dates, cinemas],
  );

  const groups = useMemo(() => {
    if (!movie) return [];
    const priceTest = PRICES.find((p) => p.id === price)?.test;
    return showsForMovie(movie, cinemas, date)
      .filter((g) => !q || g.cinema.name.toLowerCase().includes(q.toLowerCase()))
      .map((g) => ({
        ...g,
        shows: g.shows.filter(
          (s) =>
            (!lang || s.language === lang) &&
            (!format || s.format === format) &&
            (bands.length === 0 || bands.includes(timeBand(s.time))) &&
            (!priceTest || priceTest(s.minPrice)),
        ),
      }))
      .filter((g) => g.shows.length > 0)
      .sort((a, b) => Number(favs.includes(b.cinema.id)) - Number(favs.includes(a.cinema.id)) || a.cinema.distanceKm - b.cinema.distanceKm);
  }, [movie, cinemas, date, lang, format, bands, price, q, favs]);

  if (!movie || movie.status !== 'now_showing') {
    return (
      <Page>
        <div className="mx-auto max-w-md px-4 py-32 text-center">
          <h1 className="text-2xl font-semibold">Bookings aren&apos;t open for this film</h1>
          <Link href={movie ? `/movies/${movie.id}` : '/movies'} className="mt-4 inline-block text-marquee hover:underline">
            Go back
          </Link>
        </div>
      </Page>
    );
  }

  const activeFilters = [lang, format, price, ...bands].filter(Boolean).length;
  const clear = () => {
    setLang(null);
    setFormat(null);
    setBands([]);
    setPrice(null);
    setQ('');
  };

  const filterBody = (
    <div className="space-y-5">
      <FilterGroup label="Language">
        {movie.languages.map((l) => (
          <Chip key={l} active={lang === l} onClick={() => setLang(lang === l ? null : l)}>
            {l}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="Format">
        {movie.formats.map((f) => (
          <Chip key={f} active={format === f} onClick={() => setFormat(format === f ? null : f)}>
            {f}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="Show time">
        {BANDS.map((b) => (
          <Chip key={b} active={bands.includes(b)} onClick={() => setBands(bands.includes(b) ? bands.filter((x) => x !== b) : [...bands, b])}>
            {b}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="Price">
        {PRICES.map((p) => (
          <Chip key={p.id} active={price === p.id} onClick={() => setPrice(price === p.id ? null : p.id)}>
            {p.label}
          </Chip>
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <Page>
      <div className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-6 sm:px-6">
          <Link href={`/movies/${movie.id}`} transitionTypes={['nav-back']} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-cream">
            <ArrowLeft size={15} /> {movie.title}
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {movie.title} <span className="text-muted">— showtimes</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-y-1 text-[13px] text-muted">
            <CertBadge cert={movie.certificate} className="mr-2" />
            {movie.genres.join(', ')}
            <Dot />
            {runtime(movie.runtime)}
            <Dot />
            <button onClick={() => openCityPicker(true)} className="inline-flex items-center gap-1 hover:text-cream">
              <MapPin size={13} /> Near {area.name} <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 border-b border-line bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2 sm:px-6">
          <DateStrip dates={dates} value={date} onChange={setDate} disabled={emptyDates} />
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-line px-3">
              <Search size={14} className="text-faint" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cinema" className="w-36 bg-transparent text-sm outline-none placeholder:text-faint" />
            </div>
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            className="ml-auto flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line px-3 text-sm text-muted hover:text-cream lg:ml-0"
          >
            <SlidersHorizontal size={14} /> Filters
            {activeFilters > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-marquee px-1 text-[11px] font-semibold text-white">{activeFilters}</span>}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <AvailabilityLegend />
          {activeFilters > 0 && (
            <button onClick={clear} className="inline-flex items-center gap-1 text-xs font-medium text-marquee hover:underline">
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${date}-${area.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden rounded-xl border border-line"
          >
            {groups.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="font-medium">No shows match these filters</p>
                <p className="mt-1 text-sm text-muted">Try another date or clear the filters.</p>
                {activeFilters > 0 && (
                  <button onClick={clear} className="mt-4 text-sm font-medium text-marquee hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              groups.map(({ cinema, shows }, gi) => (
                <motion.div
                  key={cinema.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(gi * 0.03, 0.3) }}
                  className={clsx('grid gap-4 bg-panel p-5 md:grid-cols-[minmax(240px,320px)_1fr] md:gap-8', gi > 0 && 'border-t border-line')}
                >
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggle(cinema.id)} aria-label={favs.includes(cinema.id) ? 'Remove favourite' : 'Mark favourite'} className="mt-0.5 text-faint hover:text-marquee">
                      <Heart size={16} className={favs.includes(cinema.id) ? 'fill-marquee text-marquee' : ''} />
                    </button>
                    <div className="min-w-0">
                      <Link href={`/cinemas/${cinema.id}`} className="font-semibold leading-snug hover:underline">
                        {cinema.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
                        <span>{cinema.distanceKm} km away</span>
                        {cinema.amenities.includes('Food & Beverages') && (
                          <span className="inline-flex items-center gap-1">
                            <Utensils size={11} /> F&B
                          </span>
                        )}
                        <span className={cinema.cancellable ? 'text-ok/80' : ''}>{cinema.cancellable ? 'Cancellation available' : 'Non-cancellable'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {shows.map((s) => (
                      <ShowtimeChip key={s.id} show={s} past={isPast(s.date, s.time, now)} showLanguage={!lang && movie.languages.length > 1} />
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>

        <p className="mt-4 flex items-start gap-2 text-xs text-faint">
          <Info size={13} className="mt-px shrink-0" /> Prices shown on hover include GST. A convenience fee of ₹28 + GST per ticket applies at checkout.
        </p>
      </div>

      {/* Filters sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div className="fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setFiltersOpen(false)} />
            <motion.aside
              className="absolute bottom-0 right-0 top-0 flex w-full max-w-sm flex-col border-l border-line bg-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="font-semibold">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="text-muted hover:text-cream">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="mb-5 flex h-10 items-center gap-2 rounded-lg border border-line px-3 lg:hidden">
                  <Search size={14} className="text-faint" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cinema" className="w-full bg-transparent text-sm outline-none placeholder:text-faint" />
                </div>
                {filterBody}
              </div>
              <div className="flex gap-3 border-t border-line p-4">
                <button onClick={clear} className="h-11 flex-1 rounded-lg border border-line-strong text-sm font-medium">
                  Reset
                </button>
                <button onClick={() => setFiltersOpen(false)} className="h-11 flex-1 rounded-lg bg-marquee text-sm font-semibold text-white">
                  Show {groups.reduce((a, g) => a + g.shows.length, 0)} shows
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-faint">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
