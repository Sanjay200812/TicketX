'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Accessibility, Box, Car, Eye, LayoutGrid, Loader2, Minus, Plus, Users, UserRound } from 'lucide-react';
import { Page } from '@/components/Page';
import { BookingHeader } from '@/components/BookingChrome';
import { Button } from '@/components/ui';
import { BOOKING_HOLD_MS, getShow, parseShowId, seatLayout, showsForMovieAtCinema } from '@/lib/shows';
import { MAX_SEATS } from '@/lib/catalog';
import { inr, time12 } from '@/lib/format';
import { isPast, useNow } from '@/lib/hooks';
import { useTicketX } from '@/context/TicketXContext';
import { useCatalog } from '@/context/CatalogContext';
import type { Seat, SeatLayout } from '@/lib/types';

// WebGL only runs in the browser; the placeholder matches the canvas background so nothing flashes
const Auditorium3D = dynamic(() => import('@/components/Auditorium3D'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-[#0b0a0b] text-xs text-faint">
      <span className="animate-pulse">Building the auditorium…</span>
    </div>
  ),
});

export default function SeatPage() {
  const { showId } = useParams<{ showId: string }>();
  const { index, city } = useCatalog();
  const { setCity, switchingCity } = useTicketX();
  const data = getShow(index, showId);
  const wanted = parseShowId(showId);
  const otherCity = !data && wanted && wanted.city !== city.id;

  // A link to a show in another city: load that city's listings first
  useEffect(() => {
    if (otherCity && wanted) setCity(wanted.city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherCity]);

  if (!data) {
    if (otherCity || switchingCity)
      return (
        <div className="grid min-h-[60vh] place-items-center text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading showtimes…
          </span>
        </div>
      );
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <h1 className="text-2xl font-semibold">This show is no longer available</h1>
        <Link href="/movies" className="mt-4 inline-block text-marquee hover:underline">
          Find another show
        </Link>
      </div>
    );
  }
  return <SeatSelection key={showId} {...data} />;
}

/* Seat colours shared with the 3D view's legend */
const TIER_COLORS = ['#3b2a52', '#22324a', '#2a3d33', '#4a2a2a', '#36364e', '#2e3a46'];
const RECLINER_COLOR = '#6b4630';

function SeatSelection({ show, movie, cinema }: NonNullable<ReturnType<typeof getShow>>) {
  const router = useRouter();
  const { index } = useCatalog();
  const { bookings, draft, setDraft, toast, hydrated } = useTicketX();
  const now = useNow();
  const [qty, setQty] = useState<number | null>(null);
  const [qtyOpen, setQtyOpen] = useState(false);
  const [selected, setSelected] = useState<Seat[]>([]);
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [camView, setCamView] = useState<'overview' | 'seat'>('overview');

  const takenByUser = useMemo(
    () => bookings.filter((b) => b.showId === show.id && b.status === 'confirmed').flatMap((b) => b.seats.map((s) => s.id)),
    [bookings, show.id],
  );
  const layout = useMemo(
    () => seatLayout(show, { taken: takenByUser, wheelchair: cinema.amenities.includes('Wheelchair Access') }),
    [show, cinema, takenByUser],
  );
  const tierById = useMemo(() => Object.fromEntries(layout.tiers.map((t) => [t.id, t])), [layout]);
  const tierColor = useMemo(() => {
    let k = 0;
    return Object.fromEntries(layout.tiers.map((t) => [t.id, t.recliner ? RECLINER_COLOR : TIER_COLORS[k++ % TIER_COLORS.length]]));
  }, [layout]);
  const otherShows = showsForMovieAtCinema(index, movie, cinema, show.date).filter((s) => s.language === show.language);
  const free = layout.tiers.reduce((a, t) => a + t.avail, 0);

  // Restore a previous selection for this show (e.g. coming back from checkout)
  useEffect(() => {
    if (!hydrated) return;
    if (draft?.showId === show.id && draft.seats.length) {
      const seats = layout.rows.flatMap((r) => r.cells).filter((c): c is Seat => !!c && draft.seats.some((d) => d.id === c.id));
      setSelected(seats);
      setQty(seats.length);
    } else {
      setQtyOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const started = isPast(show.date, show.time, now);
  const total = selected.reduce((a, s) => a + tierById[s.tierId].price, 0);

  const pick = (seat: Seat) => {
    if (!qty) return setQtyOpen(true);
    if (selected.some((s) => s.id === seat.id)) {
      setSelected(selected.filter((s) => s.id !== seat.id));
      return;
    }
    // Like the cinema apps: a tap fills the remaining tickets with seats to the right in the same block
    let base = selected.length >= qty ? [] : selected;
    if (base.some((s) => s.tierId !== seat.tierId)) {
      toast('All seats in a booking need to be in the same class', 'info');
      base = [];
    }
    const need = qty - base.length;
    const row = layout.rows.find((r) => r.row === seat.row)!;
    const start = row.cells.findIndex((c) => c?.id === seat.id);
    const run: Seat[] = [];
    for (let i = start; i < row.cells.length && run.length < need; i++) {
      const c = row.cells[i];
      if (!c || c.status !== 'available' || base.some((b) => b.id === c.id)) break;
      run.push(c);
    }
    if (run.length === 0) run.push(seat);
    setSelected([...base, ...run]);
  };

  const proceed = () => {
    setDraft({
      showId: show.id,
      seats: selected.map((s) => ({ id: s.id, tierId: s.tierId, price: tierById[s.tierId].price, label: tierById[s.tierId].label })),
      holdUntil: Date.now() + BOOKING_HOLD_MS,
      promo: null,
    });
    toast(`${selected.length} seat${selected.length > 1 ? 's' : ''} held for 8 minutes`, 'success');
    router.push(`/book/${show.id}/checkout`, { transitionTypes: ['nav-forward'] });
  };

  return (
    <Page>
      <BookingHeader
        movie={movie}
        cinema={cinema}
        show={show}
        step={0}
        backHref={`/movies/${movie.id}/shows`}
        right={
          <button onClick={() => setQtyOpen(true)} className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line-strong px-3 text-sm font-medium hover:bg-white/5">
            {qty ?? '–'} {qty === 1 ? 'ticket' : 'tickets'}
          </button>
        }
      />

      {/* Other times */}
      <div className="border-b border-line">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {otherShows.map((s) => {
            const past = isPast(s.date, s.time, now);
            return (
              <Link
                key={s.id}
                href={past ? '#' : `/book/${s.id}`}
                replace
                aria-disabled={past}
                className={clsx(
                  'shrink-0 rounded-lg border px-3 py-1.5 text-center text-[13px] leading-tight transition-colors',
                  s.id === show.id ? 'border-cream bg-cream text-canvas' : past ? 'pointer-events-none border-line text-faint/60' : 'border-line-strong text-muted hover:text-cream',
                )}
              >
                <div className="font-semibold">{time12(s.time)}</div>
                <div className="text-[10.5px] uppercase opacity-70">{s.screen.length > 14 ? s.format : s.screen}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {started ? (
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h2 className="text-xl font-semibold">Bookings for this show have closed</h2>
          <p className="mt-2 text-sm text-muted">Pick a later showtime above.</p>
        </div>
      ) : (
        <div className="relative pb-40">
          {/* View switch + screen facts */}
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-5 sm:px-6">
            <div className="inline-flex rounded-lg border border-line bg-panel/60 p-1" role="tablist" aria-label="Seat view">
              {(
                [
                  ['2d', 'Seat layout', LayoutGrid],
                  ['3d', '3D view', Box],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={mode === id}
                  onClick={() => {
                    setMode(id);
                    setCamView('overview');
                  }}
                  className={clsx('relative flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors', mode === id ? 'text-canvas' : 'text-muted hover:text-cream')}
                >
                  {mode === id && <motion.span layoutId="seat-mode" className="absolute inset-0 rounded-md bg-cream" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                  <Icon size={14} className="relative" />
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="rounded-md border border-line px-2 py-1">{show.screen}</span>
              <span className="rounded-md border border-line px-2 py-1">{show.format}</span>
              {show.tag && <span className="rounded-md border border-line px-2 py-1">{show.tag}</span>}
              <span className="rounded-md border border-line px-2 py-1">
                {free} of {layout.tiers.reduce((a, t) => a + t.total, 0)} seats free
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {mode === '2d' ? (
              <motion.div key="2d" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <SeatMap layout={layout} selected={selected} onPick={pick} />
              </motion.div>
            ) : (
              <motion.div key="3d" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
                <div className="relative h-[62vh] min-h-[400px] overflow-hidden rounded-2xl border border-line">
                  <Auditorium3D
                    layout={layout}
                    tierColor={tierColor}
                    selected={selected.map((x) => x.id)}
                    onPick={(seat) => {
                      setCamView('overview');
                      pick(seat);
                    }}
                    title={movie.title}
                    backdropUrl={movie.backdropUrl}
                    view={camView}
                    focusSeat={selected[selected.length - 1]?.id}
                  />
                  <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
                    <span className="rounded-md bg-black/55 px-2.5 py-1.5 text-[11.5px] text-cream/80 backdrop-blur">
                      {camView === 'seat' ? `Your view from ${selected[selected.length - 1]?.id}` : 'Drag to look around · scroll or pinch to zoom · tap a seat'}
                    </span>
                    <div className="pointer-events-auto flex gap-2">
                      {camView === 'seat' ? (
                        <button onClick={() => setCamView('overview')} className="flex items-center gap-1.5 rounded-md bg-black/60 px-3 py-1.5 text-xs font-medium text-cream backdrop-blur hover:bg-black/80">
                          <Box size={13} /> Overview
                        </button>
                      ) : (
                        <button
                          disabled={selected.length === 0}
                          onClick={() => setCamView('seat')}
                          className="flex items-center gap-1.5 rounded-md bg-marquee px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:bg-marquee-deep disabled:opacity-40"
                          title={selected.length ? 'See the screen from your seat' : 'Pick a seat first'}
                        >
                          <Eye size={13} /> View from seat
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-x-4 gap-y-1 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-10 text-[11.5px] text-cream/80">
                    {layout.tiers.map((t) => (
                      <span key={t.id} className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: tierColor[t.id] }} /> {t.label} {inr(t.price)}
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-ok" /> Selected
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#34343a] ring-1 ring-white/20" /> Sold
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom bar */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 40 }}
          >
            <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {[...selected]
                    .sort((a, b) => a.row.localeCompare(b.row) || a.number - b.number)
                    .map((s) => s.id)
                    .join(', ')}
                </div>
                <div className="text-xs text-muted">
                  {selected.length} of {qty} selected · {Array.from(new Set(selected.map((s) => tierById[s.tierId].label))).join(', ')}
                </div>
              </div>
              <Button size="lg" disabled={selected.length !== qty} onClick={proceed} className="min-w-[180px]">
                {selected.length !== qty ? `Select ${qty! - selected.length} more` : `Pay ${inr(total)}`}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuantitySheet
        open={qtyOpen}
        initial={qty ?? 2}
        max={Math.min(MAX_SEATS, Math.max(1, free))}
        prices={layout.tiers.map((t) => ({ label: t.label, price: t.price, soldOut: t.avail === 0 }))}
        onClose={() => {
          setQtyOpen(false);
          if (!qty) setQty(Math.min(2, Math.max(1, free)));
        }}
        onConfirm={(n) => {
          setQty(n);
          if (selected.length > n) setSelected(selected.slice(0, n));
          setQtyOpen(false);
        }}
      />
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/*  2D seat map: dearer classes at the top, screen at the bottom       */
/* ------------------------------------------------------------------ */

function SeatMap({ layout, selected, onPick }: { layout: SeatLayout; selected: Seat[]; onPick: (s: Seat) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const sel = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);
  const widest = Math.max(...layout.rows.map((r) => r.cells.length));
  // Fit the plan to the viewport on first render (measured at full size); wide single screens start zoomed out
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = wrap.current;
    const plan = inner.current;
    if (!el || !plan) return;
    const natural = plan.scrollWidth;
    setZoom(Math.max(0.45, Math.min(1, (el.clientWidth - 32) / natural)));
  }, [widest]);
  // Keep the plan centred on the screen when it is wider than the viewport
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const centre = () => (el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2);
    centre();
    const raf = requestAnimationFrame(centre);
    return () => cancelAnimationFrame(raf);
  }, [zoom]);

  return (
    <div className="mx-auto mt-5 max-w-7xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-[radial-gradient(120%_70%_at_50%_100%,rgba(120,140,255,0.08),transparent_60%)]">
        <div ref={wrap} className="no-scrollbar overflow-x-auto px-4 pb-8 pt-6">
          <div ref={inner} className="mx-auto w-max" style={{ zoom }}>
            {layout.tiers.map((tier) => (
              <section key={tier.id} className="mb-5">
                <div className="mb-3 flex items-center gap-3 border-b border-line pb-2 text-[12px] font-medium text-muted">
                  <span className="text-cream">{inr(tier.price)}</span>
                  <span className="uppercase tracking-[0.14em]">{tier.label}</span>
                  <span className="ml-auto text-[11px] text-faint">{tier.avail === 0 ? 'Sold out' : `${tier.avail} left`}</span>
                </div>
                <div className="space-y-[7px]">
                  {layout.rows
                    .filter((r) => r.tierId === tier.id)
                    .map((r) => (
                      <div key={r.row} className="flex items-center gap-3">
                        <span className="w-6 text-right text-[11px] font-medium text-faint">{r.row}</span>
                        <div className="flex flex-1 justify-center gap-[6px]">
                          {r.cells.map((c, i) =>
                            c ? (
                              <SeatButton key={c.id} seat={c} wide={tier.recliner} selected={sel.has(c.id)} onPick={onPick} price={tier.price} tier={tier.label} />
                            ) : (
                              <span key={`gap-${i}`} className="w-6 shrink-0" />
                            ),
                          )}
                        </div>
                        <span className="w-6 text-[11px] font-medium text-faint">{r.row}</span>
                      </div>
                    ))}
                </div>
              </section>
            ))}

            {/* The screen, at the bottom like the cinema apps */}
            <div className="mx-auto mt-10 w-[78%] min-w-[280px]">
              <svg viewBox="0 0 400 34" className="w-full overflow-visible" aria-hidden>
                <defs>
                  <linearGradient id="scr" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#9fb4ff" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#9fb4ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M4 26 Q200 0 396 26 L396 34 Q200 10 4 34 Z" fill="url(#scr)" />
                <path d="M4 26 Q200 0 396 26" fill="none" stroke="#cdd8ff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <p className="mt-1 text-center text-[11px] font-medium uppercase tracking-[0.3em] text-faint">All eyes this way please</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-3 right-3 flex overflow-hidden rounded-lg border border-line-strong bg-panel/90 backdrop-blur">
          <button onClick={() => setZoom((z) => Math.max(0.45, +(z - 0.15).toFixed(2)))} aria-label="Zoom out" className="grid h-8 w-9 place-items-center hover:bg-white/5">
            <Minus size={15} />
          </button>
          <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.15).toFixed(2)))} aria-label="Zoom in" className="grid h-8 w-9 place-items-center border-l border-line hover:bg-white/5">
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
        <Legend className="border border-ok/80 bg-transparent" label="Available" />
        <Legend className="bg-ok" label="Selected" />
        <Legend className="bg-panel-3" label="Sold" />
        <span className="inline-flex items-center gap-1.5">
          <Accessibility size={13} className="text-faint" /> Wheelchair space
        </span>
      </div>
    </div>
  );
}

function SeatButton({ seat, selected, onPick, wide, price, tier }: { seat: Seat; selected: boolean; onPick: (s: Seat) => void; wide: boolean; price: number; tier: string }) {
  const sold = seat.status !== 'available';
  return (
    <motion.button
      type="button"
      disabled={sold}
      onClick={() => onPick(seat)}
      whileTap={sold ? undefined : { scale: 0.85 }}
      animate={selected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ duration: 0.22 }}
      title={sold ? `${seat.id} · Sold` : `${seat.id} · ${tier} · ${inr(price)}`}
      aria-label={`Seat ${seat.id}, ${tier}, ${sold ? 'unavailable' : selected ? 'selected' : 'available'}`}
      aria-pressed={selected}
      className={clsx(
        'grid h-6 shrink-0 place-items-center text-[10px] font-semibold tabular-nums transition-colors duration-150',
        wide ? 'w-10 rounded-t-lg rounded-b-[4px]' : 'w-6 rounded-[5px]',
        selected
          ? 'bg-ok text-canvas shadow-[0_0_0_3px_rgba(87,181,111,0.25)]'
          : sold
            ? 'cursor-not-allowed bg-panel-3 text-transparent'
            : 'border border-ok/70 text-ok hover:bg-ok hover:text-canvas',
      )}
    >
      {seat.wheelchair && !sold && !selected ? <Accessibility size={12} /> : sold ? '' : seat.number}
    </motion.button>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={clsx('h-3.5 w-3.5 rounded-[4px]', className)} />
      {label}
    </span>
  );
}

const QTY_ICON = [UserRound, Users, Users, Users, Car, Car, Car, Car, Car, Car];
const QTY_HINT = ['Going solo', 'Date night', 'The gang', 'Squad', 'Family outing', 'Family outing', 'Big group', 'Big group', 'Big group', 'Whole crew'];

function QuantitySheet({
  open,
  initial,
  max,
  prices,
  onClose,
  onConfirm,
}: {
  open: boolean;
  initial: number;
  max: number;
  prices: { label: string; price: number; soldOut: boolean }[];
  onClose: () => void;
  onConfirm: (n: number) => void;
}) {
  const [n, setN] = useState(initial);
  useEffect(() => {
    if (open) setN(Math.min(initial, max));
  }, [open, initial, max]);
  const Icon = QTY_ICON[n - 1];
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label="How many seats"
            className="relative w-full max-w-md rounded-t-2xl border border-line bg-panel p-6 sm:rounded-2xl"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            <h2 className="text-center text-lg font-semibold">How many seats?</h2>
            <div className="mt-6 flex h-20 flex-col items-center justify-center">
              <AnimatePresence mode="popLayout">
                <motion.div key={n} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.18 }} className="flex flex-col items-center">
                  <Icon size={40} strokeWidth={1.4} className="text-marquee" />
                  <span className="mt-2 text-xs text-muted">{QTY_HINT[n - 1]}</span>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-5 flex justify-center">
              <div className="grid grid-cols-5 gap-2 sm:flex sm:gap-1.5">
                {Array.from({ length: MAX_SEATS }).map((_, i) => (
                  <button
                    key={i}
                    disabled={i + 1 > max}
                    onClick={() => setN(i + 1)}
                    className={clsx(
                      'h-9 w-9 rounded-full text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:text-faint/40',
                      n === i + 1 ? 'bg-marquee text-white' : 'text-muted hover:bg-white/5 hover:text-cream',
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-center text-[11.5px] text-faint">Up to {MAX_SEATS} tickets per booking</p>
            <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3 border-t border-line pt-5">
              {prices.map((p) => (
                <div key={p.label} className="text-center">
                  <div className="text-[11px] uppercase tracking-wider text-faint">{p.label}</div>
                  <div className={clsx('mt-0.5 text-sm font-semibold', p.soldOut && 'text-faint line-through')}>{inr(p.price)}</div>
                  {p.soldOut && <div className="text-[10.5px] text-low">Sold out</div>}
                </div>
              ))}
            </div>
            <Button size="lg" className="mt-6 w-full" onClick={() => onConfirm(n)}>
              Select seats
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
