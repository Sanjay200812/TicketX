"use client";

import { motion } from 'framer-motion';

export function CinemaScreen() {
  return (
    <div className="w-full max-w-3xl mx-auto mt-12 mb-6 relative flex flex-col items-center select-none">
      {/* Light glow radiating upwards onto seats */}
      <div className="w-full h-12 bg-gradient-to-t from-primary/25 via-primary/10 to-transparent rounded-b-full blur-md pointer-events-none mb-1" />

      {/* Realistic Curved Arc Screen Line */}
      <div className="relative w-full h-6 flex items-center justify-center">
        <div className="w-full h-3 border-b-4 border-primary rounded-[50%/100%] shadow-[0_8px_25px_rgba(216,33,50,0.6)]" />
      </div>

      {/* Screen Label & Upward Direction Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-xs font-bold text-primary uppercase tracking-[0.3em] mt-3 flex items-center gap-2"
      >
        <span className="text-primary text-sm">↑</span>
        <span>SCREEN THIS WAY</span>
        <span className="text-primary text-sm">↑</span>
      </motion.div>

      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
        All Eyes Face Down Towards Screen
      </p>
    </div>
  );
}
