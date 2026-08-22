"use client";

import { motion } from 'framer-motion';
import { Crown, Sparkles, Check } from 'lucide-react';
import { Seat as SeatType } from '@/types/seat';
import { getSeatStyleClasses } from '@/lib/seatColors';

interface SeatItemProps {
  seat: SeatType;
  isSelected: boolean;
  onSelect: (seat: SeatType) => void;
  isEvent?: boolean;
}

export function SeatItem({ seat, isSelected, onSelect, isEvent = false }: SeatItemProps) {
  const isBooked = seat.status === 'booked';
  const isBlocked = seat.status === 'blocked';

  if (isBlocked) {
    return <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9" />;
  }

  const styles = getSeatStyleClasses(seat.category || '', isEvent);
  const catLower = (seat.category || '').toLowerCase();
  const isOnLand = catLower.includes('land') || catLower.includes('recliner') || catLower.includes('sofa') || catLower.includes('luxury');

  let fillClass = styles.availableClass;

  if (isBooked) {
    fillClass = styles.bookedClass;
  } else if (isSelected) {
    fillClass = styles.selectedClass;
  }

  const sizeClass = isOnLand
    ? 'w-10 h-9 sm:w-12 sm:h-10 md:w-14 md:h-11 rounded-lg border-2 font-bold'
    : 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded border';

  return (
    <div className="relative group">
      <motion.button
        whileHover={isBooked ? {} : { scale: isOnLand ? 1.08 : 1.12 }}
        whileTap={isBooked ? {} : { scale: 0.9 }}
        animate={isSelected ? { scale: [0.95, 1.08, 1] } : {}}
        transition={{ duration: 0.15 }}
        onClick={() => !isBooked && onSelect(seat)}
        disabled={isBooked}
        className={`relative flex flex-col items-center justify-between p-0.5 transition-all cursor-pointer select-none ${sizeClass} ${fillClass}`}
        aria-label={`Seat ${seat.id}, ${seat.category}, ₹${seat.price}`}
      >
        {/* Top Backrest Header */}
        <div className={`w-full ${isOnLand ? 'h-2 bg-white/20 rounded-t-md flex items-center justify-center' : 'h-1.5 bg-black/20 rounded-t-sm'}`}>
          {isOnLand && !isBooked && (
            <Crown className="w-2.5 h-2.5 text-amber-300" />
          )}
        </div>

        {/* Seat Number & Identifier or Checkmark */}
        <span className={`leading-none my-auto flex items-center justify-center ${isOnLand ? 'text-xs font-black tracking-tighter' : 'text-[10px] font-extrabold'}`}>
          {isSelected ? (
            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
          ) : (
            seat.number
          )}
        </span>

        {/* Bottom Armrest Base */}
        <div className="w-full h-1 rounded-b-sm bg-black/40 flex justify-between px-0.5">
          <div className="w-0.5 h-full bg-white/30 rounded-full" />
          <div className="w-0.5 h-full bg-white/30 rounded-full" />
        </div>
      </motion.button>

      {/* Hover Tooltip */}
      {!isBooked && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
          <div className="bg-black/95 text-white text-[11px] py-1.5 px-3 rounded-lg border border-white/15 whitespace-nowrap shadow-2xl flex items-center gap-2">
            <span className="font-bold text-primary">{seat.id}</span>
            <span className="text-gray-300">{styles.label}</span>
            <span className="font-extrabold text-emerald-400 font-mono">₹{seat.price}</span>
            {isOnLand && <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />}
          </div>
          <div className="w-2.5 h-2.5 bg-black/95 rotate-45 -mt-1 border-r border-b border-white/15" />
        </div>
      )}
    </div>
  );
}
