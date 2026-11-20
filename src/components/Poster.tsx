import React from 'react';
import clsx from 'clsx';
import type { Movie } from '@/lib/types';
import { dayParts } from '@/lib/format';

const FONT: Record<Movie['poster']['font'], string> = {
  anton: 'var(--font-anton)',
  serif: 'var(--font-dmserif)',
  grotesk: 'var(--font-grotesk)',
  condensed: 'var(--font-oswald)',
  slab: 'var(--font-slab)',
};

type Props = {
  movie: Movie;
  variant?: 'poster' | 'wide';
  className?: string;
  /** hide text (used for blurred backdrops) */
  bare?: boolean;
  /** load immediately (above-the-fold images) */
  priority?: boolean;
};

/**
 * Poster artwork drawn in CSS so every film has distinct, print-like key art
 * without shipping image files. Sizes scale with the container (cqw units).
 */
export function Poster({ movie, variant = 'poster', className, bare, priority }: Props) {
  const p = movie.poster;
  const wide = variant === 'wide';
  const image = wide ? movie.backdropUrl : movie.posterUrl;

  if (image) {
    // Real artwork. No fade-in on load: the same URL is reused across pages, so it is usually
    // already decoded, and a fade would make view-transition morphs flash.
    return (
      <div
        className={clsx('relative select-none overflow-hidden bg-panel-3', wide ? 'aspect-[16/9]' : 'aspect-[2/3]', className)}
        style={{ backgroundColor: p.bg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={bare ? '' : `${movie.title} ${wide ? 'still' : 'poster'}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }
  const words = movie.title.toUpperCase().split(' ');
  const longest = Math.max(...words.map((w) => w.length));
  const titleSize = wide ? Math.min(9, 70 / Math.max(longest, 6)) : Math.min(24, 118 / Math.max(longest, 4));
  const release = dayParts(movie.releaseDate);
  const billing = movie.cast.slice(0, 3).map((c) => c.name.toUpperCase());

  return (
    <div
      className={clsx('grain relative overflow-hidden select-none', wide ? 'aspect-[16/9]' : 'aspect-[2/3]', className)}
      style={{ background: `linear-gradient(170deg, ${p.bg} 0%, ${p.bg2} 100%)`, containerType: 'inline-size', color: p.ink }}
      aria-hidden={bare ? true : undefined}
      role={bare ? undefined : 'img'}
      aria-label={bare ? undefined : `${movie.title} poster`}
    >
      <Art movie={movie} wide={wide} />

      {!bare && (
        <>
          {/* top billing */}
          <div
            className="absolute inset-x-0 top-[4.5%] flex justify-center gap-[4cqw] px-[6cqw] text-center tracking-[0.18em] opacity-80"
            style={{ fontFamily: 'var(--font-oswald)', fontSize: wide ? '1.25cqw' : '2.9cqw' }}
          >
            {billing.map((b) => (
              <span key={b} className="truncate">
                {b}
              </span>
            ))}
          </div>

          {/* title */}
          <div
            className={clsx(
              'absolute inset-x-0 px-[6cqw] text-center leading-[0.88]',
              titleAnchor(p.layout, wide),
            )}
            style={{ fontFamily: FONT[p.font], fontSize: `${titleSize}cqw`, letterSpacing: p.font === 'serif' ? '-0.01em' : '0.01em' }}
          >
            {movie.originalTitle && !wide && (
              <div className="mb-[2cqw] opacity-80" style={{ fontSize: '0.32em', fontFamily: 'var(--font-ui)', letterSpacing: 0 }}>
                {movie.originalTitle}
              </div>
            )}
            {p.font === 'serif' ? movie.title : words.map((w, i) => <div key={i}>{w}</div>)}
            {!wide && (
              <div
                className="mt-[3cqw] italic opacity-85"
                style={{ fontFamily: 'var(--font-dmserif)', fontSize: '0.2em', letterSpacing: 0, lineHeight: 1.25 }}
              >
                {movie.tagline}
              </div>
            )}
          </div>

          {/* credit block */}
          {!wide && (
            <div className="absolute inset-x-0 bottom-[3.5%] px-[7cqw] text-center">
              <div
                className="mx-auto leading-[1.25] opacity-60"
                style={{ fontFamily: 'var(--font-oswald)', fontSize: '1.9cqw', letterSpacing: '0.06em' }}
              >
                A {movie.director.toUpperCase()} FILM · MUSIC {movie.music.toUpperCase()} · DIRECTOR OF PHOTOGRAPHY{' '}
                {movie.cinematography.toUpperCase()} · WRITTEN BY {movie.writers.join(' & ').toUpperCase()}
              </div>
              <div
                className="mt-[2cqw] tracking-[0.3em]"
                style={{ fontFamily: 'var(--font-oswald)', fontSize: '3cqw', color: p.accent }}
              >
                {movie.status === 'now_showing' ? 'NOW IN CINEMAS' : `${release.day} ${release.month.toUpperCase()}`}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function titleAnchor(layout: Movie['poster']['layout'], wide: boolean) {
  if (wide) return 'bottom-[12%] text-left !px-[5cqw]';
  switch (layout) {
    case 'bands':
    case 'stack':
      return 'top-[11%]';
    case 'frame':
    case 'split':
      return 'top-1/2 -translate-y-1/2';
    default:
      return 'bottom-[17%]';
  }
}

function Art({ movie, wide }: { movie: Movie; wide: boolean }) {
  const p = movie.poster;
  switch (p.layout) {
    case 'sun':
      return (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: wide ? '34%' : '78%',
              aspectRatio: '1',
              left: wide ? '58%' : '11%',
              top: wide ? '10%' : '16%',
              background: `radial-gradient(circle at 50% 40%, ${p.accent}, ${p.accent}cc 55%, ${p.accent}00 72%)`,
            }}
          />
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="absolute inset-x-0"
              style={{ top: `${(wide ? 52 : 50) + i * (2 + i)}%`, height: `${0.6 + i * 0.35}%`, background: p.bg }}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 h-[45%]" style={{ background: `linear-gradient(to top, ${p.bg}, transparent)` }} />
        </>
      );
    case 'bands':
      return (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute inset-x-0"
              style={{
                top: `${46 + i * 8}%`,
                height: `${3 + (i % 3)}%`,
                background: i === 2 ? p.accent : p.bg2,
                opacity: i === 2 ? 1 : 0.55 + i * 0.07,
              }}
            />
          ))}
          <div
            className="absolute"
            style={{ left: wide ? '55%' : '14%', right: wide ? '8%' : '14%', top: '58.5%', height: '4.5%', background: p.bg, borderRadius: '3px' }}
          />
          {Array.from({ length: wide ? 10 : 7 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${(wide ? 57 : 18) + i * (wide ? 3.5 : 10)}%`,
                top: '59.6%',
                width: wide ? '1.6%' : '5%',
                height: '1.6%',
                background: p.accent,
                opacity: 0.9,
              }}
            />
          ))}
        </>
      );
    case 'ridge':
      return (
        <>
          <div
            className="absolute rounded-full blur-2xl"
            style={{ width: '60%', aspectRatio: '1', left: wide ? '50%' : '20%', top: '18%', background: p.accent, opacity: 0.55 }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[62%]"
            style={{ background: p.bg2, clipPath: 'polygon(0 38%, 14% 22%, 27% 34%, 41% 8%, 55% 30%, 68% 16%, 82% 36%, 100% 20%, 100% 100%, 0 100%)', opacity: 0.85 }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[44%]"
            style={{ background: p.bg, clipPath: 'polygon(0 30%, 18% 46%, 33% 20%, 50% 42%, 64% 24%, 80% 48%, 100% 28%, 100% 100%, 0 100%)' }}
          />
        </>
      );
    case 'stack':
      return (
        <div
          className="absolute inset-x-[-5%] bottom-[18%] flex flex-col items-center leading-[0.82] opacity-90"
          style={{ fontFamily: 'var(--font-anton)', fontSize: wide ? '9cqw' : '22cqw' }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                color: i === 1 ? p.accent : 'transparent',
                WebkitTextStroke: i === 1 ? undefined : `0.3cqw ${p.ink}`,
                opacity: i === 1 ? 1 : 0.35,
              }}
            >
              {movie.title.toUpperCase().split(' ').slice(-1)[0]}
            </span>
          ))}
        </div>
      );
    case 'frame':
      return (
        <>
          <div className="absolute inset-[5%]" style={{ border: `1px solid ${p.ink}`, opacity: 0.4 }} />
          <div
            className="absolute"
            style={{
              left: wide ? '68%' : '34%',
              width: wide ? '14%' : '32%',
              top: wide ? '18%' : '14%',
              height: wide ? '64%' : '26%',
              borderRadius: '999px 999px 0 0',
              background: `linear-gradient(to bottom, ${p.accent}, ${p.accent}22)`,
              opacity: 0.85,
            }}
          />
        </>
      );
    case 'split':
      return (
        <>
          <div className="absolute inset-0" style={{ background: p.bg2, clipPath: 'polygon(0 62%, 100% 38%, 100% 100%, 0 100%)', opacity: 0.92 }} />
          <div className="absolute inset-x-0" style={{ top: '49.5%', height: '1.2%', background: p.accent, transform: 'skewY(-13.5deg)' }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${p.bg}00 40%, ${p.bg}cc)` }} />
        </>
      );
    case 'rings':
      return (
        <>
          {[90, 70, 50, 32].map((s, i) => (
            <div
              key={s}
              className="absolute rounded-full"
              style={{
                width: wide ? `${s * 0.42}%` : `${s}%`,
                aspectRatio: '1',
                left: wide ? `${72 - (s * 0.42) / 2}%` : `${50 - s / 2}%`,
                top: wide ? `calc(50% - ${(s * 0.42) / 2 * 1.78}%)` : `${38 - s / 3}%`,
                border: `1px solid ${p.ink}`,
                opacity: 0.18 + i * 0.1,
              }}
            />
          ))}
          <div
            className="absolute rounded-full"
            style={{
              width: wide ? '1.4%' : '4%',
              aspectRatio: '1',
              left: wide ? '84%' : '78%',
              top: wide ? '30%' : '20%',
              background: p.accent,
              boxShadow: `0 0 24px 6px ${p.accent}`,
            }}
          />
        </>
      );
    case 'grid':
      return (
        <>
          {Array.from({ length: 18 }).map((_, i) => {
            const r = (i * 37) % 100;
            const s = 4 + ((i * 13) % 7);
            return (
              <div
                key={i}
                className="absolute rounded-[40%]"
                style={{
                  width: wide ? `${s * 0.45}%` : `${s}%`,
                  aspectRatio: '0.8',
                  left: `${(i * 53) % 92}%`,
                  top: `${6 + (r * 0.55)}%`,
                  background: `radial-gradient(circle at 50% 35%, #fff6d9, ${p.accent} 60%)`,
                  boxShadow: `0 0 18px 2px ${p.accent}88`,
                  opacity: 0.55 + (i % 4) * 0.12,
                }}
              />
            );
          })}
        </>
      );
  }
}
