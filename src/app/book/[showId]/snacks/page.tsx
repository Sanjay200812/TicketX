'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Page } from '@/components/Page';
import { BookingHeader, HoldTimer } from '@/components/BookingChrome';
import { OrderSummary } from '@/components/OrderSummary';
import { Button, Stepper } from '@/components/ui';
import { SNACKS } from '@/lib/catalog';
import { inr, priceBooking } from '@/lib/format';
import { useBookingDraft } from '@/lib/useBookingDraft';
import { useTicketX } from '@/context/TicketXContext';
import type { Snack } from '@/lib/types';

const CATS = ['All', 'Combos', 'Popcorn', 'Snacks', 'Beverages'] as const;

export default function SnacksPage() {
  const { showId } = useParams<{ showId: string }>();
  const router = useRouter();
  const { data, draft, ready } = useBookingDraft(showId);
  const { setDraft, bookings } = useTicketX();
  const [cat, setCat] = useState<(typeof CATS)[number]>('All');
  const items = useMemo(() => SNACKS.filter((s) => cat === 'All' || s.category === cat), [cat]);

  if (!ready || !data || !draft) return <div className="min-h-screen" />;
  const { show, movie, cinema } = data;
  const price = priceBooking({ show, seats: draft.seats, snacks: draft.snacks, promo: null, firstBooking: bookings.length === 0 });
  const count = Object.values(draft.snacks).reduce((a, b) => a + b, 0);

  const setQty = (id: string, q: number) => setDraft((d) => (d ? { ...d, snacks: { ...d.snacks, [id]: Math.max(0, q) } } : d));
  const next = () => router.push(`/book/${show.id}/checkout`, { transitionTypes: ['nav-forward'] });

  return (
    <Page>
      <BookingHeader movie={movie} cinema={cinema} show={show} step={1} backHref={`/book/${show.id}`} right={<HoldTimer showId={show.id} />} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-32 pt-8 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Grab a bite</h2>
          <p className="mt-1 text-sm text-muted">Pre-order and collect at the counter, or have it delivered to your seat at {cinema.chain}.</p>

          <div className="no-scrollbar mt-6 flex gap-1 overflow-x-auto border-b border-line">
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={clsx('relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors', cat === c ? 'text-cream' : 'text-faint hover:text-muted')}>
                {c}
                {cat === c && <motion.span layoutId="snack-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-marquee" />}
              </button>
            ))}
          </div>

          <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {items.map((s) => (
                <motion.div key={s.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }}>
                  <SnackCard snack={s} qty={draft.snacks[s.id] ?? 0} onChange={(q) => setQty(s.id, q)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary movie={movie} cinema={cinema} show={show} seats={draft.seats} snacks={draft.snacks} price={price} />
          <p className="mt-3 text-xs leading-relaxed text-faint">Food & beverage orders can&apos;t be cancelled separately once paid. Outside food is not permitted.</p>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="text-sm">
            <div className="font-semibold tabular-nums">{inr(price.total, 2)}</div>
            <div className="text-xs text-muted">{count > 0 ? `${count} item${count > 1 ? 's' : ''} added` : 'No food added'}</div>
          </div>
          <div className="flex gap-3">
            {count === 0 && (
              <Button tone="ghost" size="lg" onClick={next}>
                Skip
              </Button>
            )}
            <Button size="lg" onClick={next} className="min-w-[160px]">
              Continue
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
}

const CAT_TONE: Record<Snack['category'], string> = {
  Combos: 'from-[#3a1f16] to-[#1d1410]',
  Popcorn: 'from-[#3b3018] to-[#1c170e]',
  Snacks: 'from-[#2d2a17] to-[#16140c]',
  Beverages: 'from-[#16283a] to-[#0e151d]',
};

function SnackCard({ snack, qty, onChange }: { snack: Snack; qty: number; onChange: (q: number) => void }) {
  return (
    <div className={clsx('flex h-full gap-4 rounded-xl border p-4 transition-colors', qty > 0 ? 'border-marquee/50 bg-marquee/[0.04]' : 'border-line bg-panel')}>
      <div className={clsx('grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-[11px] font-semibold uppercase tracking-wider text-cream/50', CAT_TONE[snack.category])}>
        {snack.category === 'Combos' ? 'Combo' : snack.category.replace(/s$/, '')}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <span className={clsx('mt-1 grid h-3 w-3 shrink-0 place-items-center rounded-[2px] border', snack.veg ? 'border-ok' : 'border-low')} title={snack.veg ? 'Vegetarian' : 'Non-vegetarian'}>
            <span className={clsx('h-1.5 w-1.5 rounded-full', snack.veg ? 'bg-ok' : 'bg-low')} />
          </span>
          <h3 className="text-sm font-semibold leading-snug">{snack.name}</h3>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted">{snack.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div>
            <span className="text-sm font-semibold">{inr(snack.price)}</span>
            <span className="ml-2 text-[11px] text-faint">{snack.kcal} kcal</span>
          </div>
          <Stepper value={qty} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
