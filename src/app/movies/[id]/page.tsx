'use client';

import React, { ViewTransition, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Bookmark, CalendarDays, Clock, Heart, Play, Share2, Star, Ticket } from 'lucide-react';
import { Page } from '@/components/Page';
import { Poster } from '@/components/Poster';
import { MovieCard } from '@/components/MovieCard';
import { Rail } from '@/components/Rail';
import { Button, CertBadge, Dot, Modal, SectionHeader } from '@/components/ui';
import { useCatalog } from '@/context/CatalogContext';
import { compact, releaseLabel, runtime } from '@/lib/format';
import { useTicketX } from '@/context/TicketXContext';
import type { Format, Language, Movie, Review } from '@/lib/types';

const AVATAR_TONES = ['#3b2f2a', '#2a3340', '#33402f', '#40302f', '#2f2a40', '#3d3a26'];

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const { getMovie } = useCatalog();
  const movie = getMovie(id);
  if (!movie) return <NotFound />;
  return <MovieDetail movie={movie} />;
}

function NotFound() {
  return (
    <Page>
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <h1 className="text-2xl font-semibold">We couldn&apos;t find that film</h1>
        <p className="mt-2 text-muted">It may have left cinemas.</p>
        <Link href="/movies" className="mt-6 inline-block">
          <Button>Browse movies</Button>
        </Link>
      </div>
    </Page>
  );
}

function MovieDetail({ movie }: { movie: Movie }) {
  const router = useRouter();
  const { movies } = useCatalog();
  const { watchlist, toggleWatch, toast, playTrailer, user, requireSignIn } = useTicketX();
  const saved = watchlist.includes(movie.id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [interested, setInterested] = useState(false);

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem('tx.reviews') || '{}');
      setMyReviews(all[movie.id] ?? []);
      setInterested(JSON.parse(localStorage.getItem('tx.interested') || '[]').includes(movie.id));
    } catch {}
  }, [movie.id]);

  const similar = movies.filter((m) => m.id !== movie.id && m.genres.some((g) => movie.genres.includes(g))).slice(0, 8);
  const reviews = [...myReviews, ...movie.reviews];
  const nowShowing = movie.status === 'now_showing';

  const book = () => {
    if (movie.languages.length * movie.formats.length > 1) setPickerOpen(true);
    else router.push(`/movies/${movie.id}/shows`, { transitionTypes: ['nav-forward'] });
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: movie.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast('Link copied', 'success');
      }
    } catch {}
  };

  const toggleInterested = () => {
    const next = !interested;
    setInterested(next);
    try {
      const list: string[] = JSON.parse(localStorage.getItem('tx.interested') || '[]');
      localStorage.setItem('tx.interested', JSON.stringify(next ? [...list, movie.id] : list.filter((x) => x !== movie.id)));
    } catch {}
    toast(next ? `We'll notify you when ${movie.title} bookings open` : 'Notification turned off', next ? 'success' : 'info');
  };

  return (
    <Page>
      {/* Backdrop */}
      <div className="relative -mt-16 overflow-hidden">
        <div className="absolute inset-0 scale-110 opacity-70 blur-[2px]">
          <Poster movie={movie} variant="wide" bare className="!absolute inset-0 !aspect-auto h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/85 to-canvas/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/30 to-canvas/70" />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 md:pt-28">
          <Link href="/movies" transitionTypes={['nav-back']} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-cream">
            <ArrowLeft size={15} /> Movies
          </Link>
          <div className="flex flex-col gap-8 md:flex-row md:gap-12">
            <div className="w-[200px] shrink-0 sm:w-[240px] md:w-[280px]">
              <div className="overflow-hidden rounded-xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] ring-1 ring-line-strong">
                <ViewTransition name={`poster-${movie.id}`} share="morph" default="none">
                  <Poster movie={movie} priority />
                </ViewTransition>
              </div>
              <button
                onClick={() => playTrailer(movie.id)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-line-strong py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
              >
                <Play size={14} className="fill-cream" /> Watch trailer
              </button>
            </div>

            <div className="rise-in min-w-0 flex-1">
              <h1 className="font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">{movie.title}</h1>
              {movie.originalTitle && <p className="mt-2 text-lg text-muted">{movie.originalTitle}</p>}

              {nowShowing && movie.rating ? (
                <div className="mt-6 flex max-w-md items-center justify-between gap-4 rounded-xl border border-line bg-panel/80 p-4 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <Star size={26} className="fill-marquee text-marquee" />
                    <div>
                      <div className="text-xl font-semibold tabular-nums">{movie.rating.toFixed(1)}/10</div>
                      <div className="text-xs text-muted">
                        {movie.votes ? `${compact(movie.votes)} ratings` : `Critics' average · ${movie.critics?.length ?? 0} reviews`}
                      </div>
                    </div>
                  </div>
                  <Button tone="outline" size="sm" onClick={() => requireSignIn(() => setRateOpen(true)) && setRateOpen(true)}>
                    Rate now
                  </Button>
                </div>
              ) : (
                <div className="mt-6 flex max-w-md items-center justify-between gap-4 rounded-xl border border-line bg-panel/80 p-4 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <Heart size={24} className="fill-marquee text-marquee" />
                    <div>
                      <div className="text-lg font-semibold">{compact((movie.interested ?? 0) + (interested ? 1 : 0))} are interested</div>
                      <div className="text-xs text-muted">Releasing {releaseLabel(movie.releaseDate)}</div>
                    </div>
                  </div>
                  <Button tone={interested ? 'secondary' : 'outline'} size="sm" onClick={toggleInterested}>
                    {interested ? "I'm interested ✓" : "I'm interested"}
                  </Button>
                </div>
              )}

              {nowShowing && movie.critics && movie.critics.length > 0 && (
                <div className="mt-3 flex max-w-xl flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-muted">
                  {movie.critics.map((c) => (
                    <span key={c.outlet}>
                      {c.outlet} <span className="font-semibold tabular-nums text-cream/90">{c.score}/{c.base}</span>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {movie.formats.map((f) => (
                  <span key={f} className="rounded-md bg-cream/10 px-2.5 py-1 text-[12.5px] font-medium text-cream/90">
                    {f}
                  </span>
                ))}
                {movie.languages.map((l) => (
                  <span key={l} className="rounded-md border border-line px-2.5 py-1 text-[12.5px] text-muted">
                    {l}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-y-2 text-sm text-cream/80">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} className="text-faint" /> {runtime(movie.runtime)}
                </span>
                <Dot />
                {movie.genres.join(', ')}
                <Dot />
                <CertBadge cert={movie.certificate} />
                <Dot />
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-faint" /> {releaseLabel(movie.releaseDate)}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {nowShowing ? (
                  <Button size="lg" onClick={book} className="min-w-[200px]">
                    <Ticket size={17} /> Book tickets
                  </Button>
                ) : (
                  <Button size="lg" onClick={toggleInterested} className="min-w-[200px]">
                    <Bell size={17} /> {interested ? 'Notification on' : 'Notify me'}
                  </Button>
                )}
                <button
                  onClick={() => {
                    toggleWatch(movie.id);
                    toast(saved ? 'Removed from watchlist' : 'Saved to watchlist', saved ? 'info' : 'success');
                  }}
                  aria-pressed={saved}
                  className="flex h-12 items-center gap-2 rounded-lg border border-line-strong px-4 text-sm font-medium transition-colors hover:bg-white/5"
                >
                  <Bookmark size={16} className={saved ? 'fill-cream' : ''} /> {saved ? 'Saved' : 'Watchlist'}
                </button>
                <button onClick={share} className="grid h-12 w-12 place-items-center rounded-lg border border-line-strong transition-colors hover:bg-white/5" aria-label="Share">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-14 px-4 pt-6 sm:px-6">
        <section className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="text-xl font-semibold">About the film</h2>
            <p className="mt-3 max-w-3xl text-[15.5px] leading-[1.75] text-cream/80">{movie.synopsis}</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 self-start rounded-xl border border-line p-5 text-sm lg:grid-cols-1">
            {[
              ['Director', movie.director],
              ['Writers', movie.writers.join(', ')],
              ['Music', movie.music],
              ['Cinematography', movie.cinematography],
              ['Language', movie.languages.join(', ')],
              ['Certificate', movie.certificate],
            ]
              .filter(([, v]) => v && v !== '—')
              .map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-faint">{k}</dt>
                <dd className="mt-0.5 text-cream/90">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <SectionHeader title="Cast" />
          <div className="no-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
            {movie.cast.map((c, i) => (
              <div key={c.name} className="w-[104px] shrink-0 text-center">
                <div
                  className="relative mx-auto grid h-[92px] w-[92px] place-items-center overflow-hidden rounded-full font-display text-3xl text-cream/80 ring-1 ring-line"
                  style={{ background: AVATAR_TONES[i % AVATAR_TONES.length] }}
                >
                  {c.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photo} alt={c.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  )}
                  {c.name
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="mt-3 text-[13.5px] font-medium leading-tight">{c.name}</div>
                {c.role && <div className="mt-0.5 text-xs leading-tight text-faint">as {c.role}</div>}
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Reviews"
            sub={reviews.length ? `${reviews.length} reviews` : 'No reviews yet'}
            action={
              nowShowing && (
                <Button tone="outline" size="sm" onClick={() => requireSignIn(() => setRateOpen(true)) && setRateOpen(true)}>
                  Write a review
                </Button>
              )
            }
          />
          {reviews.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r, i) => (
                <motion.article
                  key={`${r.author}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-line bg-panel p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{r.author}</div>
                      <div className="text-xs text-faint">{r.outlet ?? 'Audience review'} · {releaseLabel(r.date)}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-md bg-cream/10 px-2 py-1 text-[13px] font-semibold tabular-nums">
                      <Star size={12} className="fill-marquee text-marquee" />
                      {r.score}/10
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-cream/75">{r.body}</p>
                </motion.article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-line py-10 text-center text-sm text-muted">
              {nowShowing ? 'No reviews yet. Seen it? Be the first to review.' : 'Reviews open once the film releases.'}
            </p>
          )}
        </section>

        {similar.length > 0 && (
          <section>
            <SectionHeader title="You might also like" />
            <Rail>
              {similar.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </Rail>
          </section>
        )}
      </div>

      <FormatPicker movie={movie} open={pickerOpen} onClose={() => setPickerOpen(false)} />
      <RateModal
        movie={movie}
        open={rateOpen}
        onClose={() => setRateOpen(false)}
        onSubmit={(score, body) => {
          const review: Review = { author: user?.name ?? 'You', score, body, date: new Date().toISOString().slice(0, 10) };
          const next = [review, ...myReviews];
          setMyReviews(next);
          try {
            const all = JSON.parse(localStorage.getItem('tx.reviews') || '{}');
            all[movie.id] = next;
            localStorage.setItem('tx.reviews', JSON.stringify(all));
          } catch {}
          setRateOpen(false);
          toast('Thanks — your review is live', 'success');
        }}
      />
    </Page>
  );
}

function FormatPicker({ movie, open, onClose }: { movie: Movie; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const go = (lang: Language, format: Format) => {
    onClose();
    router.push(`/movies/${movie.id}/shows?lang=${encodeURIComponent(lang)}&format=${encodeURIComponent(format)}`, { transitionTypes: ['nav-forward'] });
  };
  return (
    <Modal open={open} onClose={onClose} title={movie.title} labelledBy="fmt-title">
      <div className="max-h-[60vh] overflow-y-auto p-5">
        <p className="mb-4 text-sm text-muted">Select language and format</p>
        <div className="space-y-5">
          {movie.languages.map((l) => (
            <div key={l}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-faint">{l}</div>
              <div className="flex flex-wrap gap-2">
                {movie.formats.map((f) => (
                  <button
                    key={f}
                    onClick={() => go(l, f)}
                    className="rounded-lg border border-line-strong px-4 py-2 text-sm font-medium text-cream transition-colors hover:border-marquee hover:text-marquee"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => { onClose(); router.push(`/movies/${movie.id}/shows`, { transitionTypes: ['nav-forward'] }); }} className="mt-6 text-sm font-medium text-muted underline-offset-4 hover:text-cream hover:underline">
          Show all languages and formats
        </button>
      </div>
    </Modal>
  );
}

function RateModal({ movie, open, onClose, onSubmit }: { movie: Movie; open: boolean; onClose: () => void; onSubmit: (score: number, body: string) => void }) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState('');
  useEffect(() => {
    if (open) {
      setScore(0);
      setBody('');
    }
  }, [open]);
  const shown = hover || score;
  return (
    <Modal open={open} onClose={onClose} title={`Rate ${movie.title}`} labelledBy="rate-title">
      <div className="p-5">
        <p className="text-sm text-muted">How was the film?</p>
        <div className="mt-3 flex gap-1" onMouseLeave={() => setHover(0)}>
          {Array.from({ length: 10 }).map((_, i) => (
            <button key={i} onMouseEnter={() => setHover(i + 1)} onClick={() => setScore(i + 1)} aria-label={`${i + 1} out of 10`} className="p-0.5">
              <Star size={24} className={clsx('transition-colors', i < shown ? 'fill-marquee text-marquee' : 'text-line-strong')} />
            </button>
          ))}
        </div>
        <p className="mt-2 h-5 text-sm font-medium">{shown ? `${shown}/10 · ${['Awful', 'Awful', 'Poor', 'Poor', 'Average', 'Average', 'Good', 'Very good', 'Excellent', 'Masterpiece'][shown - 1]}` : ''}</p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={600}
          placeholder="What worked, what didn't? No spoilers, please."
          className="field mt-4 !h-auto resize-none py-3 leading-relaxed"
        />
        <div className="mt-1 text-right text-[11px] text-faint">{body.length}/600</div>
        <Button className="mt-4 w-full" size="lg" disabled={!score || body.trim().length < 10} onClick={() => onSubmit(score, body.trim())}>
          Submit review
        </Button>
      </div>
    </Modal>
  );
}
