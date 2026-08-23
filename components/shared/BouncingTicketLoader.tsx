"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Sparkles } from 'lucide-react';

interface BouncingTicketLoaderProps {
  message?: string;
}

export function BouncingTicketLoader({ message = "Creating your TicketX account..." }: BouncingTicketLoaderProps) {
  return (
    <div className="py-6 flex flex-col items-center justify-center space-y-4">
      {/* Bouncing Ticket Icon Container */}
      <div className="relative">
        <motion.div
          animate={{
            y: [0, -18, 0],
            rotate: [0, -6, 6, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-950 via-primary to-rose-700 border border-primary/40 flex items-center justify-center shadow-[0_0_25px_rgba(216,33,50,0.5)]"
        >
          <Ticket className="w-8 h-8 text-white" />
        </motion.div>

        {/* Pulse shadow underneath */}
        <motion.div
          animate={{
            scale: [1, 0.6, 1],
            opacity: [0.6, 0.2, 0.6],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-12 h-2 bg-primary/40 rounded-full blur-sm mx-auto mt-2"
        />
      </div>

      {/* Loading message */}
      <div className="text-center space-y-1">
        <p className="text-xs font-bold font-heading text-white flex items-center justify-center gap-1.5">
          <span>{message}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        </p>
        <p className="text-[11px] text-muted-foreground font-mono">
          Just a sec... on the way to TicketX
        </p>
      </div>
    </div>
  );
}
