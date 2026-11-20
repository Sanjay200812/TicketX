'use client';

import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { dayParts } from '@/lib/format';

export function DateStrip({
  dates,
  value,
  onChange,
  disabled = [],
  id = 'date',
}: {
  dates: string[];
  value: string;
  onChange: (d: string) => void;
  disabled?: string[];
  id?: string;
}) {
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Choose date">
      {dates.map((d, i) => {
        const p = dayParts(d);
        const active = d === value;
        const off = disabled.includes(d);
        return (
          <button
            key={d}
            role="tab"
            aria-selected={active}
            disabled={off}
            onClick={() => onChange(d)}
            className={clsx(
              'relative flex h-[62px] w-[54px] shrink-0 flex-col items-center justify-center rounded-lg transition-colors duration-200',
              active ? 'text-white' : off ? 'text-faint/50' : 'text-muted hover:bg-white/[0.04] hover:text-cream',
            )}
          >
            {active && (
              <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-lg bg-marquee" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
            )}
            <span className="relative text-[10.5px] font-semibold uppercase tracking-wider">{i === 0 ? 'Today' : p.dow}</span>
            <span className="relative text-lg font-semibold leading-tight tabular-nums">{p.day}</span>
            <span className="relative text-[10.5px] uppercase tracking-wider opacity-80">{p.month}</span>
          </button>
        );
      })}
    </div>
  );
}
