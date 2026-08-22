"use client";

import { motion } from 'framer-motion';
import { Crown, Check, X } from 'lucide-react';
import { Seat as SeatType } from '@/types/seat';

interface SeatItemProps {
  seat: SeatType;
  isSelected: boolean;
  onSelect: (seat: SeatType) => void;
  isEvent?: boolean;
}

export function SeatItem({ seat, isSelected, onSelect }: SeatItemProps) {
  const isBooked = seat.status === 'booked';
  const isBlocked = seat.status === 'blocked';

  if (isBlocked) {
    return <div className="w-6 h-6 sm:w-7 sm:h-7" />;
  }

  const catLower = (seat.category || '').toLowerCase();
  const isOnLand = catLower.includes('land') || catLower.includes('recliner') || catLower.includes('sofa') || catLower.includes('luxury');

  // Requirement 6: Minimal, compact, neat seat styling (Reference Image 3 style)
  let fillClass = 'bg-secondary/40 border-white/20 text-gray-300 hover:border-white/60 hover:bg-secondary';

  if (isBooked) {
    fillClass = 'bg-[#18181c] border-white/5 text-gray-600 opacity-40 cursor-not-allowed';
  } else if (isSelected) {
    fillClass = 'bg-rose-600 border-rose-400 text-white font-bold shadow-[0_0_12px_rgba(225,29,72,0.8)]';
  }

  const sizeClass = isOnLand
    ? 'w-10 h-7 sm:w-11 sm:h-8 rounded-lg border font-bold'
    : 'w-6 h-6 sm:w-7 sm:h-7 rounded-md border text-[10px] font-semibold';

  return (
    <div className="relative group">
      <motion.button
        whileHover={isBooked ? {} : { scale: isOnLand ? 1.05 : 1.1 }}
        whileTap={isBooked ? {} : { scale: 0.92 }}
        animate={isSelected ? { scale: [0.95, 1.08, 1] } : {}}
        transition={{ duration: 0.15 }}
        onClick={() => !isBooked && onSelect(seat)}
        disabled={isBooked}
        className={`relative flex items-center justify-center transition-all cursor-pointer select-none font-mono ${sizeClass} ${fillClass}`}
        aria-label={`Seat ${seat.id}, ${seat.category}, ₹${seat.price}`}
      >
        {isBooked ? (
          <X className="w-3 h-3 text-neutral-600 stroke-[2.5]" />
        ) : isSelected ? (
          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
        ) : (
          <span className="leading-none flex items-center justify-center gap-0.5">
            {isOnLand && <Crown className="w-2.5 h-2.5 text-amber-400" />}
            {seat.number}
          </span>
        )}
      </motion.button>

      {/* Hover Tooltip */}
      {!isBooked && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
          <div className="bg-black/95 text-white text-[11px] py-1 px-2.5 rounded-lg border border-white/15 whitespace-nowrap shadow-2xl flex items-center gap-2">
            <span className="font-bold text-primary">{seat.id}</span>
            <span className="text-gray-300">{seat.category}</span>
            <span className="font-extrabold text-emerald-400 font-mono">₹{seat.price}</span>
          </div>
          <div className="w-2 h-2 bg-black/95 rotate-45 -mt-1 border-r border-b border-white/15" />
        </div>
      )}
    </div>
  );
}
