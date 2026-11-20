'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { ArrowLeft, CalendarPlus, CheckCircle2, Navigation, QrCode, Share2, XCircle } from 'lucide-react';
import { Page } from '@/components/Page';
import { Poster } from '@/components/Poster';
import { Button, Modal } from '@/components/ui';
import { useCatalog } from '@/context/CatalogContext';
import { getCinema, getSnack } from '@/lib/catalog';
import { showDateTime } from '@/lib/shows';
import { inr, longDate, runtime, time12 } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import { useTicketX } from '@/context/TicketXContext';
import type { Booking } from '@/lib/types';

export default function TicketPage() {
  return (
    <Suspense fallback={null}>
      <Ticket />
    </Suspense>
  );
}

function Ticket() {
  const { id } = useParams<{ id: string }>();
  const fresh = useSearchParams().get('new') === '1';
  const { bookings, hydrated } = useTicketX();
  const booking = bookings.find((b) => b.id === id);

  if (!hydrated) return <div className="min-h-screen" />;
  if (!booking)
    return (
      <Page>
        <div className="mx-auto max-w-md px-4 py-32 text-center">
          <h1 className="text-2xl font-semibold">Booking not found</h1>
          <p className="mt-2 text-sm text-muted">Bookings are stored on this device. Sign in on the device you booked from.</p>
          <Link href="/account" className="mt-6 inline-block">
            <Button>Your bookings</Button>
          </Link>
        </div>
      </Page>
    );
  return <TicketView booking={booking} fresh={fresh} />;
}

function TicketView({ booking, fresh }: { booking: Booking; fresh: boolean }) {
  const { getMovie } = useCatalog();
  // A film can leave the live catalogue after booking, so the booking keeps its own copy
  const movie = (getMovie(booking.movieId) ?? booking.movie)!;
  const cinema = getCinema(booking.cinemaId)!;
  const { cancelBooking, toast, draft, setDraft } = useTicketX();
  const now = useNow();

  // The seat hold for this show is now a confirmed booking
  useEffect(() => {
    if (draft?.showId === booking.showId) setDraft(null);
  }, [draft, booking.showId, setDraft]);
  const [qr, setQr] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    QRCode.toString(`TICKETX:${booking.id}:${booking.showId}:${booking.seats.map((s) => s.id).join(',')}`, {
      type: 'svg',
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#0b0a09', light: '#00000000' },
    }).then(setQr);
  }, [booking]);

  const start = showDateTime(booking.date, booking.time).getTime();
  const cancelled = booking.status === 'cancelled';
  const over = now !== null && now > start + movie.runtime * 60000;
  const canCancel = !cancelled && cinema.cancellable && now !== null && start - now > 2 * 3600 * 1000;
  const refund = booking.ticketTotal + booking.snackTotal - booking.discount;
  const pickup = booking.id.slice(-4);

  const addToCalendar = () => {
    const fmt = (t: number) => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TicketX//EN',
      'BEGIN:VEVENT',
      `UID:${booking.id}@ticketx`,
      `DTSTAMP:${fmt(Date.now())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(start + movie.runtime * 60000 + 20 * 60000)}`,
      `SUMMARY:${movie.title} (${booking.format})`,
      `LOCATION:${cinema.name}\\, ${cinema.address.replace(/,/g, '\\,')}`,
      `DESCRIPTION:Booking ${booking.id} · Seats ${booking.seats.map((s) => s.id).join(' ')} · ${booking.screen}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Movie in 1 hour',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${movie.id}-${booking.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const text = `${movie.title} · ${longDate(booking.date)}, ${time12(booking.time)} · ${cinema.name} · Seats ${booking.seats.map((s) => s.id).join(', ')}`;
    try {
      if (navigator.share) await navigator.share({ title: 'My movie plan', text });
      else {
        await navigator.clipboard.writeText(text);
        toast('Show details copied', 'success');
      }
    } catch {}
  };

  return (
    <Page>
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <Link href="/account" transitionTypes={['nav-back']} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-cream">
          <ArrowLeft size={15} /> Your bookings
        </Link>

        {fresh && !cancelled && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-3">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.15 }}>
              <CheckCircle2 size={30} className="text-ok" />
            </motion.span>
            <div>
              <h1 className="text-xl font-semibold">You&apos;re all set</h1>
              <p className="text-sm text-muted">
                Ticket sent to {booking.contact.email} and +91 {booking.contact.phone}
              </p>
            </div>
          </motion.div>
        )}
        {cancelled && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-low/30 bg-low/[0.06] p-4">
            <XCircle size={22} className="shrink-0 text-low" />
            <div className="text-sm">
              <div className="font-semibold">Booking cancelled</div>
              <div className="text-muted">{inr(booking.refund ?? 0, 2)} will be refunded to your original payment method in 5–7 working days.</div>
            </div>
          </div>
        )}

        {/* Ticket */}
        <motion.div
          initial={fresh ? { opacity: 0, y: -40, rotateX: 18 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20, delay: fresh ? 0.25 : 0 }}
          style={{ perspective: 1600 }}
          className="mt-6"
        >
        {/* 3D flip: details on the front, a full-size entry QR on the back */}
        <motion.div
          className="grid"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 16 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
        <article
          aria-hidden={flipped}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className={clsx('col-start-1 row-start-1 overflow-hidden rounded-2xl bg-cream text-canvas shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]', cancelled && 'opacity-60 grayscale')}
        >
          <div className="flex gap-5 p-5 sm:p-7">
            <div className="w-24 shrink-0 overflow-hidden rounded-lg sm:w-28">
              <Poster movie={movie} bare />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-canvas/50">
                {booking.language} · {booking.format} · {movie.certificate}
              </div>
              <h2 className="mt-1 font-display text-3xl leading-none sm:text-4xl">{movie.title}</h2>
              <p className="mt-3 text-sm font-medium">{cinema.name}</p>
              <p className="text-xs text-canvas/60">{cinema.address}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-canvas/10 sm:grid-cols-4">
            {[
              ['Date', longDate(booking.date)],
              ['Show time', time12(booking.time)],
              ['Screen', booking.screen],
              ['Runtime', runtime(movie.runtime)],
            ].map(([k, v]) => (
              <div key={k} className="bg-cream px-5 py-3 sm:px-7">
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-canvas/50">{k}</div>
                <div className="mt-0.5 text-sm font-semibold">{v}</div>
              </div>
            ))}
          </div>

          {/* perforation */}
          <div className="relative flex items-center">
            <span className="absolute -left-3 h-6 w-6 rounded-full bg-canvas" />
            <span className="mx-5 h-px flex-1 border-t-2 border-dashed border-canvas/20" />
            <span className="absolute -right-3 h-6 w-6 rounded-full bg-canvas" />
          </div>

          <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:p-7">
            <div className="grid h-36 w-36 shrink-0 place-items-center rounded-lg bg-white p-3">
              {qr ? <div className="h-full w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} /> : <div className="skeleton h-full w-full" />}
            </div>
            <div className="w-full flex-1 space-y-3">
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-canvas/50">Seats ({booking.seats.length})</div>
                <div className="mt-0.5 text-2xl font-semibold tracking-tight">{booking.seats.map((s) => s.id).join(', ')}</div>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <div>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-canvas/50">Booking ID</div>
                  <div className="font-mono text-sm font-semibold tracking-wider">{booking.id}</div>
                </div>
                {booking.snacks.length > 0 && (
                  <div>
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-canvas/50">F&B pickup code</div>
                    <div className="font-mono text-sm font-semibold tracking-wider">{pickup}</div>
                  </div>
                )}
              </div>
              <p className="text-xs text-canvas/60">Show this QR at the entrance. Please arrive 20 minutes early; entry closes 15 minutes after start.</p>
            </div>
          </div>
        </article>

        <div
          aria-hidden={!flipped}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="col-start-1 row-start-1 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-6 text-canvas shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-canvas/50">Entry pass · {cinema.chain}</div>
          <div className="aspect-square w-full max-w-[280px]">
            {qr ? <div className="h-full w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} /> : <div className="skeleton h-full w-full" />}
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold tracking-tight">{booking.seats.map((s) => s.id).join(', ')}</div>
            <div className="mt-1 font-mono text-sm font-semibold tracking-wider">{booking.id}</div>
            <div className="mt-1 text-xs text-canvas/60">
              {time12(booking.time)} · {booking.screen} · Turn your screen brightness up at the gate
            </div>
          </div>
        </div>
        </motion.div>
        </motion.div>

        {!cancelled && !over && (
          <button
            onClick={() => setFlipped((f) => !f)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-line-strong bg-panel py-3 text-sm font-semibold transition-colors hover:bg-panel-2"
          >
            <QrCode size={16} /> {flipped ? 'Show ticket details' : 'Show entry QR'}
          </button>
        )}

        {/* Actions */}
        {!cancelled && !over && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            <ActionButton icon={<CalendarPlus size={17} />} label="Add to calendar" onClick={addToCalendar} />
            <ActionButton icon={<Navigation size={17} />} label="Directions" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cinema.address)}`} />
            <ActionButton icon={<Share2 size={17} />} label="Share" onClick={share} />
          </div>
        )}

        {/* Payment details */}
        <section className="mt-8 rounded-xl border border-line bg-panel">
          <h3 className="border-b border-line px-5 py-4 text-sm font-semibold">Payment summary</h3>
          <div className="space-y-2.5 px-5 py-4 text-sm">
            <Row k={`Tickets (${booking.seats.length})`} v={inr(booking.ticketTotal)} />
            {booking.snacks.map((s) => (
              <Row key={s.id} k={`${s.qty} × ${getSnack(s.id)?.name ?? s.id}`} v={inr(s.price * s.qty)} />
            ))}
            <Row k="Convenience fee (incl. GST)" v={inr(booking.convenienceFee + booking.gstOnFee, 2)} />
            {booking.discount > 0 && <Row k={`Discount (${booking.promo})`} v={`−${inr(booking.discount)}`} tone="text-ok" />}
          </div>
          <div className="flex justify-between border-t border-line px-5 py-4 text-sm font-semibold">
            <span>Paid via {booking.paymentMethod}</span>
            <span className="tabular-nums">{inr(booking.total, 2)}</span>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-faint">
            Booked on {new Date(booking.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
          {!cancelled &&
            (canCancel ? (
              <button onClick={() => setCancelOpen(true)} className="font-medium text-low hover:underline">
                Cancel booking
              </button>
            ) : (
              <span className="text-faint">{cinema.cancellable ? (over ? 'Show completed' : 'Cancellation closes 2 hours before the show') : 'This cinema does not allow cancellation'}</span>
            ))}
        </div>
      </div>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel this booking?" labelledBy="cancel-title">
        <div className="space-y-4 p-5 text-sm">
          <p className="text-muted">
            {movie.title} · {longDate(booking.date)}, {time12(booking.time)} · Seats {booking.seats.map((s) => s.id).join(', ')}
          </p>
          <div className="space-y-2 rounded-lg border border-line p-4">
            <Row k="Amount paid" v={inr(booking.total, 2)} />
            <Row k="Convenience fee (non-refundable)" v={`−${inr(booking.convenienceFee + booking.gstOnFee, 2)}`} tone="text-low" />
            <div className="border-t border-line pt-2">
              <Row k={<strong className="text-cream">Refund</strong>} v={<strong>{inr(refund, 2)}</strong>} />
            </div>
          </div>
          <p className="text-xs text-faint">Refunds go back to the original payment method in 5–7 working days. Cancelled seats are released for others to book.</p>
          <div className="flex gap-3 pt-1">
            <Button tone="outline" className="flex-1" onClick={() => setCancelOpen(false)}>
              Keep booking
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                cancelBooking(booking.id, refund);
                setCancelOpen(false);
                toast(`Cancelled. ${inr(refund, 2)} will be refunded.`, 'success');
              }}
            >
              Cancel booking
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  );
}

function ActionButton({ icon, label, onClick, href }: { icon: React.ReactNode; label: string; onClick?: () => void; href?: string }) {
  const cls = 'flex flex-col items-center gap-1.5 rounded-xl border border-line bg-panel py-3.5 text-xs font-medium text-muted transition-colors hover:border-line-strong hover:text-cream';
  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {icon}
        {label}
      </a>
    );
  return (
    <button onClick={onClick} className={cls}>
      {icon}
      {label}
    </button>
  );
}

function Row({ k, v, tone }: { k: React.ReactNode; v: React.ReactNode; tone?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{k}</span>
      <span className={clsx('tabular-nums', tone)}>{v}</span>
    </div>
  );
}
