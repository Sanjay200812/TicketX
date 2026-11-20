'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { Cinema, Movie, Show } from '@/lib/types';
import type { PriceResult } from '@/lib/format';
import { inr, shortDate, time12 } from '@/lib/format';
import { getSnack } from '@/lib/catalog';
import { Poster } from './Poster';
import { CONVENIENCE_FEE_PER_TICKET } from '@/lib/catalog';

export function OrderSummary({
  movie,
  cinema,
  show,
  seats,
  snacks,
  price,
  className,
}: {
  movie: Movie;
  cinema: Cinema;
  show: Show;
  seats: { id: string; tierId: string; price: number }[];
  snacks: Record<string, number>;
  price: PriceResult;
  className?: string;
}) {
  const [feeOpen, setFeeOpen] = useState(false);
  const snackLines = Object.entries(snacks).filter(([, q]) => q > 0);
  const tiers = Array.from(new Set(seats.map((s) => s.tierId)));

  return (
    <div className={clsx('overflow-hidden rounded-xl border border-line bg-panel', className)}>
      <div className="flex gap-4 p-5">
        <div className="w-16 shrink-0 overflow-hidden rounded-md">
          <Poster movie={movie} bare />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug">{movie.title}</h3>
          <p className="mt-0.5 text-xs text-muted">
            {movie.certificate} · {show.language} · {show.format}
          </p>
          <p className="mt-2 text-[13px] text-cream/85">{cinema.name}</p>
          <p className="text-xs text-muted">
            {shortDate(show.date)} · {time12(show.time)} · {show.screen}
          </p>
        </div>
      </div>

      <div className="perforation h-3 bg-panel-3/40" />

      <div className="space-y-3 p-5 text-sm">
        <Line
          label={
            <span>
              {seats.length} × Ticket{seats.length > 1 ? 's' : ''}
              <span className="block text-xs text-faint">
                {tiers.map((t) => seats.filter((s) => s.tierId === t).map((s) => s.id).join(', ')).join(' · ')}
              </span>
            </span>
          }
          value={inr(price.ticketTotal)}
        />
        <AnimatePresence initial={false}>
          {snackLines.map(([id, q]) => {
            const s = getSnack(id);
            if (!s) return null;
            return (
              <motion.div key={id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <Line label={`${q} × ${s.name}`} value={inr(s.price * q)} />
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div>
          <button onClick={() => setFeeOpen(!feeOpen)} className="flex w-full items-center justify-between text-left text-muted hover:text-cream">
            <span className="inline-flex items-center gap-1">
              Convenience fee <ChevronDown size={14} className={clsx('transition-transform', feeOpen && 'rotate-180')} />
            </span>
            <span className="tabular-nums">{inr(price.convenienceFee + price.gstOnFee, 2)}</span>
          </button>
          <AnimatePresence initial={false}>
            {feeOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-2 space-y-1.5 border-l border-line pl-3 text-xs text-faint">
                  <Line label={`Base fee (${inr(CONVENIENCE_FEE_PER_TICKET)} × ${seats.length})`} value={inr(price.convenienceFee, 2)} />
                  <Line label="IGST @ 18%" value={inr(price.gstOnFee, 2)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {price.discount > 0 && <Line label={<span className="text-ok">Discount ({price.promoApplied})</span>} value={<span className="text-ok">−{inr(price.discount)}</span>} />}
      </div>
      <div className="flex items-center justify-between border-t border-line bg-panel-2 px-5 py-4">
        <span className="text-sm font-medium">Amount payable</span>
        <motion.span key={price.total} initial={{ opacity: 0.4, y: -3 }} animate={{ opacity: 1, y: 0 }} className="text-lg font-semibold tabular-nums">
          {inr(price.total, 2)}
        </motion.span>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="shrink-0 tabular-nums text-cream">{value}</span>
    </div>
  );
}
