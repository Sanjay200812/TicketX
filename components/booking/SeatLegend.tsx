"use client";

import { TicketXSeatSection } from '@/types/seatLayouts';
import { getSeatStyleClasses } from '@/lib/seatColors';

interface SeatLegendProps {
  sections?: TicketXSeatSection[];
  isEvent?: boolean;
}

export function SeatLegend({ sections, isEvent = false }: SeatLegendProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs mb-8 bg-secondary/30 p-3.5 rounded-xl border border-white/10 shadow-lg select-none">
      {/* Category Section Indicators */}
      {sections && sections.length > 0 ? (
        sections.map((sec) => {
          const styles = getSeatStyleClasses(sec.name, isEvent);
          return (
            <div key={sec.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border ${styles.availableClass}`} />
              <span className="font-bold text-white">
                {styles.label} <span className="text-muted-foreground font-mono font-medium">(₹{sec.price})</span>
              </span>
            </div>
          );
        })
      ) : isEvent ? (
        <>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border bg-slate-700/70 border-slate-400/60" />
            <span className="font-bold text-white">Silver</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border bg-amber-600/75 border-amber-400/75" />
            <span className="font-bold text-white">Gold (Balcony)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border bg-rose-600/85 border-rose-400/85" />
            <span className="font-bold text-white">Premium</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border bg-slate-700/70 border-slate-400/60" />
            <span className="font-bold text-white">Silver</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border bg-amber-600/75 border-amber-400/75" />
            <span className="font-bold text-white">Gold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border bg-rose-600/85 border-rose-400/85" />
            <span className="font-bold text-white">On Land</span>
          </div>
        </>
      )}

      <div className="h-4 w-px bg-white/10 hidden sm:block" />

      {/* Selected & Unavailable Indicators */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border-2 border-white bg-slate-600 ring-2 ring-primary/80" />
        <span className="text-white font-bold">Selected</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-neutral-800/90 border border-neutral-700/50 opacity-50" />
        <span className="text-muted-foreground font-medium">Unavailable</span>
      </div>
    </div>
  );
}
