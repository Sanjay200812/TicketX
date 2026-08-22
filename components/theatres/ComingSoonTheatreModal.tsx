"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Bell, X, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TicketXTheatre } from '@/types/theatre';

interface ComingSoonTheatreModalProps {
  theatre: TicketXTheatre | null;
  onClose: () => void;
  onViewAvailable?: () => void;
}

export function ComingSoonTheatreModal({ theatre, onClose, onViewAvailable }: ComingSoonTheatreModalProps) {
  const [notified, setNotified] = useState(false);

  return (
    <AnimatePresence>
      {theatre && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl z-10 flex flex-col items-center text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Building2 className="w-7 h-7" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" /> COMING SOON
            </span>

            <h3 className="text-xl font-bold font-heading text-white mb-2">{theatre.name}</h3>

            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Bookings for this theatre are not available on TicketX yet. We are working on bringing showtimes for this cinema soon!
            </p>

            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={() => setNotified(!notified)}
                variant={notified ? "secondary" : "default"}
                className="rounded-full w-full font-bold gap-2"
              >
                {notified ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" /> Notification Set!
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" /> Notify Me When Ready
                  </>
                )}
              </Button>

              {onViewAvailable && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    onViewAvailable();
                  }}
                  className="rounded-full w-full border-white/20 text-white"
                >
                  View Available Theatres
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
