'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, ChevronLeft, ChevronRight, Play, Ticket } from 'lucide-react';
import clsx from 'clsx';
import type { Movie } from '@/lib/types';
import { Poster } from './Poster';
import { Button, CertBadge, Dot, Rating } from './ui';
import { releaseLabel, runtime } from '@/lib/format';
import { useTicketX } from '@/context/TicketXContext';

const DURATION = 7000;
const SPRING = { type: 'spring' as const, stiffness: 120, damping: 22, mass: 0.9 };

/**
 * Featured films as a 3D coverflow: posters sit on an arc in real 3D space (CSS perspective),
 * the active film's backdrop fills the background, and the info panel crossfades.
 */
export function Hero({ movies }: { movies: Movie[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragging = useRef(false);
  const { playTrailer, toggleWatch, watchlist, toast } = useTicketX();
  const n = movies.length;
  const m = movies[i];

  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(1), DURATION);
    return () => clearTimeout(t);
  }, [i, paused, go]);

  // Preload backdrops so the background swap never shows an empty frame
  useEffect(() => {
    movies.forEach((mv) => {
      if (mv.backdropUrl) new Image().src = mv.backdropUrl;
    });
  }, [movies]);

  const saved = watchlist.includes(m.id);

  return (
    <section
      className="relative -mt-16 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
      aria-roledescription="carousel"
      aria-label="Featured films"
    >
      {/* Backdrop */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={m.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Poster movie={m} variant="wide" bare priority className="!absolute inset-0 !aspect-auto h-full w-full scale-105" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/80 to-canvas/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-canvas/70" />
      </div>

      <div className="relative mx-auto grid min-h-[640px] max-w-7xl items-center gap-6 px-4 pb-16 pt-24 sm:px-6 lg:h-[86vh] lg:max-h-[820px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pb-10">
        {/* Info */}
        <div className="order-2 lg:order-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl"
            >
              <div className="flex flex-wrap items-center gap-y-1 text-[13px] text-cream/75">
                <CertBadge cert={m.certificate} className="mr-2 !border-cream/30 !text-cream/80" />
                {m.genres.slice(0, 3).join(', ')}
                <Dot />
                {runtime(m.runtime)}
                <Dot />
                {m.languages.length > 2 ? `${m.languages.length} languages` : m.languages.join(', ')}
              </div>
              <h1 className="mt-4 font-display text-[44px] leading-[0.95] tracking-tight sm:text-6xl lg:text-[76px]">{m.title}</h1>
              {m.tagline && <p className="mt-3 font-display text-lg italic text-cream/85">{m.tagline}</p>}
              <p className="mt-3 line-clamp-3 max-w-lg text-[15px] leading-relaxed text-cream/65">{m.synopsis}</p>
              <div className="mt-4 h-6">
                {m.rating ? <Rating value={m.rating} votes={m.votes} size="md" /> : <span className="text-sm text-muted">In cinemas from {releaseLabel(m.releaseDate)}</span>}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={`/movies/${m.id}/shows`} transitionTypes={['nav-forward']}>
                  <Button size="lg">
                    <Ticket size={17} /> Book tickets
                  </Button>
                </Link>
                <Button size="lg" tone="outline" onClick={() => playTrailer(m.id)}>
                  <Play size={16} className="fill-cream" /> Trailer
                </Button>
                <button
                  onClick={() => {
                    toggleWatch(m.id);
                    toast(saved ? 'Removed from watchlist' : 'Saved to watchlist', saved ? 'info' : 'success');
                  }}
                  aria-label="Save to watchlist"
                  aria-pressed={saved}
                  className="grid h-12 w-12 place-items-center rounded-lg border border-line-strong text-cream transition-colors hover:bg-white/5"
                >
                  <Bookmark size={17} className={saved ? 'fill-cream' : ''} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3D coverflow */}
        <div className="order-1 lg:order-2">
          <motion.div
            className="relative mx-auto h-[300px] w-full touch-pan-y select-none sm:h-[380px] lg:h-[460px]"
            style={{ perspective: 1400, perspectiveOrigin: '50% 40%' }}
            onPanStart={() => {
              dragging.current = true;
              setPaused(true);
            }}
            onPanEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 40) go(info.offset.x < 0 ? 1 : -1);
              setTimeout(() => (dragging.current = false), 0);
            }}
          >
            <div className="absolute inset-0 grid place-items-center" style={{ transformStyle: 'preserve-3d' }}>
              {movies.map((mv, idx) => {
                let off = idx - i;
                if (off > n / 2) off -= n;
                if (off < -n / 2) off += n;
                const abs = Math.abs(off);
                const active = off === 0;
                return (
                  <motion.div
                    key={mv.id}
                    role={active ? undefined : 'button'}
                    aria-label={active ? undefined : `Show ${mv.title}`}
                    tabIndex={active || abs > 1 ? -1 : 0}
                    onClick={() => {
                      if (dragging.current) return;
                      if (!active) setI(idx);
                    }}
                    onKeyDown={(e) => {
                      if (!active && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setI(idx);
                      }
                    }}
                    className={clsx('col-start-1 row-start-1 w-[150px] sm:w-[200px] lg:w-[240px]', !active && 'cursor-pointer')}
                    initial={false}
                    animate={{
                      x: `${off * 62}%`,
                      z: -abs * 160,
                      rotateY: off * -32,
                      opacity: abs > 2 ? 0 : 1 - abs * 0.18,
                      scale: active ? 1.06 : 1,
                    }}
                    transition={SPRING}
                    style={{ zIndex: 10 - abs, transformStyle: 'preserve-3d', pointerEvents: abs > 2 ? 'none' : 'auto' }}
                  >
                    {active ? (
                      <Link href={`/movies/${mv.id}`} transitionTypes={['nav-forward']} className="block" draggable={false} aria-label={`Open ${mv.title}`}>
                        <PosterCard movie={mv} active />
                      </Link>
                    ) : (
                      <PosterCard movie={mv} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <div className="mt-2 flex items-center justify-center gap-4">
            <button onClick={() => go(-1)} aria-label="Previous film" className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-muted transition-colors hover:text-cream">
              <ChevronLeft size={17} />
            </button>
            <div className="flex gap-1.5">
              {movies.map((mv, idx) => (
                <button key={mv.id} onClick={() => setI(idx)} aria-label={`Show ${mv.title}`} aria-current={idx === i} className="py-2">
                  <span className="block h-[3px] w-6 overflow-hidden rounded-full bg-cream/15">
                    <span
                      key={`${idx}-${i}-${paused}`}
                      className={clsx('block h-full bg-cream', idx === i ? '' : 'w-0')}
                      style={idx === i ? { animation: paused ? 'none' : `hero-progress ${DURATION}ms linear forwards`, width: paused ? '100%' : undefined } : undefined}
                    />
                  </span>
                </button>
              ))}
            </div>
            <button onClick={() => go(1)} aria-label="Next film" className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-muted transition-colors hover:text-cream">
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes hero-progress { from { width: 0% } to { width: 100% } }`}</style>
    </section>
  );
}

function PosterCard({ movie, active }: { movie: Movie; active?: boolean }) {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-xl ring-1 transition-shadow duration-500',
        active ? 'shadow-[0_40px_80px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.12)] ring-cream/20' : 'shadow-[0_24px_50px_-20px_rgba(0,0,0,0.9)] ring-line',
      )}
      // Floor reflection, like posters standing on a glossy lobby floor
      style={{ WebkitBoxReflect: 'below 6px linear-gradient(transparent 72%, rgba(255,255,255,0.14))' } as React.CSSProperties}
    >
      <Poster movie={movie} priority />
    </div>
  );
}
