'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import type { Show } from '@/lib/types';
import { availability } from '@/lib/shows';
import { inr, time12 } from '@/lib/format';

const TONE = {
  ok: 'text-ok border-ok/35 hover:border-ok hover:bg-ok/[0.07]',
  warn: 'text-warn border-warn/35 hover:border-warn hover:bg-warn/[0.07]',
  low: 'text-low border-low/40 hover:border-low hover:bg-low/[0.07]',
  full: 'text-faint border-line',
};

export function ShowtimeChip({ show, past, showLanguage }: { show: Show; past?: boolean; showLanguage?: boolean }) {
  const a = availability(show.occupancy);
  const disabled = past || a.tone === 'full';
  const inner = (
    <>
      <span className="text-[13.5px] font-semibold tabular-nums">{time12(show.time)}</span>
      <span className="text-[10.5px] font-medium uppercase tracking-wide opacity-75">
        {show.format}
        {showLanguage ? ` · ${show.language.slice(0, 3)}` : ''}
      </span>
      {!disabled && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-max -translate-x-1/2 rounded-md border border-line-strong bg-panel-3 px-2.5 py-1.5 text-left text-[11.5px] font-normal normal-case tracking-normal text-cream shadow-xl group-hover/chip:block">
          {inr(show.minPrice)} – {inr(show.maxPrice)}
          <span className="block text-faint">
            {a.label} · {show.screen}
          </span>
        </span>
      )}
    </>
  );
  const cls = clsx(
    'group/chip relative flex min-w-[96px] flex-col items-center justify-center rounded-lg border px-3 py-2 leading-tight transition-colors duration-150',
    disabled ? 'cursor-not-allowed border-line text-faint/70 line-through decoration-faint/40' : TONE[a.tone],
  );
  if (disabled)
    return (
      <span className={cls} title={past ? 'Show has started' : 'Sold out'}>
        {inner}
      </span>
    );
  return (
    <Link href={`/book/${show.id}`} transitionTypes={['nav-forward']} className={cls} aria-label={`${time12(show.time)} ${show.format} ${show.language}, ${a.label}`}>
      {inner}
    </Link>
  );
}

export function AvailabilityLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
      {[
        ['bg-ok', 'Available'],
        ['bg-warn', 'Filling fast'],
        ['bg-low', 'Almost full'],
        ['bg-faint', 'Sold out / started'],
      ].map(([c, l]) => (
        <span key={l} className="inline-flex items-center gap-1.5">
          <span className={clsx('h-2 w-2 rounded-full', c)} /> {l}
        </span>
      ))}
    </div>
  );
}
