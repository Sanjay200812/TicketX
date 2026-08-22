"use client";

import { QRCodeSVG } from 'qrcode.react';

interface EventPassCardProps {
  booking: {
    id: string;
    eventTitle: string;
    venue: string;
    city: string;
    date: string;
    time: string;
    ticketType: string;
    quantity: number;
    total: number;
  };
}

export function EventPassCard({ booking }: EventPassCardProps) {
  const qrValue = JSON.stringify({
    id: booking.id,
    event: booking.eventTitle,
    ticket: booking.ticketType,
    qty: booking.quantity,
    type: 'DEMO_EVENT_PASS',
  });

  return (
    <div className="bg-[#151515] rounded-2xl overflow-hidden border border-white/10 w-full max-w-sm mx-auto shadow-2xl relative">
      <div className="bg-primary/10 border-b border-primary/20 p-4 text-center flex items-center justify-between px-6">
        <p className="text-primary font-bold tracking-widest text-xs uppercase font-heading">
          TICKETX EVENT PASS
        </p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          DEMO PASS
        </span>
      </div>

      <div className="p-6 md:p-8 space-y-6 relative">
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-r border-white/10" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-l border-white/10" />

        <div>
          <h2 className="text-2xl font-bold font-heading mb-1 text-white">{booking.eventTitle}</h2>
          <p className="text-muted-foreground text-xs">{booking.venue}, {booking.city}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-white/10 text-xs">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Date</p>
            <p className="font-semibold text-white">
              {new Date(booking.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Time</p>
            <p className="font-semibold text-white">{booking.time}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Pass Type</p>
            <p className="font-semibold text-white">{booking.ticketType} (x{booking.quantity})</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Total</p>
            <p className="font-semibold text-white">₹{booking.total}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-dashed border-white/10 flex flex-col items-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Pass ID: <span className="font-mono text-white">{booking.id}</span>
          </p>
          <div className="bg-white p-3 rounded-xl mb-2 shadow-inner">
            <QRCodeSVG value={qrValue} size={140} level="M" />
          </div>
          <p className="text-[10px] text-yellow-400 font-semibold tracking-wider uppercase mt-1">
            Prototype Pass — Demo Only
          </p>
        </div>
      </div>
    </div>
  );
}
