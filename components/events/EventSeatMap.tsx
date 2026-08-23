"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EventLayout } from '@/lib/eventSeatLayouts';
import { Seat, SeatStatus } from '@/types/seat';
import { SeatItem } from '@/components/booking/SeatItem';
import { SeatLegend } from '@/components/booking/SeatLegend';
import { Sparkles, Mic, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface EventSeatMapProps {
  layout: EventLayout;
  eventId: string;
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  onRestoreUserHold?: (holdInfo: { seatCodes: string[]; holdId: string; expiresAt: number; isAbandoned: boolean }) => void;
}

export function EventSeatMap({ layout, eventId, selectedSeats, onSeatSelect, onRestoreUserHold }: EventSeatMapProps) {
  const { user } = useAuth();
  const [realtimeBooked, setRealtimeBooked] = useState<Set<string>>(new Set());
  const [realtimeHeld, setRealtimeHeld] = useState<Set<string>>(new Set());

  // Real-time polling sync for event seat availability
  useEffect(() => {
    if (!eventId) return;

    const fetchSeatStatus = async () => {
      try {
        const userIdParam = user?.id ? `&userId=${encodeURIComponent(user.id)}` : '';
        const res = await fetch(`/api/seats/status?showId=${encodeURIComponent(eventId)}${userIdParam}`);
        if (res.ok) {
          const data = await res.json();
          setRealtimeBooked(new Set(data.booked || []));
          setRealtimeHeld(new Set(data.held || []));

          if (data.myHeld && onRestoreUserHold) {
            onRestoreUserHold(data.myHeld);
          }
        }
      } catch (err) {
        console.error('Failed to sync real-time event seat status:', err);
      }
    };

    fetchSeatStatus();
    const interval = setInterval(fetchSeatStatus, 2000);

    const onFocus = () => fetchSeatStatus();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [eventId, user?.id, onRestoreUserHold]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center select-none">
      {/* Layout Header Info & Capacity Counter */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white text-lg md:text-xl font-heading">{layout.eventName}</span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-[11px] flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5" /> Event Seating Map
          </span>
        </div>

      </div>

      {/* EVENT SEAT MAP LEGEND */}
      <SeatLegend isEvent={true} />

      {/* TOP INDICATOR */}
      <div className="w-full text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">
        ▲ BACK OF EVENT HALL (SILVER SECTION) ▲
      </div>

      {/* EVENT SEATING SECTIONS (ORDER: SILVER -> GOLD (BALCONY) -> PREMIUM -> STAGE) */}
      <div className="w-full space-y-12 overflow-x-auto hide-scrollbar py-4">
        {layout.sections.map((section, secIdx) => {
          const isPremium = section.categoryKey === 'premium';
          const isGold = section.categoryKey === 'gold';
          const categoryDisplayName = isGold ? 'Gold (Balcony)' : isPremium ? 'Premium' : 'Silver';

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: secIdx * 0.1 }}
              className="space-y-4 min-w-[760px] flex flex-col items-center"
            >
              {/* Category Section Header */}
              <div className="w-full flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span
                    className={`text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full border flex items-center gap-2 shadow-xl ${
                      isPremium
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-rose-950/50'
                        : isGold
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                        : 'bg-slate-900/80 text-slate-200 border-slate-400/50'
                    }`}
                  >
                    {isPremium && <Crown className="w-4 h-4 text-amber-400" />}
                    <span>{categoryDisplayName}</span>
                    <span className="font-mono font-black text-white bg-black/50 px-2.5 py-0.5 rounded-md border border-white/15">
                      ₹{section.price.toLocaleString()}
                    </span>
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1.5 tracking-wider uppercase font-semibold">
                    {section.totalSeats} Seats • {section.description}
                  </span>
                </div>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Rows in Section */}
              <div className="space-y-3.5 w-full flex flex-col items-center">
                {section.rows.map((rowGroup) => (
                  <div key={rowGroup.rowLabel} className="flex items-center gap-3 md:gap-5 justify-center w-full">
                    {/* Left Row Label */}
                    <div className="w-7 text-center font-bold text-muted-foreground text-xs select-none font-mono">
                      {rowGroup.rowLabel}
                    </div>

                    {/* Left Block */}
                    {rowGroup.leftSeats && rowGroup.leftSeats.length > 0 && (
                      <div className="flex gap-1.5 sm:gap-2">
                        {rowGroup.leftSeats.map((st) => {
                          let currentStatus: SeatStatus = 'available';
                          if (realtimeBooked.has(st.seatCode) || realtimeHeld.has(st.seatCode)) {
                            currentStatus = 'booked';
                          }

                          const seatObj: Seat = {
                            id: st.seatCode,
                            row: rowGroup.rowLabel,
                            number: st.number,
                            category: categoryDisplayName,
                            price: section.price,
                            status: currentStatus,
                          };

                          return (
                            <SeatItem
                              key={seatObj.id}
                              seat={seatObj}
                              isSelected={selectedSeats.some((s) => s.id === seatObj.id)}
                              onSelect={onSeatSelect}
                              isEvent={true}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Aisle Gap */}
                    <div className="w-5 sm:w-8 text-[9px] text-center text-muted-foreground/30 font-mono select-none">
                      AISLE
                    </div>

                    {/* Center Block */}
                    {rowGroup.centerSeats && rowGroup.centerSeats.length > 0 && (
                      <div className="flex gap-1.5 sm:gap-2">
                        {rowGroup.centerSeats.map((st) => {
                          let currentStatus: SeatStatus = 'available';
                          if (realtimeBooked.has(st.seatCode) || realtimeHeld.has(st.seatCode)) {
                            currentStatus = 'booked';
                          }

                          const seatObj: Seat = {
                            id: st.seatCode,
                            row: rowGroup.rowLabel,
                            number: st.number,
                            category: categoryDisplayName,
                            price: section.price,
                            status: currentStatus,
                          };

                          return (
                            <SeatItem
                              key={seatObj.id}
                              seat={seatObj}
                              isSelected={selectedSeats.some((s) => s.id === seatObj.id)}
                              onSelect={onSeatSelect}
                              isEvent={true}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Aisle Gap */}
                    <div className="w-5 sm:w-8 text-[9px] text-center text-muted-foreground/30 font-mono select-none">
                      AISLE
                    </div>

                    {/* Right Block */}
                    {rowGroup.rightSeats && rowGroup.rightSeats.length > 0 && (
                      <div className="flex gap-1.5 sm:gap-2">
                        {rowGroup.rightSeats.map((st) => {
                          let currentStatus: SeatStatus = 'available';
                          if (realtimeBooked.has(st.seatCode) || realtimeHeld.has(st.seatCode)) {
                            currentStatus = 'booked';
                          }

                          const seatObj: Seat = {
                            id: st.seatCode,
                            row: rowGroup.rowLabel,
                            number: st.number,
                            category: categoryDisplayName,
                            price: section.price,
                            status: currentStatus,
                          };

                          return (
                            <SeatItem
                              key={seatObj.id}
                              seat={seatObj}
                              isSelected={selectedSeats.some((s) => s.id === seatObj.id)}
                              onSelect={onSeatSelect}
                              isEvent={true}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Right Row Label */}
                    <div className="w-7 text-center font-bold text-muted-foreground text-xs select-none font-mono">
                      {rowGroup.rowLabel}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* STAGE AT THE ABSOLUTE BOTTOM / FRONT OF THE EVENT HALL (Requirement 5, 34) */}
      <div className="w-full max-w-4xl mx-auto mt-10 relative flex flex-col items-center">
        <div className="w-full h-16 bg-gradient-to-t from-primary/40 via-primary/20 to-transparent rounded-b-3xl border-b-4 border-primary shadow-[0_10px_30px_rgba(216,33,50,0.5)] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent opacity-70" />
          <div className="relative z-10 flex items-center gap-3 px-8 py-2 rounded-full bg-black/70 border border-primary/50 shadow-2xl">
            <Mic className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm md:text-base font-black uppercase tracking-[0.3em] text-white font-heading">
              ★ MAIN EVENT STAGE ★
            </span>
            <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
          </div>
        </div>

        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-3 flex items-center gap-1">
          <span>▲</span> PREMIUM SEATS ARE LOCATED DIRECTLY IN FRONT OF THE STAGE <span>▲</span>
        </p>
      </div>
    </div>
  );
}
