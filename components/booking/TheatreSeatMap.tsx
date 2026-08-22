"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TicketXSeatLayout, SeatSection } from '@/types/seatLayouts';
import { Seat, SeatStatus } from '@/types/seat';
import { SeatItem } from './SeatItem';
import { SeatLegend } from './SeatLegend';
import { CinemaScreen } from './CinemaScreen';
import { TheatreHallMiniMap } from './TheatreHallMiniMap';
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

  // Requirement 9: Category Standardization Rule
  const isNRT = layout.locationId === 'nrt';

  const normalizedSections: SeatSection[] = layout.sections.map((sec) => {
    const key = sec.categoryKey;
    const catLower = (sec.name || '').toLowerCase();

    if (isNRT) {
      // NRT Theatres: Silver ₹150, Gold ₹295, On Land Luxury preserved
      if (catLower.includes('luxury') || catLower.includes('land') || key === 'onLand') {
        return { ...sec, name: 'On Land Luxury Recliner' };
      }
      if (catLower.includes('gold') || key === 'gold') {
        return { ...sec, name: 'Gold Class', price: 295 };
      }
      return { ...sec, name: 'Silver Class', price: 150 };
    } else {
      // Other Cities: ONLY 2 Categories (Silver ₹150 / Gold ₹295)
      if (catLower.includes('gold') || key === 'gold' || catLower.includes('luxury') || catLower.includes('land') || key === 'onLand') {
        return { ...sec, name: 'Gold Class', price: 295, categoryKey: 'gold' };
      }
      return { ...sec, name: 'Silver Class', price: 150, categoryKey: 'silver' };
    }
  });

  const hasLuxury = isNRT && normalizedSections.some((s) => s.name.toLowerCase().includes('land') || s.name.toLowerCase().includes('luxury'));
  const silverSec = normalizedSections.find((s) => s.name.toLowerCase().includes('silver'));
  const goldSec = normalizedSections.find((s) => s.name.toLowerCase().includes('gold'));
  const luxurySec = normalizedSections.find((s) => s.name.toLowerCase().includes('luxury') || s.name.toLowerCase().includes('land'));

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

  const totalOccupied = realtimeBooked.size + realtimeHeld.size;
  const availableCount = Math.max(0, totalCapacity - totalOccupied - selectedSeats.length);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none">
      {/* Whole Hall Mini-Map Overview (Requirement 7 - Reference Image 2 Style) */}
      <TheatreHallMiniMap
        theatreName={layout.theatreName}
        hasLuxury={hasLuxury}
        silverPrice={silverSec?.price || 150}
        goldPrice={goldSec?.price || 295}
        luxuryPrice={luxurySec?.price || 777}
      />

      {/* Layout Header Info & Capacity Display */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white text-lg md:text-xl font-heading">{layout.theatreName}</span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-[11px]">
            {isNRT ? 'Silver • Gold • Luxury' : 'Silver ₹150 • Gold ₹295'}
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
      <SeatLegend sections={normalizedSections} />

      {/* AUDITORIUM THEATRE ENTRANCE (Requirement 8) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono shadow-md">
          <DoorOpen className="w-4 h-4 text-amber-400" />
          <span>THEATRE ENTRANCE / ENTRY →</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary/40 text-muted-foreground border border-white/5 text-xs font-bold font-mono">
          <span>← EXIT</span>
        </div>
      </div>

      {/* SEATING MAP RENDERER */}
      <div className="w-full space-y-10 overflow-x-auto hide-scrollbar py-4">
        {normalizedSections.map((section, secIdx) => {
          const isLuxury = section.name.toLowerCase().includes('luxury') || section.name.toLowerCase().includes('land');
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: secIdx * 0.1 }}
              className="space-y-3 min-w-[650px] flex flex-col items-center"
            >
              {/* Category Section Header */}
              <div className="w-full flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span
                    className={`text-xs font-black uppercase tracking-widest px-5 py-1 rounded-full border flex items-center gap-2 shadow-lg ${
                      isLuxury
                        ? 'bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-rose-950/80 text-rose-300 border-rose-500/50'
                        : section.name.toLowerCase().includes('gold')
                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900/80 text-slate-200 border-slate-400/40'
                    }`}
                  >
                    <span>{section.name}</span>
                    <span className="font-mono font-black text-white bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                      ₹{section.price}
                    </span>
                  </span>
                </div>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Rows in Section */}
              <div className="space-y-2.5 w-full flex flex-col items-center">
                {section.rows.map((rowGroup) => (
                  <div key={rowGroup.row} className="flex items-center gap-2 md:gap-4 justify-center w-full">
                    {/* Left Row Identifier */}
                    <div className="w-5 text-center font-bold text-muted-foreground text-xs select-none font-mono">
                      {rowGroup.row}
                    </div>

                    {/* Left Block */}
                    {rowGroup.leftSeats && rowGroup.leftSeats.length > 0 && (
                      <div className="flex gap-1 sm:gap-1.5">
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
                      <div className="w-5 sm:w-8 text-[8px] text-center text-muted-foreground/30 font-mono select-none">
                        AISLE
                      </div>
                    )}

                    {/* Center Block */}
                    {rowGroup.centerSeats && rowGroup.centerSeats.length > 0 && (
                      <div className="flex gap-1 sm:gap-1.5">
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
                      <div className="w-5 sm:w-8 text-[8px] text-center text-muted-foreground/30 font-mono select-none">
                        AISLE
                      </div>
                    )}

                    {/* Right Block */}
                    {rowGroup.rightSeats && rowGroup.rightSeats.length > 0 && (
                      <div className="flex gap-1 sm:gap-1.5">
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
                    <div className="w-5 text-center font-bold text-muted-foreground text-xs select-none font-mono">
                      {rowGroup.row}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SCREEN AT THE ABSOLUTE BOTTOM */}
      <CinemaScreen />
    </div>
  );
}
