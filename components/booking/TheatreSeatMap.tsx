"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TicketXSeatLayout } from '@/types/seatLayouts';
import { Seat, SeatStatus } from '@/types/seat';
import { SeatItem } from './SeatItem';
import { SeatLegend } from './SeatLegend';
import { CinemaScreen } from './CinemaScreen';
import { calculateUsableCapacity } from '@/lib/validateData';
import { useAuth } from '@/context/AuthContext';
import { DoorOpen } from 'lucide-react';

interface TheatreSeatMapProps {
  layout: TicketXSeatLayout;
  showId?: string;
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  onRestoreUserHold?: (holdInfo: { seatCodes: string[]; holdId: string; expiresAt: number; isAbandoned: boolean }) => void;
}

export function TheatreSeatMap({ layout, showId, selectedSeats, onSeatSelect, onRestoreUserHold }: TheatreSeatMapProps) {
  const { user } = useAuth();
  const totalCapacity = layout.verifiedCapacity || calculateUsableCapacity(layout);
  const [realtimeBooked, setRealtimeBooked] = useState<Set<string>>(new Set());
  const [realtimeHeld, setRealtimeHeld] = useState<Set<string>>(new Set());

  // Real-time polling sync for seat availability
  useEffect(() => {
    if (!showId) return;

    const fetchSeatStatus = async () => {
      try {
        const userIdParam = user?.id ? `&userId=${encodeURIComponent(user.id)}` : '';
        const res = await fetch(`/api/seats/status?showId=${encodeURIComponent(showId)}${userIdParam}`);
        if (res.ok) {
          const data = await res.json();
          setRealtimeBooked(new Set(data.booked || []));
          setRealtimeHeld(new Set(data.held || []));

          if (data.myHeld && onRestoreUserHold) {
            onRestoreUserHold(data.myHeld);
          }
        }
      } catch (err) {
        console.error('Failed to sync real-time seat status:', err);
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
  }, [showId, user?.id, onRestoreUserHold]);

  // Calculate total booked seats across layout + real-time
  const totalOccupied = realtimeBooked.size + realtimeHeld.size;
  const availableCount = Math.max(0, totalCapacity - totalOccupied - selectedSeats.length);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none">
      {/* Layout Header Info & Capacity Display */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white text-lg md:text-xl font-heading">{layout.theatreName}</span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-[11px]">
            {layout.layoutFamily} Layout
          </span>
        </div>

        {/* Real-time Capacity Counter */}
        <div className="flex items-center gap-4 bg-secondary/40 px-4 py-2 rounded-xl border border-white/10 text-xs font-mono">
          <div>
            <span className="text-muted-foreground">Capacity: </span>
            <span className="text-white font-bold">{totalCapacity}</span>
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div>
            <span className="text-muted-foreground">Available: </span>
            <span className="text-emerald-400 font-bold">{availableCount}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <SeatLegend sections={layout.sections} />

      {/* AUDITORIUM ENTRY INDICATOR (Requirement 4, 50) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
          <DoorOpen className="w-4 h-4 text-emerald-400" />
          <span>ENTRY →</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary/40 text-muted-foreground border border-white/5 text-xs font-bold font-mono">
          <span>← EXIT</span>
        </div>
      </div>

      {/* MANDATORY VERTICAL ORDER: PREMIUM (TOP) -> GOLD (MIDDLE) -> ON LAND (BOTTOM) */}
      <div className="w-full space-y-12 overflow-x-auto hide-scrollbar py-4">
        {layout.sections.map((section, secIdx) => {
          const isLuxury = section.categoryKey === 'onLand';
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: secIdx * 0.1 }}
              className="space-y-4 min-w-[700px] flex flex-col items-center"
            >
              {/* Category Section Header */}
              <div className="w-full flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span
                    className={`text-xs font-black uppercase tracking-widest px-5 py-1.5 rounded-full border flex items-center gap-2 shadow-lg ${
                      isLuxury
                        ? 'bg-gradient-to-r from-amber-950/80 via-amber-900/40 to-amber-950/80 text-amber-300 border-amber-500/50 shadow-amber-950/40'
                        : section.categoryKey === 'gold'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900/80 text-slate-200 border-slate-400/40'
                    }`}
                  >
                    <span>{section.name}</span>
                    <span className="font-mono font-black text-white bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                      ₹{section.price}
                    </span>
                  </span>
                  {section.description && (
                    <span className="text-[10px] text-muted-foreground mt-1 tracking-wider uppercase font-semibold">
                      {section.description}
                    </span>
                  )}
                </div>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Rows in Section */}
              <div className="space-y-4 w-full flex flex-col items-center">
                {section.rows.map((rowGroup) => (
                  <div key={rowGroup.row} className="flex items-center gap-3 md:gap-6 justify-center w-full">
                    {/* Left Row Identifier */}
                    <div className="w-6 text-center font-bold text-muted-foreground text-xs select-none">
                      {rowGroup.row}
                    </div>

                    {/* Left Block */}
                    {rowGroup.leftSeats && rowGroup.leftSeats.length > 0 && (
                      <div className="flex gap-1.5 sm:gap-2">
                        {rowGroup.leftSeats.map((st) => {
                          const seatCode = `${rowGroup.row}${st.number.toString().padStart(2, '0')}`;
                          let currentStatus: SeatStatus = st.status;
                          if (realtimeBooked.has(seatCode) || realtimeHeld.has(seatCode)) {
                            currentStatus = 'booked';
                          }

                          const seatObj: Seat = {
                            id: seatCode,
                            row: rowGroup.row,
                            number: st.number,
                            category: section.name,
                            price: section.price,
                            status: currentStatus,
                          };

                          return (
                            <SeatItem
                              key={seatObj.id}
                              seat={seatObj}
                              isSelected={selectedSeats.some((s) => s.id === seatObj.id)}
                              onSelect={onSeatSelect}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Aisle Break */}
                    {rowGroup.leftSeats && rowGroup.centerSeats && (
                      <div className="w-6 sm:w-10 text-[9px] text-center text-muted-foreground/30 font-mono select-none">
                        AISLE
                      </div>
                    )}

                    {/* Center Block */}
                    {rowGroup.centerSeats && rowGroup.centerSeats.length > 0 && (
                      <div className="flex gap-1.5 sm:gap-2.5">
                        {rowGroup.centerSeats.map((st) => {
                          const seatCode = `${rowGroup.row}${st.number.toString().padStart(2, '0')}`;
                          let currentStatus: SeatStatus = st.status;
                          if (realtimeBooked.has(seatCode) || realtimeHeld.has(seatCode)) {
                            currentStatus = 'booked';
                          }

                          const seatObj: Seat = {
                            id: seatCode,
                            row: rowGroup.row,
                            number: st.number,
                            category: section.name,
                            price: section.price,
                            status: currentStatus,
                          };

                          return (
                            <SeatItem
                              key={seatObj.id}
                              seat={seatObj}
                              isSelected={selectedSeats.some((s) => s.id === seatObj.id)}
                              onSelect={onSeatSelect}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Aisle Break */}
                    {((rowGroup.centerSeats && rowGroup.rightSeats) || (rowGroup.leftSeats && rowGroup.rightSeats && !rowGroup.centerSeats)) && (
                      <div className="w-6 sm:w-10 text-[9px] text-center text-muted-foreground/30 font-mono select-none">
                        AISLE
                      </div>
                    )}

                    {/* Right Block */}
                    {rowGroup.rightSeats && rowGroup.rightSeats.length > 0 && (
                      <div className="flex gap-1.5 sm:gap-2">
                        {rowGroup.rightSeats.map((st) => {
                          const seatCode = `${rowGroup.row}${st.number.toString().padStart(2, '0')}`;
                          let currentStatus: SeatStatus = st.status;
                          if (realtimeBooked.has(seatCode) || realtimeHeld.has(seatCode)) {
                            currentStatus = 'booked';
                          }

                          const seatObj: Seat = {
                            id: seatCode,
                            row: rowGroup.row,
                            number: st.number,
                            category: section.name,
                            price: section.price,
                            status: currentStatus,
                          };

                          return (
                            <SeatItem
                              key={seatObj.id}
                              seat={seatObj}
                              isSelected={selectedSeats.some((s) => s.id === seatObj.id)}
                              onSelect={onSeatSelect}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Right Row Identifier */}
                    <div className="w-6 text-center font-bold text-muted-foreground text-xs select-none">
                      {rowGroup.row}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SCREEN AT THE ABSOLUTE BOTTOM (Requirement 3) */}
      <CinemaScreen />
    </div>
  );
}
