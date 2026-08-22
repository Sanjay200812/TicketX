"use client";

import { Booking } from '@/types/booking';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/context/AuthContext';

interface TicketCardProps {
  booking: Booking;
}

export function TicketCard({ booking }: TicketCardProps) {
  const { user } = useAuth();
  const userName = user?.name || user?.email || user?.displayPhone || 'TicketX Customer';

  const qrValue = JSON.stringify({
    id: booking.id,
    title: booking.movieTitle,
    date: booking.date,
    time: booking.time,
    seats: booking.seats,
    venue: booking.theatre,
    bookedBy: userName,
    status: 'CONFIRMED',
  });

  return (
    <div className="bg-[#151515] rounded-2xl overflow-hidden border border-white/10 w-full max-w-sm mx-auto shadow-2xl relative">
      {/* Top Banner */}
      <div className="bg-primary/10 border-b border-primary/20 p-4 text-center flex items-center justify-between px-6">
        <p className="text-primary font-extrabold tracking-widest text-xs uppercase font-heading">
          TICKETX
        </p>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          BOOKING CONFIRMED
        </span>
      </div>

      <div className="p-6 md:p-8 space-y-6 relative">
        {/* Ticket Cutout Side Notches */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-r border-white/10" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-l border-white/10" />

        <div>
          <h2 className="text-2xl font-bold font-heading mb-1 text-white">{booking.movieTitle}</h2>
          <p className="text-muted-foreground text-xs">{booking.theatre}</p>
          <p className="text-muted-foreground text-xs">{booking.screen}</p>
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
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Seats / Category</p>
            <p className="font-semibold text-white font-mono">{booking.seats.join(' • ')}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Booked By</p>
            <p className="font-semibold text-white truncate">{userName}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-dashed border-white/10 flex flex-col items-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Booking ID: <span className="font-mono text-white font-bold">{booking.id}</span>
          </p>
          <div className="bg-white p-3 rounded-xl mb-2 shadow-inner">
            <QRCodeSVG value={qrValue} size={140} level="M" />
          </div>
          <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase mt-1">
            Show code at venue entrance
          </p>
        </div>
      </div>
    </div>
  );
}
