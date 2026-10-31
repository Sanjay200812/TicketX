"use client";

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TicketXSeatLayout, TicketXSeatSection } from '@/types/seatLayouts';
import { Seat, SeatStatus } from '@/types/seat';
import { SeatItem } from './SeatItem';
import { SeatLegend } from './SeatLegend';
import { CinemaScreen } from './CinemaScreen';
import { TemporaryMinimap } from './TemporaryMinimap';
import { useAuth } from '@/context/AuthContext';

interface TheatreSeatMapProps {
  layout: TicketXSeatLayout;
  showId?: string;
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  onRestoreUserHold?: (holdInfo: { seatCodes: string[]; holdId: string; expiresAt: number; isAbandoned: boolean }) => void;
}

export function TheatreSeatMap({ layout, showId, selectedSeats, onSeatSelect, onRestoreUserHold }: TheatreSeatMapProps) {
  const { user } = useAuth();
  const [zoom, setZoom] = useState(1);
  const [preview, setPreview] = useState(false);
  const [realtimeBooked, setRealtimeBooked] = useState<Set<string>>(new Set());
  const [realtimeHeld, setRealtimeHeld] = useState<Set<string>>(new Set());

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Preserve actual seating-class names and prices supplied in layout definition (Requirements 1, 2, 3)
  const sections: TicketXSeatSection[] = layout.sections;

  // Real-time polling sync for seat availability
  useEffect(() => {
    if (!showId) return;

    const fetchSeatStatus = async () => {
      try {
        const uid = user?.uid || user?.id;
        const userIdParam = uid ? `&userId=${encodeURIComponent(uid)}` : '';
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
  }, [showId, user?.uid, user?.id, onRestoreUserHold]);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none relative">
      {/* Floating Navigation Minimap */}
      <TemporaryMinimap
        containerRef={scrollContainerRef}
        sections={sections}
        realtimeBooked={realtimeBooked}
        realtimeHeld={realtimeHeld}
        selectedSeats={selectedSeats}
      />

      {/* Layout Header Info & Capacity Display */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-white text-lg md:text-xl font-heading">{layout.theatreName || 'Cinema Hall'}</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {sections.map((sec) => (
              <span
                key={sec.id}
                className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-[11px]"
              >
                {sec.name} {sec.price !== null ? `₹${sec.price}` : 'Price TBA'}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Legend */}
      <SeatLegend sections={sections} />

      <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
        <button type="button" className="px-4 py-2 border border-white/20 rounded-lg text-xs" onClick={() => setZoom(z => Math.max(.6, z - .1))} aria-label="Zoom out">−</button>
        <span className="text-xs" aria-live="polite">{Math.round(zoom * 100)}%</span>
        <button type="button" className="px-4 py-2 border border-white/20 rounded-lg text-xs" onClick={() => setZoom(z => Math.min(1.8, z + .1))} aria-label="Zoom in">+</button>
        <button type="button" className="px-4 py-2 border border-white/20 rounded-lg text-xs" onClick={() => {setZoom(1);setPreview(false)}}>Reset view</button>
        <button type="button" aria-pressed={preview} className="px-4 py-2 border border-white/20 rounded-lg text-xs" onClick={() => setPreview(p => !p)}>{preview ? 'Return to 2D seat selection' : 'View Theatre in 3D'}</button>
      </div>
      {preview && <p className="text-xs text-muted-foreground mb-4">Perspective preview of this same layout. Return to 2D to select seats.</p>}
      {/* Scrollable viewport keeps oversized layouts inside the page. */}
      <div
        ref={scrollContainerRef}
        className="w-full space-y-10 overflow-x-auto hide-scrollbar py-4 border border-white/5 rounded-2xl p-4 bg-black/40"
      >
        <div style={{zoom, transform: preview ? 'perspective(1000px) rotateX(35deg)' : undefined, transformOrigin:'center bottom', pointerEvents:preview?'none':undefined}}>
        {sections.map((section, secIdx) => {
          const secPrice = section.price !== null ? `₹${section.price}` : 'Price TBA';

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
                  <span className="text-xs font-black uppercase tracking-widest px-5 py-1 rounded-full border flex items-center gap-2 shadow-lg bg-secondary/80 text-white border-white/20">
                    <span>{section.name}</span>
                    <span className="font-mono font-black text-white bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                      {secPrice}
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

                    {/* Seat Groups / Aisles */}
                    {rowGroup.groups && rowGroup.groups.length > 0 ? (
                      <div className="flex items-center gap-4">
                        {rowGroup.groups.map((group, grpIdx) => (
                          <div key={grpIdx} className="flex items-center gap-1 sm:gap-1.5">
                            {group.seats.map((st) => {
                              const seatCode = st.id || `${rowGroup.row}${(st.number || 0).toString().padStart(2, '0')}`;
                              let currentStatus: SeatStatus = st.status;
                              if (realtimeHeld.has(seatCode)) currentStatus = 'held';
                              if (realtimeBooked.has(seatCode)) {
                                currentStatus = 'booked';
                              }

                              const seatObj: Seat = {
                                id: seatCode,
                                row: rowGroup.row,
                                number: st.number || 0,
                                category: section.name,
                                price: section.price || 0,
                                status: currentStatus,
                              };

                              return (
                                <SeatItem
                                  key={seatObj.id}
                                  seat={seatObj}
                                  isSelected={selectedSeats.some((s) => s.id === seatObj.id)}
                                  onSelect={preview ? () => {} : onSeatSelect}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Fallback legacy left/center/right seats */
                      <div className="flex gap-2">
                        {rowGroup.leftSeats && (
                          <div className="flex gap-1">
                            {rowGroup.leftSeats.map((st) => {
                              const seatCode = `${rowGroup.row}${st.number.toString().padStart(2, '0')}`;
                              let currentStatus: SeatStatus = st.status;
                              if (realtimeHeld.has(seatCode)) currentStatus = 'held';
                              if (realtimeBooked.has(seatCode)) currentStatus = 'booked';
                              const seatObj: Seat = { id: seatCode, row: rowGroup.row, number: st.number, category: section.name, price: section.price || 0, status: currentStatus };
                              return <SeatItem key={seatObj.id} seat={seatObj} isSelected={selectedSeats.some((s) => s.id === seatObj.id)} onSelect={preview ? () => {} : onSeatSelect} />;
                            })}
                          </div>
                        )}
                        {rowGroup.centerSeats && (
                          <div className="flex gap-1 ml-4">
                            {rowGroup.centerSeats.map((st) => {
                              const seatCode = `${rowGroup.row}${st.number.toString().padStart(2, '0')}`;
                              let currentStatus: SeatStatus = st.status;
                              if (realtimeHeld.has(seatCode)) currentStatus = 'held';
                              if (realtimeBooked.has(seatCode)) currentStatus = 'booked';
                              const seatObj: Seat = { id: seatCode, row: rowGroup.row, number: st.number, category: section.name, price: section.price || 0, status: currentStatus };
                              return <SeatItem key={seatObj.id} seat={seatObj} isSelected={selectedSeats.some((s) => s.id === seatObj.id)} onSelect={preview ? () => {} : onSeatSelect} />;
                            })}
                          </div>
                        )}
                        {rowGroup.rightSeats && (
                          <div className="flex gap-1 ml-4">
                            {rowGroup.rightSeats.map((st) => {
                              const seatCode = `${rowGroup.row}${st.number.toString().padStart(2, '0')}`;
                              let currentStatus: SeatStatus = st.status;
                              if (realtimeHeld.has(seatCode)) currentStatus = 'held';
                              if (realtimeBooked.has(seatCode)) currentStatus = 'booked';
                              const seatObj: Seat = { id: seatCode, row: rowGroup.row, number: st.number, category: section.name, price: section.price || 0, status: currentStatus };
                              return <SeatItem key={seatObj.id} seat={seatObj} isSelected={selectedSeats.some((s) => s.id === seatObj.id)} onSelect={preview ? () => {} : onSeatSelect} />;
                            })}
                          </div>
                        )}
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
      </div>

      {/* SCREEN AT THE ABSOLUTE BOTTOM (Requirements 4) */}
      <CinemaScreen />
    </div>
  );
}



