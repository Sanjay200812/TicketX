"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SeatSection } from '@/types/seatLayouts';
import { Seat } from '@/types/seat';

interface TemporaryMinimapProps {
  containerRef: React.RefObject<HTMLDivElement>;
  sections: SeatSection[];
  realtimeBooked?: Set<string>;
  realtimeHeld?: Set<string>;
  selectedSeats?: Seat[];
}

export function TemporaryMinimap({
  containerRef,
  sections,
  realtimeBooked = new Set(),
  realtimeHeld = new Set(),
  selectedSeats = [],
}: TemporaryMinimapProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [viewportRect, setViewportRect] = useState({ top: 0, left: 0, width: 100, height: 100 });
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedSet = new Set(selectedSeats.map((s) => s.id));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
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

      // Requirement 6: Auto-fade out ~1,000ms after scroll/pan stops
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
          className="fixed top-24 right-6 z-40 bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-2xl w-52 pointer-events-none font-mono text-[9px]"
        >
          <div className="flex items-center justify-between text-gray-400 font-bold mb-2 uppercase tracking-wider text-[8px]">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              NAV MAP
            </span>
            <span>AUDITORIUM</span>
          </div>

          {/* Real Auditorium Miniature Dot Layout */}
          <div className="relative w-full bg-[#0d0d10] border border-white/10 rounded-xl p-2 overflow-hidden flex flex-col justify-between space-y-2">
            {/* Dynamic Viewport Rectangle (Aqua/Green Frame) */}
            <div
              className="absolute border-2 border-emerald-400 bg-emerald-400/10 rounded transition-all duration-75 z-20 pointer-events-none"
              style={{
                top: `${viewportRect.top}%`,
                left: `${viewportRect.left}%`,
                width: `${Math.max(18, viewportRect.width)}%`,
                height: `${Math.max(22, viewportRect.height)}%`,
              }}
            />

            {/* Seat Dot Grid Rendered per Section & Row */}
            <div className="space-y-1.5 max-h-36 overflow-hidden flex flex-col items-center">
              {sections.map((section) => (
                <div key={section.id} className="w-full space-y-0.5 flex flex-col items-center">
                  {section.rows.map((rowGroup) => (
                    <div key={rowGroup.row} className="flex items-center justify-center gap-1 w-full scale-95">
                      {/* Left Seats Block */}
                      {rowGroup.leftSeats && rowGroup.leftSeats.length > 0 && (
                        <div className="flex gap-0.5">
                          {rowGroup.leftSeats.map((st) => {
                            const seatCode = `${rowGroup.row}${st.number.toString().padStart(2, '0')}`;
                            const isBooked = realtimeBooked.has(seatCode) || realtimeHeld.has(seatCode) || st.status === 'booked';
                            const isSelected = selectedSet.has(seatCode);

                            return (
                              <div
                                key={seatCode}
                                className={`w-1 h-1 rounded-xs transition-colors ${
                                  isSelected
                                    ? 'bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.8)]'
                                    : isBooked
                                    ? 'bg-gray-800 opacity-40'
                                    : 'bg-slate-400/70'
                                }`}
                              />
                            );
                          })}
                        </div>
                      )}

                      {/* Center Seats Block */}
                      {rowGroup.centerSeats && rowGroup.centerSeats.length > 0 && (
                        <div className="flex gap-0.5 ml-1">
                          {rowGroup.centerSeats.map((st) => {
                            const seatCode = `${rowGroup.row}${st.number.toString().padStart(2, '0')}`;
                            const isBooked = realtimeBooked.has(seatCode) || realtimeHeld.has(seatCode) || st.status === 'booked';
                            const isSelected = selectedSet.has(seatCode);

                            return (
                              <div
                                key={seatCode}
                                className={`w-1 h-1 rounded-xs transition-colors ${
                                  isSelected
                                    ? 'bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.8)]'
                                    : isBooked
                                    ? 'bg-gray-800 opacity-40'
                                    : 'bg-slate-400/70'
                                }`}
                              />
                            );
                          })}
                        </div>
                      )}

                      {/* Right Seats Block */}
                      {rowGroup.rightSeats && rowGroup.rightSeats.length > 0 && (
                        <div className="flex gap-0.5 ml-1">
                          {rowGroup.rightSeats.map((st) => {
                            const seatCode = `${rowGroup.row}${st.number.toString().padStart(2, '0')}`;
                            const isBooked = realtimeBooked.has(seatCode) || realtimeHeld.has(seatCode) || st.status === 'booked';
                            const isSelected = selectedSet.has(seatCode);

                            return (
                              <div
                                key={seatCode}
                                className={`w-1 h-1 rounded-xs transition-colors ${
                                  isSelected
                                    ? 'bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.8)]'
                                    : isBooked
                                    ? 'bg-gray-800 opacity-40'
                                    : 'bg-slate-400/70'
                                }`}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Curved Screen Line Bottom */}
            <div className="w-full pt-1 flex flex-col items-center">
              <div className="w-3/4 h-1 rounded-t-full bg-primary/40 border-t border-primary text-[6px] text-center font-bold text-primary">
                SCREEN
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
