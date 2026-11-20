'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { ArrowLeft, Check, Timer } from 'lucide-react';
import type { Cinema, Movie, Show } from '@/lib/types';
import { shortDate, time12 } from '@/lib/format';
import { useTicketX } from '@/context/TicketXContext';
import { CertBadge } from './ui';

const STEPS = ['Seats', 'Food & drinks', 'Payment'] as const;

export function BookingHeader({
  movie,
  cinema,
  show,
  step,
  backHref,
  right,
}: {
  movie: Movie;
  cinema: Cinema;
  show: Show;
  step: 0 | 1 | 2;
  backHref: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href={backHref} transitionTypes={['nav-back']} aria-label="Back" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-cream">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-[15px] font-semibold">{movie.title}</h1>
            <CertBadge cert={movie.certificate} className="!h-[18px] !text-[10px]" />
          </div>
          <p className="truncate text-xs text-muted">
            {cinema.name} · {shortDate(show.date)}, {time12(show.time)} · {show.language} {show.format}
          </p>
        </div>
        <ol className="hidden items-center gap-2 text-xs md:flex">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span
                className={clsx(
                  'grid h-5 w-5 place-items-center rounded-full text-[10.5px] font-semibold transition-colors',
                  i < step ? 'bg-ok text-canvas' : i === step ? 'bg-cream text-canvas' : 'border border-line-strong text-faint',
                )}
              >
                {i < step ? <Check size={11} strokeWidth={3} /> : i + 1}
              </span>
              <span className={i === step ? 'font-medium text-cream' : 'text-faint'}>{s}</span>
              {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-line-strong" />}
            </li>
          ))}
        </ol>
        {right}
      </div>
    </header>
  );
}

/** Countdown for the seat hold. Sends the user back to seat selection when it runs out. */
export function HoldTimer({ showId }: { showId: string }) {
  const { draft, setDraft, toast } = useTicketX();
  const router = useRouter();
  const [left, setLeft] = useState<number | null>(null);
  const until = draft?.showId === showId ? draft.holdUntil : null;

  useEffect(() => {
    if (!until) return;
    const tick = () => {
      const ms = until - Date.now();
      setLeft(ms);
      if (ms <= 0) {
        setDraft((d) => (d ? { ...d, seats: [], holdUntil: null } : d));
        toast('Your seat hold expired. Please choose seats again.', 'error');
        router.replace(`/book/${showId}`);
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [until, showId, router, setDraft, toast]);

  if (left === null || left <= 0) return null;
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  const urgent = left < 60000;
  return (
    <div
      className={clsx(
        'flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold tabular-nums transition-colors',
        urgent ? 'border-low/50 bg-low/10 text-low' : 'border-line-strong text-cream',
      )}
      role="timer"
      aria-label={`Seats held for ${m} minutes ${s} seconds`}
    >
      <Timer size={14} />
      {m}:{String(s).padStart(2, '0')}
    </div>
  );
}
