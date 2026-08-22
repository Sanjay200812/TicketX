"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TemporaryMinimapProps {
  containerRef: React.RefObject<HTMLDivElement>;
  hasLuxury?: boolean;
}

export function TemporaryMinimap({ containerRef, hasLuxury = false }: TemporaryMinimapProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [viewportRect, setViewportRect] = useState({ top: 0, left: 0, width: 100, height: 100 });
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      // Calculate viewport rectangle relative to full scroll container
      const scrollLeft = el.scrollLeft;
      const scrollTop = el.scrollTop;
      const scrollWidth = el.scrollWidth || 1;
      const scrollHeight = el.scrollHeight || 1;
      const clientWidth = el.clientWidth;
      const clientHeight = el.clientHeight;

      const left = (scrollLeft / scrollWidth) * 100;
      const top = (scrollTop / scrollHeight) * 100;
      const width = Math.min(100, (clientWidth / scrollWidth) * 100);
      const height = Math.min(100, (clientHeight / scrollHeight) * 100);

      setViewportRect({ top, left, width, height });
      setIsVisible(true);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      // Requirement 21: Auto-fade out after 1,000ms of inactivity
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
    };

    el.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [containerRef]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="fixed top-24 right-6 z-40 bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-2xl w-48 pointer-events-none font-mono text-[9px]"
        >
          <div className="flex items-center justify-between text-gray-400 font-bold mb-2 uppercase tracking-wider text-[8px]">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              NAV MAP
            </span>
            <span>AUDITORIUM</span>
          </div>

          {/* Mini Auditorium Box */}
          <div className="relative w-full h-28 bg-[#121216] border border-white/10 rounded-xl p-1.5 overflow-hidden flex flex-col justify-between">
            {/* Viewport Frame Box */}
            <div
              className="absolute border-2 border-emerald-400 bg-emerald-400/10 rounded transition-all duration-75 z-10"
              style={{
                top: `${viewportRect.top}%`,
                left: `${viewportRect.left}%`,
                width: `${Math.max(15, viewportRect.width)}%`,
                height: `${Math.max(20, viewportRect.height)}%`,
              }}
            />

            {/* Gold Tier Dot Block (Top - Requirement 11) */}
            <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded p-1 text-center">
              <span className="text-amber-300 font-bold text-[7px] block">GOLD (₹295)</span>
              <div className="flex justify-center gap-0.5 mt-0.5 opacity-60">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={`g-${i}`} className="w-1 h-1 rounded-full bg-amber-400" />
                ))}
              </div>
            </div>

            {/* Silver Tier Dot Block (Middle - Requirement 11) */}
            <div className="w-full bg-slate-500/10 border border-slate-500/20 rounded p-1 text-center my-0.5">
              <span className="text-slate-300 font-bold text-[7px] block">SILVER (₹150)</span>
              <div className="flex justify-center gap-0.5 mt-0.5 opacity-60">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={`s-${i}`} className="w-1 h-1 rounded-full bg-slate-400" />
                ))}
              </div>
            </div>

            {/* Luxury Tier Dot Block (Bottom - NRT Only) */}
            {hasLuxury && (
              <div className="w-full bg-rose-500/10 border border-rose-500/20 rounded p-0.5 text-center">
                <span className="text-rose-300 font-bold text-[7px] block">ON LAND LUXURY</span>
              </div>
            )}

            {/* Screen Line Bottom */}
            <div className="w-full border-t border-primary/60 text-center pt-0.5 text-[7px] font-bold text-primary">
              SCREEN ↓
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
