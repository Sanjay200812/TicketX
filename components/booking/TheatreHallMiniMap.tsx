"use client";

import React from 'react';
import { ArrowDown } from 'lucide-react';

interface TheatreHallMiniMapProps {
  theatreName: string;
  hasLuxury?: boolean;
  silverPrice?: number;
  goldPrice?: number;
  luxuryPrice?: number;
}

export function TheatreHallMiniMap({
  theatreName,
  hasLuxury = false,
  silverPrice = 150,
  goldPrice = 295,
  luxuryPrice = 777,
}: TheatreHallMiniMapProps) {
  return (
    <div className="w-full bg-[#121215]/80 border border-white/10 rounded-2xl p-4 md:p-5 mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2 font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Whole Hall Overview &amp; Seat Categories</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">{theatreName}</span>
      </div>

      {/* Hall Schematic Diagram */}
      <div className="relative max-w-xl mx-auto bg-black/60 border border-white/10 rounded-xl p-4 flex flex-col items-center space-y-3 font-mono text-[10px]">
        {/* Entrance Marker Label Top Right */}
        <div className="absolute top-2 right-3 text-[9px] font-bold text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded bg-amber-500/10">
          ENTRY / HALL ENTRANCE →
        </div>

        {/* Silver Seating Block (Top / Balcony Tier) */}
        <div className="w-full bg-slate-800/40 border border-slate-600/40 rounded-lg p-2.5 text-center flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center justify-between w-full text-slate-300 font-bold px-2">
            <span>SILVER CLASS</span>
            <span className="text-emerald-400">₹{silverPrice}</span>
          </div>
          <div className="w-full h-3 bg-slate-700/30 rounded border border-slate-600/20 flex items-center justify-center text-[8px] text-slate-400">
            Back Hall Seating Rows (Rows A - F)
          </div>
        </div>

        {/* Central Aisle Space */}
        <div className="w-full flex items-center justify-between text-[8px] text-gray-500 px-4">
          <span>← Left Aisle</span>
          <span className="tracking-widest uppercase font-sans text-gray-400">Main Walking Passageway</span>
          <span>Right Aisle →</span>
        </div>

        {/* Gold Seating Block (Middle Tier) */}
        <div className="w-full bg-amber-950/20 border border-amber-500/30 rounded-lg p-2.5 text-center flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center justify-between w-full text-amber-300 font-bold px-2">
            <span>GOLD CLASS</span>
            <span className="text-emerald-400">₹{goldPrice}</span>
          </div>
          <div className="w-full h-3 bg-amber-500/10 rounded border border-amber-500/20 flex items-center justify-center text-[8px] text-amber-200">
            Prime Central Viewing Block (Rows G - N)
          </div>
        </div>

        {/* On Land Luxury Block (Only for NRT / Luxury venues) */}
        {hasLuxury && (
          <div className="w-full bg-rose-950/30 border border-rose-500/40 rounded-lg p-2.5 text-center flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center justify-between w-full text-rose-300 font-bold px-2">
              <span>ON LAND LUXURY RECLINER</span>
              <span className="text-rose-400">₹{luxuryPrice}</span>
            </div>
            <div className="w-full h-3 bg-rose-500/20 rounded border border-rose-500/30 flex items-center justify-center text-[8px] text-rose-200">
              VIP Motorized Recliners (Rows O - P)
            </div>
          </div>
        )}

        {/* Screen Direction Indicator */}
        <div className="w-full pt-1 flex flex-col items-center">
          <div className="flex items-center gap-1 text-[9px] font-bold text-primary tracking-widest uppercase mb-1">
            <ArrowDown className="w-3 h-3 animate-bounce text-primary" /> ALL EYES ON CURVED CINEMA SCREEN BELOW
          </div>
          <div className="w-3/4 h-2 rounded-t-full bg-primary/30 border-t-2 border-primary" />
        </div>
      </div>
    </div>
  );
}
