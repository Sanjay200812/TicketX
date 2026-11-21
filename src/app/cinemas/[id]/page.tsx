'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Heart, MapPin, Navigation } from 'lucide-react';
import { Page } from '@/components/Page';
import { DateStrip } from '@/components/DateStrip';
import { AvailabilityLegend, ShowtimeChip } from '@/components/ShowtimeChip';
import { Poster } from '@/components/Poster';
import { CertBadge } from '@/components/ui';
import { useCinemas } from '@/context/TicketXContext';
import { useCatalog } from '@/context/CatalogContext';
import { showsAtCinema, upcomingDates } from '@/lib/shows';
import { runtime } from '@/lib/format';
import { isPast, useFavCinemas, useNow } from '@/lib/hooks';

export default function CinemaPage() {
  const { id } = useParams<{ id: string }>();
  const cinema = useCinemas().find((c) => c.id === id);
  const { nowShowing, index } = useCatalog();
  const dates = useMemo(() => upcomingDates(7), []);
  const [date, setDate] = useState(dates[0]);
  const now = useNow();
  const { favs, toggle } = useFavCinemas();

  if (!cinema)
    return (
      <Page>
        <div className="py-32 text-center">
          <h1 className="text-2xl font-semibold">Cinema not found</h1>
          <Link href="/cinemas" className="mt-4 inline-block text-marquee hover:underline">
            All cinemas
          </Link>
        </div>
      </Page>
    );

  const groups = showsAtCinema(index, cinema, nowShowing, date);

  return (
    <Page>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Link href="/cinemas" transitionTypes={['nav-back']} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-cream">
          <ArrowLeft size={15} /> Cinemas
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              {cinema.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cinema.logo} alt="" className="h-12 w-12 shrink-0 rounded-full bg-white object-contain p-1" />
              )}
              <h1 className="text-3xl font-semibold tracking-tight">{cinema.name}</h1>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin size={13} /> {cinema.address} · {cinema.distanceKm} km
            </p>
            {cinema.screens.length > 0 && (
              <p className="mt-2 max-w-2xl text-sm text-cream/80">
                {cinema.screens.length} screen{cinema.screens.length > 1 ? 's' : ''}: {cinema.screens.map((s) => s.name).join(', ')}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {cinema.amenities.map((a) => (
                <span key={a} className="rounded bg-white/[0.05] px-2 py-0.5 text-xs text-muted">
                  {a}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toggle(cinema.id)} className="flex h-10 items-center gap-2 rounded-lg border border-line-strong px-3.5 text-sm font-medium hover:bg-white/5">
              <Heart size={15} className={favs.includes(cinema.id) ? 'fill-marquee text-marquee' : ''} /> {favs.includes(cinema.id) ? 'Favourite' : 'Add to favourites'}
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cinema.address)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center gap-2 rounded-lg border border-line-strong px-3.5 text-sm font-medium hover:bg-white/5"
            >
              <Navigation size={15} /> Directions
            </a>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 mt-6 border-y border-line bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
          <DateStrip dates={dates} value={date} onChange={setDate} id="cinema-date" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <AvailabilityLegend />
        <AnimatePresence mode="wait">
          <motion.div key={date} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-5 space-y-3">
            {groups.length === 0 && <p className="rounded-xl border border-dashed border-line py-16 text-center text-sm text-muted">No shows scheduled for this date yet.</p>}
            {groups.map(({ movie, shows }) => (
              <div key={movie.id} className="flex gap-5 rounded-xl border border-line bg-panel p-5">
                <Link href={`/movies/${movie.id}`} className="w-16 shrink-0 overflow-hidden rounded-md sm:w-20">
                  <Poster movie={movie} bare />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/movies/${movie.id}`} className="font-semibold hover:underline">
                    {movie.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <CertBadge cert={movie.certificate} className="!h-[18px] !text-[10px]" />
                    {movie.genres.join(', ')} · {runtime(movie.runtime)}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {shows.map((s) => (
                      <ShowtimeChip key={s.id} show={s} past={isPast(s.date, s.time, now)} showLanguage />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </Page>
  );
}
