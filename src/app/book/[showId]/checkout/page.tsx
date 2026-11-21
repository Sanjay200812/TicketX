'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Check, CreditCard, Loader2, Lock, Smartphone, Tag, Ticket, Wallet, X } from 'lucide-react';
import { Page } from '@/components/Page';
import { BookingHeader, HoldTimer } from '@/components/BookingChrome';
import { OrderSummary } from '@/components/OrderSummary';
import { Field } from '@/components/Overlays';
import { Button } from '@/components/ui';
import { OFFERS } from '@/lib/catalog';
import { inr, priceBooking } from '@/lib/format';
import { useBookingDraft } from '@/lib/useBookingDraft';
import { useTicketX } from '@/context/TicketXContext';
import type { Booking } from '@/lib/types';

const METHODS = [
  { id: 'upi', label: 'UPI', sub: 'Pay with any UPI app', icon: Smartphone },
  { id: 'card', label: 'Credit / Debit card', sub: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'netbanking', label: 'Net banking', sub: 'All major banks', icon: Building2 },
  { id: 'wallet', label: 'Wallets', sub: 'Pay from your wallet balance', icon: Wallet },
] as const;

const STAGES = ['Contacting your bank', 'Confirming your seats with the cinema', 'Generating your ticket'];

function bookingId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `TX${s}`;
}

export default function CheckoutPage() {
  const { showId } = useParams<{ showId: string }>();
  const router = useRouter();
  const { data, draft, ready } = useBookingDraft(showId);
  const { user, requireSignIn, addBooking, bookings, toast } = useTicketX();
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [code, setCode] = useState('');
  const [promo, setPromo] = useState<string | null>(null);
  const [method, setMethod] = useState<(typeof METHODS)[number]['id']>('upi');
  const [delivery, setDelivery] = useState<'m-ticket' | 'box-office'>('m-ticket');
  const [agree, setAgree] = useState(false);
  const [paying, setPaying] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setContact({ name: user.name, phone: user.phone, email: user.email });
  }, [user]);

  useEffect(() => {
    if (ready && !user) requireSignIn();
  }, [ready, user, requireSignIn]);

  if (!ready || !data || !draft) return <div className="min-h-screen" />;
  const { show, movie, cinema } = data;
  const firstBooking = bookings.length === 0;
  const price = priceBooking({ show, seats: draft.seats, promo, firstBooking });
  const promoState = promo ? (price.promoError ? { ok: false, msg: price.promoError } : { ok: true, msg: `${promo} applied — you save ${inr(price.discount)}` }) : null;
  const effective = price.promoError ? priceBooking({ show, seats: draft.seats, promo: null, firstBooking }) : price;

  const pay = async () => {
    if (!user) return requireSignIn();
    if (contact.name.trim().length < 2 || !/^[6-9]\d{9}$/.test(contact.phone) || !/^\S+@\S+\.\S+$/.test(contact.email)) {
      setError('Check your contact details.');
      return;
    }
    if (!agree) {
      setError('Please accept the booking terms to continue.');
      return;
    }
    setError('');
    for (let i = 0; i < STAGES.length; i++) {
      setPaying(i);
      await new Promise((r) => setTimeout(r, 900 + Math.random() * 500));
    }
    const id = bookingId();
    const booking: Booking = {
      id,
      showId: show.id,
      movieId: movie.id,
      movie,
      cinema,
      city: show.city,
      cinemaId: cinema.id,
      date: show.date,
      time: show.time,
      screen: show.screen,
      format: show.format,
      language: show.language,
      seats: draft.seats,
      ticketTotal: effective.ticketTotal,
      convenienceFee: effective.convenienceFee,
      gstOnFee: effective.gstOnFee,
      discount: effective.discount,
      promo: effective.promoApplied,
      total: effective.total,
      paymentMethod: METHODS.find((m) => m.id === method)!.label,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      contact: { name: contact.name.trim(), phone: contact.phone, email: contact.email.trim() },
    };
    addBooking(booking);
    // The ticket page clears the draft; clearing it here would trip the hold guard and bounce back to seats
    router.replace(`/tickets/${id}?new=1`, { transitionTypes: ['nav-forward'] });
    toast('Booking confirmed', 'success');
  };

  return (
    <Page>
      <BookingHeader movie={movie} cinema={cinema} show={show} step={1} backHref={`/book/${show.id}`} right={<HoldTimer showId={show.id} />} />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Section title="Contact details" sub="Your ticket will be sent to this number and email">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Name">
                <input className="field" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} autoComplete="name" />
              </Field>
              <Field label="Mobile">
                <input
                  className="field"
                  inputMode="numeric"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  autoComplete="tel-national"
                />
              </Field>
              <Field label="Email">
                <input className="field" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} autoComplete="email" />
              </Field>
            </div>
          </Section>

          <Section title="Ticket type">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: 'm-ticket', label: 'M-Ticket', sub: 'Show the QR code on your phone at the entrance' },
                { id: 'box-office', label: 'Box office pickup', sub: 'Collect printed tickets using your booking ID' },
              ].map((o) => (
                <Radio key={o.id} checked={delivery === o.id} onClick={() => setDelivery(o.id as typeof delivery)} label={o.label} sub={o.sub} icon={<Ticket size={16} />} />
              ))}
            </div>
          </Section>

          <Section title="Offers & promo codes">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && code && setPromo(code)}
                  placeholder="Enter promo code"
                  className="field !pl-9 font-mono uppercase tracking-wider"
                />
              </div>
              {promo && !price.promoError ? (
                <Button
                  tone="outline"
                  onClick={() => {
                    setPromo(null);
                    setCode('');
                  }}
                >
                  Remove
                </Button>
              ) : (
                <Button tone="outline" disabled={!code} onClick={() => setPromo(code)}>
                  Apply
                </Button>
              )}
            </div>
            <AnimatePresence>
              {promoState && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={clsx('mt-2 flex items-center gap-1.5 text-[13px]', promoState.ok ? 'text-ok' : 'text-low')}
                >
                  {promoState.ok ? <Check size={14} /> : <X size={14} />} {promoState.msg}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {OFFERS.map((o) => (
                <button
                  key={o.code}
                  onClick={() => {
                    setCode(o.code);
                    setPromo(o.code);
                  }}
                  className={clsx(
                    'rounded-lg border p-3 text-left transition-colors',
                    promo === o.code ? 'border-marquee/60 bg-marquee/[0.05]' : 'border-line hover:border-line-strong',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold tracking-wider text-marquee">{o.code}</span>
                    <span className="text-[11px] text-faint">Tap to apply</span>
                  </div>
                  <div className="mt-1 text-[13px] font-medium">{o.title}</div>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Payment method">
            <div className="grid gap-3 sm:grid-cols-2">
              {METHODS.map((m) => (
                <Radio key={m.id} checked={method === m.id} onClick={() => setMethod(m.id)} label={m.label} sub={m.sub} icon={<m.icon size={16} />} />
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-faint">
              <Lock size={12} /> Demo checkout — no money is charged and no payment details are collected.
            </p>
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <OrderSummary movie={movie} cinema={cinema} show={show} seats={draft.seats} price={effective} />
          <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-muted">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-[#ef4a33]" />
            <span>
              I accept the booking terms. {cinema.cancellable ? 'Tickets can be cancelled up to 2 hours before the show; convenience fee is non-refundable.' : 'This cinema does not allow cancellations.'}{' '}
              {movie.certificate === 'A' && <strong className="text-cream">This film is rated A — valid ID for 18+ will be checked at entry.</strong>}
            </span>
          </label>
          {error && <p className="text-[13px] text-low">{error}</p>}
          <Button size="lg" className="w-full" onClick={pay} disabled={paying !== null}>
            <Lock size={15} /> Pay {inr(effective.total, 2)}
          </Button>
        </aside>
      </div>

      {/* Payment processing overlay */}
      <AnimatePresence>
        {paying !== null && (
          <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-canvas/90 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm rounded-2xl border border-line bg-panel p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Paying</span>
                <span className="font-semibold tabular-nums">{inr(effective.total, 2)}</span>
              </div>
              <ul className="mt-6 space-y-4">
                {STAGES.map((s, i) => (
                  <li key={s} className="flex items-center gap-3 text-sm">
                    <span className={clsx('grid h-6 w-6 place-items-center rounded-full', i < paying ? 'bg-ok text-canvas' : i === paying ? 'text-cream' : 'border border-line text-faint')}>
                      {i < paying ? <Check size={13} strokeWidth={3} /> : i === paying ? <Loader2 size={16} className="animate-spin" /> : null}
                    </span>
                    <span className={i <= paying ? 'text-cream' : 'text-faint'}>{s}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-center text-xs text-faint">Don&apos;t close this window or press back.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-panel p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {sub && <p className="mt-0.5 text-[13px] text-muted">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Radio({ checked, onClick, label, sub, icon }: { checked: boolean; onClick: () => void; label: string; sub: string; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onClick}
      className={clsx('flex items-start gap-3 rounded-lg border p-4 text-left transition-colors', checked ? 'border-cream/70 bg-white/[0.03]' : 'border-line hover:border-line-strong')}
    >
      <span className={clsx('mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border', checked ? 'border-marquee' : 'border-line-strong')}>
        {checked && <motion.span layoutId={undefined} initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2 w-2 rounded-full bg-marquee" />}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted">{icon}</span>
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-faint">{sub}</span>
      </span>
    </button>
  );
}
