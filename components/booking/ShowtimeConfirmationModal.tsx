"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie } from '@/types/movie';
import { Theatre } from '@/types/theatre';
import { Show } from '@/types/show';

interface ShowtimeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
  theatre: Theatre;
  show: Show;
  onConfirm: () => void;
}

export function ShowtimeConfirmationModal({
  isOpen,
  onClose,
  movie,
  theatre,
  show,
  onConfirm,
}: ShowtimeConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl z-10"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <span className="text-xs uppercase font-bold tracking-widest text-primary">
                Confirm Showtime
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 border border-white/10">
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading text-white mb-1">{movie.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span className="bg-secondary px-2 py-0.5 rounded border border-white/5 font-mono font-bold text-white">{show.language || movie.language}</span>
                  <span className="text-primary font-semibold">{show.format || '2D'}</span>
                </div>
                <p className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                  ✓ Verified Showtime
                </p>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 border border-white/5 space-y-3 mb-6 text-sm">
              <div className="flex items-center gap-2 text-gray-200">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold">{theatre.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pl-6">
                <span>{theatre.area}</span>
                <span className="flex items-center gap-1 text-white font-mono">
                  <Tv className="w-3 h-3 text-muted-foreground" /> {show.screenName || show.screen || 'Screen 1'}
                </span>
              </div>
              <div className="border-t border-white/5 pt-3 flex justify-between text-xs font-medium text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {new Date(show.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5 text-primary font-bold text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  {show.time}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={onConfirm}
              className="w-full h-12 text-base font-bold rounded-xl"
            >
              Select Seats →
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
