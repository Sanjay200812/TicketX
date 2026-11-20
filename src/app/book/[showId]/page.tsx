'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Accessibility, Box, Car, Eye, Grid3x3, Users, UserRound, ZoomIn, ZoomOut } from 'lucide-react';
import { Page } from '@/components/Page';
import { BookingHeader } from '@/components/BookingChrome';
import { Button } from '@/components/ui';
import { BOOKING_HOLD_MS, getShow, screenOf, seatLayout, showsForMovieAtCinema } from '@/lib/shows';
import { inr, time12 } from '@/lib/format';
import { isPast, useNow } from '@/lib/hooks';
import { useTicketX } from '@/context/TicketXContext';
import { useCatalog } from '@/context/CatalogContext';
import type { Seat } from '@/lib/types';

const MAX = 10;

// WebGL only runs in the browser; the placeholder matches the canvas background so nothing flashes
const Auditorium3D = dynamic(() => import('@/components/Auditorium3D'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-[#0b0a0b] text-xs text-faint">
      <span className="animate-pulse">Building the auditorium…</span>
    </div>
  ),
});

const TIER_SWATCH: Record<string, string> = {
  recliner: '#6b4630',
  luxe: '#5a3b2a',
  prime: '#3b2a52',
  classic: '#22324a',
  balcony: '#3b2a52',
  first: '#22324a',
  second: '#2a3a2e',
};

export default function SeatPage() {
  const { showId } = useParams<{ showId: string }>();
  const { movies } = useCatalog();
  const data = getShow(showId, movies);
  if (!data) {
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

function SeatSelection({ show, movie, cinema }: NonNullable<ReturnType<typeof getShow>>) {
  const router = useRouter();
  const { bookings, draft, setDraft, toast, hydrated } = useTicketX();
  const now = useNow();
  const [qty, setQty] = useState<number | null>(null);
  const [qtyOpen, setQtyOpen] = useState(false);
  const [selected, setSelected] = useState<Seat[]>([]);
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState<'3d' | 'map'>('3d');
  const [camView, setCamView] = useState<'overview' | 'seat'>('overview');
  const mapRef = useRef<HTMLDivElement>(null);

  // On narrow screens the map is wider than the viewport: start it centred on the screen
  useEffect(() => {
    const el = mapRef.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, [zoom, qty]);

  const takenByUser = useMemo(
    () => bookings.filter((b) => b.showId === show.id && b.status === 'confirmed').flatMap((b) => b.seats.map((s) => s.id)),
    [bookings, show.id],
  );
  const layout = useMemo(() => seatLayout(show, cinema, takenByUser), [show, cinema, takenByUser]);
  const tierById = Object.fromEntries(layout.tiers.map((t) => [t.id, t]));
  const otherShows = showsForMovieAtCinema(movie, cinema, show.date).filter((s) => s.language === show.language);

  // Restore a previous selection for this show (e.g. coming back from snacks)
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
    const base = selected.length >= qty ? [] : selected;
    const need = qty - base.length;
    // auto-select contiguous seats to the right within the same block
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
      seats: selected.map((s) => ({ id: s.id, tierId: s.tierId, price: tierById[s.tierId].price })),
      snacks: draft?.showId === show.id ? draft.snacks : {},
      holdUntil: Date.now() + BOOKING_HOLD_MS,
      promo: null,
    });
    toast(`${selected.length} seat${selected.length > 1 ? 's' : ''} held for 8 minutes`, 'success');
    const next = cinema.amenities.includes('Food & Beverages') ? 'snacks' : 'checkout';
    router.push(`/book/${show.id}/${next}`, { transitionTypes: ['nav-forward'] });
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
                <div className="text-[10.5px] uppercase opacity-70">{s.format}</div>
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
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-5 sm:px-6">
            <div className="inline-flex rounded-lg border border-line p-1" role="tablist" aria-label="Seat view">
              {(
                [
                  ['3d', '3D theatre', Box],
                  ['map', 'Seat map', Grid3x3],
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
                  className={clsx('relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors', mode === id ? 'text-canvas' : 'text-muted hover:text-cream')}
                >
                  {mode === id && <motion.span layoutId="seat-mode" className="absolute inset-0 rounded-md bg-cream" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                  <Icon size={14} className="relative" />
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              {layout.tiers.map((t) => (
                <span key={t.id} className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-[3px]" style={{ background: mode === '3d' ? TIER_SWATCH[t.id] : undefined, border: mode === '3d' ? undefined : '1px solid rgb(87 181 111 / 0.7)' }} />
                  {t.label} {inr(t.price)}
                </span>
              ))}
            </div>
          </div>

          {mode === '3d' ? (
            <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
              <div className="relative h-[58vh] min-h-[380px] overflow-hidden rounded-2xl border border-line">
                <Auditorium3D
                  layout={layout}
                  selected={selected.map((x) => x.id)}
                  onPick={(seat) => {
                    setCamView('overview');
                    pick(seat);
                  }}
                  title={movie.title}
                  backdropUrl={movie.backdropUrl}
                  large={screenOf(cinema, show.screen).kind === 'large'}
                  view={camView}
                  focusSeat={selected[selected.length - 1]?.id}
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
                  <span className="rounded-md bg-black/55 px-2.5 py-1.5 text-[11.5px] text-cream/80 backdrop-blur">
                    {camView === 'seat' ? `Your view from ${selected[selected.length - 1]?.id}` : 'Drag to look around · scroll to zoom · tap a seat'}
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
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-4 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-[11.5px] text-cream/80">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#ff5a3c]" /> Your pick</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#1c1c1f] ring-1 ring-white/20" /> Sold</span>
                </div>
              </div>
            </div>
          ) : (
          <div ref={mapRef} className="no-scrollbar overflow-x-auto px-4 pt-8 sm:px-6">
            <motion.div
              className="mx-auto w-max origin-top"
              animate={{ scale: zoom }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ marginBottom: `${(zoom - 1) * 600}px` }}
            >
              {layout.tiers.map((tier) => (
                <div key={tier.id} className="mb-6">
                  <div className="mb-3 border-b border-line pb-2 text-center text-xs font-medium uppercase tracking-[0.16em] text-muted">
                    {inr(tier.price)} <span className="text-faint">·</span> {tier.label}
                  </div>
                  <div className="space-y-2">
                    {layout.rows
                      .filter((r) => r.tierId === tier.id)
                      .map((r) => (
                        <div key={r.row} className="flex items-center gap-3">
                          <span className="w-4 text-right text-[11px] font-medium text-faint">{r.row}</span>
                          <div className="flex gap-[5px]">
                            {r.cells.map((c, i) =>
                              c ? (
                                <SeatButton key={c.id} seat={c} recliner={tier.id === 'recliner'} selected={selected.some((s) => s.id === c.id)} onPick={pick} price={tier.price} tier={tier.label} />
                              ) : (
                                <span key={`gap-${i}`} className="w-5 sm:w-7" />
                              ),
                            )}
                          </div>
                          <span className="w-4 text-[11px] font-medium text-faint">{r.row}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
              <div className="mx-auto mt-10 w-[86%]">
                <div className="screen-curve" />
                <p className="mt-2 text-center text-[11px] uppercase tracking-[0.3em] text-faint">All eyes this way please</p>
              </div>
            </motion.div>
          </div>

          )}

          {mode === 'map' && (
          <div className="mx-auto mt-8 flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-xs text-muted">
            <Legend className="border border-ok/70" label="Available" />
            <Legend className="bg-marquee" label="Selected" />
            <Legend className="bg-panel-3" label="Sold" />
            <span className="inline-flex items-center gap-1.5">
              <Accessibility size={13} className="text-faint" /> Wheelchair space
            </span>
            <span className="inline-flex overflow-hidden rounded-lg border border-line-strong">
              <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))} aria-label="Zoom out" className="grid h-8 w-9 place-items-center hover:bg-white/5">
                <ZoomOut size={15} />
              </button>
              <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.2).toFixed(1)))} aria-label="Zoom in" className="grid h-8 w-9 place-items-center border-l border-line hover:bg-white/5">
                <ZoomIn size={15} />
              </button>
            </span>
          </div>
          )}
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
                {selected.length !== qty ? `Select ${qty! - selected.length} more` : `Proceed · ${inr(total)}`}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuantitySheet
        open={qtyOpen}
        initial={qty ?? 2}
        prices={layout.tiers.map((t) => ({ label: t.label, price: t.price }))}
        onClose={() => {
          setQtyOpen(false);
          if (!qty) setQty(2);
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

function SeatButton({ seat, selected, onPick, recliner, price, tier }: { seat: Seat; selected: boolean; onPick: (s: Seat) => void; recliner: boolean; price: number; tier: string }) {
  const sold = seat.status !== 'available';
  return (
    <motion.button
      type="button"
      disabled={sold}
      onClick={() => onPick(seat)}
      whileTap={sold ? undefined : { scale: 0.85 }}
      animate={selected ? { scale: [1, 1.18, 1] } : { scale: 1 }}
      transition={{ duration: 0.25 }}
      title={sold ? `${seat.id} · Sold` : `${seat.id} · ${tier} · ${inr(price)}`}
      aria-label={`Seat ${seat.id}, ${tier}, ${sold ? 'unavailable' : selected ? 'selected' : 'available'}`}
      aria-pressed={selected}
      className={clsx(
        'grid h-5 place-items-center text-[9px] font-semibold transition-colors duration-150 sm:h-7 sm:text-[10.5px]',
        recliner ? 'w-8 rounded-t-lg rounded-b-sm sm:w-10' : 'w-5 rounded-[4px] sm:w-7 sm:rounded-md',
        selected
          ? 'bg-marquee text-white'
          : sold
            ? 'bg-panel-3 text-transparent'
            : 'border border-ok/60 text-ok/90 hover:bg-ok hover:text-canvas',
      )}
    >
      {seat.wheelchair && !sold ? <Accessibility size={12} /> : sold ? '' : seat.number}
    </motion.button>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={clsx('h-3.5 w-3.5 rounded-[3px]', className)} />
      {label}
    </span>
  );
}

const QTY_ICON = [UserRound, Users, Users, Users, Car, Car, Car, Car, Car, Car];
const QTY_HINT = ['Going solo', 'Date night', 'The gang', 'Squad', 'Family outing', 'Family outing', 'Big group', 'Big group', 'Big group', 'Whole crew'];

function QuantitySheet({
  open,
  initial,
  prices,
  onClose,
  onConfirm,
}: {
  open: boolean;
  initial: number;
  prices: { label: string; price: number }[];
  onClose: () => void;
  onConfirm: (n: number) => void;
}) {
  const [n, setN] = useState(initial);
  useEffect(() => {
    if (open) setN(initial);
  }, [open, initial]);
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
                {Array.from({ length: MAX }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setN(i + 1)}
                    className={clsx(
                      'h-9 w-9 rounded-full text-sm font-semibold transition-colors',
                      n === i + 1 ? 'bg-marquee text-white' : 'text-muted hover:bg-white/5 hover:text-cream',
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-6 border-t border-line pt-5">
              {prices.map((p) => (
                <div key={p.label} className="text-center">
                  <div className="text-[11px] uppercase tracking-wider text-faint">{p.label}</div>
                  <div className="mt-0.5 text-sm font-semibold">{inr(p.price)}</div>
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
