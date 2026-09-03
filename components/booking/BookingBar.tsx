"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Seat } from '@/types/seat';

export const MAX_SEATS_PER_BOOKING = 10;

interface BookingBarProps {
  selectedSeats: Seat[];
  onProceed: () => void;
  loading?: boolean;
}

export function BookingBar({ selectedSeats, onProceed, loading }: BookingBarProps) {
  const isVisible = selectedSeats.length > 0;

  // Group seats by category for dynamic price breakdown
  const categoryBreakdown = selectedSeats.reduce((acc, seat) => {
    const key = seat.category || 'General';
    if (!acc[key]) {
      acc[key] = { count: 0, price: seat.price, seats: [] };
    }
    acc[key].count += 1;
    acc[key].seats.push(seat.id);
    return acc;
  }, {} as Record<string, { count: number; price: number; seats: string[] }>);

  const grandTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#121216]/95 backdrop-blur-xl border-t border-white/10 p-4 md:p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
        >
          <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Selected Seats Pills & Category Breakdown */}
            <div className="flex-1 text-center md:text-left flex flex-col gap-2 w-full md:w-auto">
              <div className="flex items-center justify-between md:justify-start gap-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-extrabold">
                  Selected Seats ({selectedSeats.length} / {MAX_SEATS_PER_BOOKING})
                </p>
                {selectedSeats.length >= MAX_SEATS_PER_BOOKING && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    Max Limit Reached
                  </span>
                )}
              </div>

              {/* Seats Pill List */}
              <div className="flex flex-wrap gap-1.5 justify-center md:justify-start max-h-16 overflow-y-auto hide-scrollbar">
                {selectedSeats.map((s) => (
                  <motion.span
                    key={s.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30"
                  >
                    {s.id}
                  </motion.span>
                ))}
              </div>

              {/* Mixed-Category Breakdown */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-300 font-mono justify-center md:justify-start pt-1">
                {Object.entries(categoryBreakdown).map(([catName, data]) => (
                  <span key={catName} className="bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md">
                    <span className="text-white font-bold">{catName}</span>: {data.count} × ₹{data.price} ={' '}
                    <span className="text-emerald-400 font-bold">₹{data.count * data.price}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Total Price & Proceed Button */}
            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
              <div className="text-left md:text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Grand Total</p>
                <motion.p
                  key={grandTotal}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="font-extrabold text-2xl md:text-3xl text-white font-mono"
                >
                  ₹{grandTotal}
                </motion.p>
              </div>

              <Button
                size="lg"
                onClick={onProceed}
                disabled={loading}
                className="rounded-full px-8 font-bold text-base shadow-[0_0_20px_rgba(216,33,50,0.5)] hover:scale-105 transition-transform"
              >
                {loading ? 'Reserving...' : 'Proceed to Checkout →'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
