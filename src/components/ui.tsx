'use client';

import React, { useEffect } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, Star, X } from 'lucide-react';
import type { Certificate } from '@/lib/types';
import { compact } from '@/lib/format';

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({ tone = 'primary', size = 'md', className, children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-[background,color,border,transform,opacity] duration-200 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100',
        size === 'sm' && 'h-8 px-3 text-[13px]',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-[15px]',
        tone === 'primary' && 'bg-marquee text-white hover:bg-marquee-deep',
        tone === 'secondary' && 'bg-cream text-canvas hover:bg-white',
        tone === 'outline' && 'border border-line-strong text-cream hover:border-cream/50 hover:bg-white/[0.03]',
        tone === 'ghost' && 'text-muted hover:text-cream hover:bg-white/[0.05]',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function CertBadge({ cert, className }: { cert: Certificate; className?: string }) {
  return (
    <span
      title="CBFC certificate"
      className={clsx(
        'inline-flex h-5 items-center rounded-[4px] border px-1.5 text-[11px] font-semibold tracking-wide',
        cert === 'A' ? 'border-low/60 text-low' : 'border-line-strong text-muted',
        className,
      )}
    >
      {cert}
    </span>
  );
}

export function Rating({ value, votes, size = 'sm' }: { value: number; votes?: number; size?: 'sm' | 'md' }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5', size === 'md' ? 'text-[15px]' : 'text-[13px]')}>
      <Star size={size === 'md' ? 16 : 13} className="fill-marquee text-marquee" />
      <span className="font-semibold text-cream tabular-nums">{value.toFixed(1)}/10</span>
      {votes !== undefined && <span className="text-faint">{compact(votes)} votes</span>}
    </span>
  );
}

export function Chip({
  active,
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      className={clsx(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors duration-200',
        active ? 'border-cream bg-cream text-canvas' : 'border-line-strong text-muted hover:border-cream/40 hover:text-cream',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Stepper({ value, onChange, max = 10 }: { value: number; onChange: (v: number) => void; max?: number }) {
  if (value === 0)
    return (
      <Button tone="outline" size="sm" onClick={() => onChange(1)} className="min-w-[84px] !border-marquee/60 !text-marquee hover:!bg-marquee/10">
        Add
      </Button>
    );
  return (
    <div className="inline-flex h-8 min-w-[84px] items-center justify-between rounded-lg bg-marquee text-white">
      <button className="grid h-8 w-8 place-items-center" aria-label="Decrease" onClick={() => onChange(value - 1)}>
        <Minus size={14} />
      </button>
      <motion.span key={value} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-sm font-semibold tabular-nums">
        {value}
      </motion.span>
      <button className="grid h-8 w-8 place-items-center disabled:opacity-40" aria-label="Increase" disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus size={14} />
      </button>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
  title,
  width = 'max-w-md',
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: string;
  labelledBy?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={clsx('relative w-full overflow-hidden rounded-t-2xl border border-line bg-panel shadow-2xl sm:rounded-2xl', width)}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 id={labelledBy} className="text-[15px] font-semibold">
                  {title}
                </h2>
                <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted hover:bg-white/5 hover:text-cream">
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SectionHeader({ title, sub, action }: { title: string; sub?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight sm:text-[22px]">{title}</h2>
        {sub && <div className="mt-1 text-sm text-muted">{sub}</div>}
      </div>
      {action}
    </div>
  );
}

export function Dot() {
  return <span className="mx-1.5 inline-block h-[3px] w-[3px] translate-y-[-3px] rounded-full bg-faint" />;
}
