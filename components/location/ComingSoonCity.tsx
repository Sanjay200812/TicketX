"use client";

import { motion } from 'framer-motion';
import { MapPin, Sparkles, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';

export function ComingSoonCity() {
  const { selectedLocation, setIsCityModalOpen } = useLocation();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-secondary/30 border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl flex flex-col items-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-6 shadow-[0_0_20px_rgba(216,33,50,0.3)]">
          <Building2 className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Coming Soon
        </span>

        <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-white mb-2">
          TicketX is coming to {selectedLocation.name}
        </h2>

        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          We are currently setting up theatres, movies, and showtimes for {selectedLocation.name}, {selectedLocation.state}. Stay tuned for full booking launch!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            onClick={() => setIsCityModalOpen(true)}
            className="rounded-full w-full font-bold gap-2 shadow-[0_0_15px_rgba(216,33,50,0.4)]"
          >
            <MapPin className="w-4 h-4" /> Explore Available Cities
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsCityModalOpen(true)}
            className="rounded-full w-full border-white/20 text-white gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Change City
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
