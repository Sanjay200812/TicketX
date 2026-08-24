"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Film, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthEntryGateProps {
  onExplore: () => void;
}

export function AuthEntryGate({ onExplore }: AuthEntryGateProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9990] bg-[#09090b] flex flex-col items-center justify-center p-4 select-none overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute w-[600px] h-[350px] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#121216]/90 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl text-center space-y-6">
        {/* Brand Logo */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-2 shadow-inner">
            <Film className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black font-heading tracking-widest text-white">
            TICKET<span className="text-primary">X</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">
            Book Movies. Discover Events. Own Your Experience.
          </p>
        </div>

        {/* Action Buttons: LOGIN and EXPLORE US */}
        <div className="space-y-3 pt-2">
          <Button
            size="lg"
            onClick={() => router.push('/login')}
            className="w-full h-13 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(216,33,50,0.35)] flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            <span>LOGIN</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onExplore}
            className="w-full h-13 rounded-2xl font-bold border-white/15 text-gray-200 hover:text-white hover:bg-white/10 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>EXPLORE US</span>
          </Button>
        </div>

        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Instant booking • Digital tickets • Zero spam</span>
        </div>
      </div>
    </motion.div>
  );
}
