"use client";

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MoviePoster } from '@/components/shared/MoviePoster';
import { MapPin, Calendar, Clock, Tv, Film } from 'lucide-react';
import { Booking } from '@/types/booking';

export interface TicketCardData {
  bookingId: string;
  movieTitle: string;
  moviePoster?: string;
  movieLanguage?: string;
  format?: string;
  certificate?: string;
  theatreName: string;
  cityName?: string;
  date: string;
  time: string;
  screenName: string;
  seats: string[];
  category?: string;
  grandTotal?: number;
}

interface TicketCardProps {
  ticket?: TicketCardData;
  booking?: Booking;
  className?: string;
}

export function TicketCard({ ticket: rawTicket, booking, className = '' }: TicketCardProps) {
  const ticketData: TicketCardData = rawTicket || {
    bookingId: booking?.id || 'TX-000000',
    movieTitle: booking?.movieTitle || 'Movie',
    moviePoster: booking?.moviePoster,
    movieLanguage: booking?.movieLanguage || 'Telugu',
    format: '2D',
    certificate: 'UA16+',
    theatreName: booking?.theatre || 'Theatre',
    cityName: 'Andhra Pradesh',
    date: booking?.date || '2026-08-22',
    time: booking?.time || '11:30 AM',
    screenName: booking?.screen || 'SCREEN 1',
    seats: booking?.seats || [],
    category: 'GOLD',
    grandTotal: booking?.total,
  };

  const qrData = JSON.stringify({
    id: ticketData.bookingId,
    movie: ticketData.movieTitle,
    theatre: ticketData.theatreName,
    date: ticketData.date,
    time: ticketData.time,
    seats: ticketData.seats.join(','),
  });

  const formattedDate = new Date(ticketData.date).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const categoryName = ticketData.category || 'GOLD';

  return (
    <div
      id="ticket-card-pass"
      className={`relative w-full max-w-sm mx-auto bg-[#121215] text-white rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-sans ${className}`}
    >
      {/* Ticket Side Notches */}
      <div className="absolute top-[280px] -left-4 w-8 h-8 rounded-full bg-background border border-white/10 z-20" />
      <div className="absolute top-[280px] -right-4 w-8 h-8 rounded-full bg-background border border-white/10 z-20" />

      {/* Top Header Branding */}
      <div className="bg-gradient-to-r from-rose-950/40 via-rose-900/20 to-black px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <span className="text-xl font-black font-heading tracking-widest text-white">
          TICKET<span className="text-primary">X</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
            RAZORPAY TEST MODE
          </span>
          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 font-mono">
            DIGITAL PASS
          </span>
        </div>
      </div>

      {/* Movie & Showtime Header */}
      <div className="p-6 space-y-4">
        <div className="flex gap-4 items-start">
          <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
            <MoviePoster src={ticketData.moviePoster} title={ticketData.movieTitle} className="w-full h-full" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h2 className="text-xl font-bold font-heading text-white line-clamp-1 truncate">{ticketData.movieTitle}</h2>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">
                {ticketData.certificate || 'UA16+'}
              </span>
              <span>{ticketData.movieLanguage || 'Telugu'}</span>
              <span>•</span>
              <span className="text-primary font-semibold">{ticketData.format || '2D'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
              <span className="text-gray-400">|</span>
              <Clock className="w-3.5 h-3.5" />
              <span>{ticketData.time}</span>
            </div>
          </div>
        </div>

        {/* QR Code Verification Box */}
        <div className="bg-black/60 p-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center space-y-3 text-center">
          <p className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-primary" /> Scan QR Code at Cinema Entry
          </p>
          <div className="bg-white p-3 rounded-xl shadow-inner border-2 border-primary/40">
            <QRCodeSVG value={qrData} size={140} level="M" />
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            Booking ID: <strong className="text-white">{ticketData.bookingId}</strong>
          </span>
        </div>

        {/* Screen & Seat Info Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-[10px] text-muted-foreground block uppercase font-bold">
              {ticketData.movieTitle.toLowerCase().includes('marriage') ||
              ticketData.movieTitle.toLowerCase().includes('event') ||
              ticketData.movieTitle.toLowerCase().includes('freshers') ||
              ticketData.movieTitle.toLowerCase().includes('starx')
                ? 'ZONE / SECTION'
                : 'Screen'}
            </span>
            <span className="font-extrabold text-white text-sm flex items-center gap-1 mt-0.5 truncate">
              <Tv className="w-3.5 h-3.5 text-primary shrink-0" /> {ticketData.screenName || 'HALL ZONE'}
            </span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Category</span>
            <span className="font-extrabold text-emerald-400 text-sm mt-0.5 truncate block">
              {categoryName}
            </span>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl font-mono text-center">
          <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
            Confirmed Seats ({ticketData.seats.length})
          </span>
          <span className="text-sm font-black text-primary tracking-wider">
            {ticketData.seats.join(', ')}
          </span>
        </div>
      </div>

      {/* Perforated Divider Line */}
      <div className="relative border-b-2 border-dashed border-white/20 my-1">
        <div className="absolute left-0 right-0 top-[1px] border-b-2 border-dashed border-black/80" />
      </div>

      {/* Venue & Footer */}
      <div className="p-6 pt-4 bg-black/40 space-y-3">
        <div className="flex items-start gap-2 text-xs">
          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white text-sm">{ticketData.theatreName}</p>
            <p className="text-muted-foreground">{ticketData.cityName || 'Andhra Pradesh'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono">
          <span className="text-gray-400">Total Paid: <strong className="text-white">₹{ticketData.grandTotal ? ticketData.grandTotal.toLocaleString() : '---'}</strong></span>
          <span className="text-primary font-bold">#TicketX</span>
        </div>
      </div>
    </div>
  );
}
