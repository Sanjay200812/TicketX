'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, LogOut, Ticket } from 'lucide-react';
import { Page } from '@/components/Page';
import { Poster } from '@/components/Poster';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui';
import { useCatalog } from '@/context/CatalogContext';
import { showDateTime } from '@/lib/shows';
import { inr, longDate, time12 } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import { useTicketX } from '@/context/TicketXContext';
import type { Booking } from '@/lib/types';

const TABS = [
  { id: 'bookings', label: 'Bookings' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'profile', label: 'Profile' },
] as const;

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <Account />
    </Suspense>
  );
}

function Account() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, requireSignIn, hydrated, bookings, watchlist, signOut, toast } = useTicketX();
  const { getMovie } = useCatalog();
  const now = useNow();
  const tab = (params.get('tab') as (typeof TABS)[number]['id']) || 'bookings';
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  useEffect(() => {
    if (hydrated && !user && tab !== 'watchlist') requireSignIn();
  }, [hydrated, user, tab, requireSignIn]);

  const isUpcoming = (b: Booking) => now === null || showDateTime(b.date, b.time).getTime() + 3 * 3600000 > now;
  const lists = {
    upcoming: bookings.filter((b) => b.status === 'confirmed' && isUpcoming(b)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    past: bookings.filter((b) => b.status === 'confirmed' && !isUpcoming(b)),
    cancelled: bookings.filter((b) => b.status === 'cancelled'),
  };

  return (
    <Page>
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-panel-3 text-xl font-semibold ring-1 ring-line-strong">
            {user ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{user ? `Hi, ${user.name.split(' ')[0]}` : 'Your account'}</h1>
            <p className="text-sm text-muted">{user ? `+91 ${user.phone} · ${user.email}` : 'Sign in to see your bookings'}</p>
          </div>
        </div>

        <div className="mt-8 flex gap-1 border-b border-line">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => router.replace(t.id === 'bookings' ? '/account' : `/account?tab=${t.id}`, { scroll: false })}
              className={clsx('relative px-4 py-2.5 text-sm font-medium transition-colors', tab === t.id ? 'text-cream' : 'text-faint hover:text-muted')}
            >
              {t.label}
              {t.id === 'watchlist' && watchlist.length > 0 && <span className="ml-1.5 text-xs text-faint">{watchlist.length}</span>}
              {tab === t.id && <motion.span layoutId="acct-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-marquee" />}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="pt-6">
            {tab === 'bookings' &&
              (!user ? (
                <Empty title="Sign in to view your bookings" action={<Button onClick={() => requireSignIn()}>Sign in</Button>} />
              ) : (
                <>
                  <div className="mb-5 flex gap-2">
                    {(['upcoming', 'past', 'cancelled'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={clsx('rounded-full px-3.5 py-1.5 text-[13px] font-medium capitalize transition-colors', filter === f ? 'bg-cream text-canvas' : 'text-muted hover:text-cream')}
                      >
                        {f} <span className="opacity-60">{lists[f].length}</span>
                      </button>
                    ))}
                  </div>
                  {lists[filter].length === 0 ? (
                    <Empty
                      title={filter === 'upcoming' ? 'No upcoming shows' : filter === 'past' ? 'No past bookings' : 'No cancelled bookings'}
                      action={
                        filter === 'upcoming' && (
                          <Link href="/movies">
                            <Button>Find a movie</Button>
                          </Link>
                        )
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {lists[filter].map((b, i) => (
                        <BookingRow key={b.id} b={b} i={i} />
                      ))}
                    </div>
                  )}
                </>
              ))}

            {tab === 'watchlist' &&
              (watchlist.length === 0 ? (
                <Empty title="Your watchlist is empty" sub="Tap the bookmark on any film to save it here." action={<Link href="/movies"><Button>Browse movies</Button></Link>} />
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
                  {watchlist.map((id) => {
                    const m = getMovie(id);
                    return m ? <MovieCard key={id} movie={m} /> : null;
                  })}
                </div>
              ))}

            {tab === 'profile' &&
              (user ? (
                <div className="max-w-lg space-y-4">
                  <dl className="divide-y divide-line rounded-xl border border-line bg-panel">
                    {[
                      ['Name', user.name],
                      ['Mobile', `+91 ${user.phone}`],
                      ['Email', user.email],
                      ['Bookings', String(bookings.length)],
                      ['Total spent', inr(bookings.filter((b) => b.status === 'confirmed').reduce((a, b) => a + b.total, 0), 2)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between px-5 py-3.5 text-sm">
                        <dt className="text-muted">{k}</dt>
                        <dd className="font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <Button
                    tone="outline"
                    onClick={() => {
                      signOut();
                      toast('Signed out');
                      router.push('/');
                    }}
                  >
                    <LogOut size={15} /> Sign out
                  </Button>
                </div>
              ) : (
                <Empty title="You're not signed in" action={<Button onClick={() => requireSignIn()}>Sign in</Button>} />
              ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </Page>
  );
}

function BookingRow({ b, i }: { b: Booking; i: number }) {
  const { getMovie, cinemas } = useCatalog();
  const movie = getMovie(b.movieId) ?? b.movie;
  const cinema = b.cinema ?? cinemas.find((c) => c.id === b.cinemaId);
  if (!movie || !cinema) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
      <Link href={`/tickets/${b.id}`} transitionTypes={['nav-forward']} className="group flex items-center gap-4 rounded-xl border border-line bg-panel p-4 transition-colors hover:border-line-strong">
        <div className="w-14 shrink-0 overflow-hidden rounded-md">
          <Poster movie={movie} bare />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{movie.title}</h3>
            {b.status === 'cancelled' && <span className="rounded bg-low/15 px-1.5 py-0.5 text-[10.5px] font-semibold text-low">Cancelled</span>}
          </div>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {longDate(b.date)} · {time12(b.time)}
          </p>
          <p className="truncate text-xs text-faint">
            {cinema.name} · {b.seats.map((s) => s.id).join(', ')}
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <div className="font-mono text-xs text-faint">{b.id}</div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums">{inr(b.total, 2)}</div>
        </div>
        <ChevronRight size={18} className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
}

function Empty({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-6 py-16 text-center">
      <Ticket size={28} className="mx-auto text-faint" strokeWidth={1.5} />
      <p className="mt-3 font-medium">{title}</p>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
