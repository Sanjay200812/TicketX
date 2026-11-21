'use client';

import React, { ViewTransition, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import clsx from 'clsx';
import { Bookmark, Heart } from 'lucide-react';
import type { Movie } from '@/lib/types';
import { Poster } from './Poster';
import { CertBadge } from './ui';
import { compact, releaseLabel } from '@/lib/format';
import { useTicketX } from '@/context/TicketXContext';

export function MovieCard({ movie, morph = true, className }: { movie: Movie; morph?: boolean; className?: string }) {
  const { watchlist, toggleWatch, toast } = useTicketX();
  const saved = watchlist.includes(movie.id);
  const poster = <Poster movie={movie} className="rounded-xl" />;

  return (
    <div className={clsx('group relative', className)}>
      <Link href={`/movies/${movie.id}`} transitionTypes={['nav-forward']} className="block">
        <Tilt>
          {morph ? (
            <ViewTransition name={`poster-${movie.id}`} share="morph" default="none">
              {poster}
            </ViewTransition>
          ) : (
            poster
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pb-2.5 pt-8 text-[12.5px]">
            {movie.rating ? (
              <>
                <span className="font-semibold text-cream">★ {movie.rating.toFixed(1)}</span>
                <span className="text-cream/60">{movie.votes ? `${compact(movie.votes)} votes` : 'critics'}</span>
              </>
            ) : movie.interested ? (
              <>
                <Heart size={12} className="fill-marquee text-marquee" />
                <span className="text-cream/80">{compact(movie.interested)} interested</span>
              </>
            ) : (
              <span className="text-cream/80">
                {movie.status === 'coming_soon'
                  ? `In cinemas ${releaseLabel(movie.releaseDate)}`
                  : movie.advance && movie.firstShow
                    ? `Advance booking · from ${releaseLabel(movie.firstShow).replace(/ \d{4}$/, '')}`
                    : 'Now showing'}
              </span>
            )}
          </div>
        </Tilt>
        <div className="mt-3 space-y-1 px-0.5">
          <h3 className="truncate text-[15px] font-semibold leading-tight text-cream">{movie.title}</h3>
          <div className="flex items-center gap-2 text-[12.5px] text-muted">
            <CertBadge cert={movie.certificate} className="!h-[18px] !text-[10px]" />
            <span className="truncate">
              {movie.status === 'coming_soon' ? `Releasing ${releaseLabel(movie.releaseDate)}` : movie.genres.slice(0, 2).join(' · ')}
            </span>
          </div>
          <p className="truncate text-[12.5px] text-faint">{movie.languages.join(', ')}</p>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => {
          toggleWatch(movie.id);
          toast(saved ? `Removed ${movie.title} from watchlist` : `Saved ${movie.title} to watchlist`, saved ? 'info' : 'success');
        }}
        aria-label={saved ? 'Remove from watchlist' : 'Save to watchlist'}
        aria-pressed={saved}
        className={clsx(
          'absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/55 backdrop-blur transition-opacity duration-200',
          saved ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100',
        )}
      >
        <Bookmark size={15} className={saved ? 'fill-cream text-cream' : 'text-cream'} />
      </button>
    </div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[2/3] rounded-xl" />
      <div className="skeleton mt-3 h-4 w-3/4 rounded" />
      <div className="skeleton mt-2 h-3 w-1/2 rounded" />
    </div>
  );
}

/**
 * 3D tilt: the card rotates toward the cursor with a soft glare, like holding a printed poster.
 * Only on devices with a fine pointer; touch devices get the static card.
 */
function Tilt({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [9, -9]), { stiffness: 220, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-11, 11]), { stiffness: 220, damping: 20 });
  const lift = useSpring(0, { stiffness: 260, damping: 24 });
  const gx = useTransform(px, [0, 1], ['0%', '100%']);
  const gy = useTransform(py, [0, 1], ['0%', '100%']);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.22), transparent 55%)`;
  const glareOpacity = useTransform(lift, [0, 1], [0, 1]);

  const fine = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  return (
    <div style={{ perspective: 900 }}>
      <motion.div
        ref={ref}
        onPointerMove={(e) => {
          if (!fine() || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
          lift.set(1);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
          lift.set(0);
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', y: useTransform(lift, [0, 1], [0, -6]) }}
        className="relative overflow-hidden rounded-xl shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)] ring-1 ring-line transition-shadow duration-300 hover:shadow-[0_30px_50px_-24px_rgba(0,0,0,0.95)]"
      >
        {children}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-10 mix-blend-soft-light" style={{ background: glare, opacity: glareOpacity }} />
      </motion.div>
    </div>
  );
}
