"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, ChevronLeft, AlertCircle, Mic } from 'lucide-react';
import { TicketXEvent } from '@/types/event';
import { events as allEvents } from '@/data/events';
import { Seat } from '@/types/seat';
import { generate1000SeatEventLayout } from '@/lib/eventSeatLayouts';
import { EventSeatMap } from '@/components/events/EventSeatMap';
import { BookingBar, MAX_SEATS_PER_BOOKING } from '@/components/booking/BookingBar';
import { useAuth } from '@/context/AuthContext';

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<TicketXEvent | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [limitAlert, setLimitAlert] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    const found = allEvents.find((e) => e.id === params.id) || allEvents[0];
    setEvent(found);
  }, [params.id]);

  const layout = useMemo(() => {
    if (!event) return null;
    return generate1000SeatEventLayout(event.id, event.name, event.pricing);
  }, [event]);

  const handleSeatSelect = (seat: Seat) => {
    setHoldError(null);
    setSelectedSeats((prev) => {
      const isSelected = prev.some((s) => s.id === seat.id);
      if (isSelected) {
        setLimitAlert(false);
        return prev.filter((s) => s.id !== seat.id);
      } else {
        if (prev.length >= MAX_SEATS_PER_BOOKING) {
          setLimitAlert(true);
          setTimeout(() => setLimitAlert(false), 3000);
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const handleProceed = async () => {
    if (selectedSeats.length === 0 || reserving || !event) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/events/${params.id}`)}`);
      return;
    }

    setHoldError(null);
    setReserving(true);

    try {
      const seatCodes = selectedSeats.map((s) => s.id);
      const res = await fetch('/api/seats/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId: params.id,
          seatCodes,
          userId: user.id,
        }),
      });

      const data = await res.json();
      setReserving(false);

      if (!res.ok || !data.success) {
        setHoldError(data.error || 'Some of your selected seats were just reserved by another attendee.');
        setSelectedSeats([]);
        return;
      }

      // Format event checkout context for /checkout page
      const eventMovieFormat = {
        id: event.id,
        title: event.name,
        poster: event.poster,
        language: event.eventType,
        genres: [event.eventType],
      };

      const eventTheatreFormat = {
        id: event.cityId,
        name: event.venue,
        area: event.cityName,
        locationId: event.cityId,
      };

      const eventShowFormat = {
        id: event.id,
        movieId: event.id,
        theatreId: event.cityId,
        locationId: event.cityId,
        date: event.date,
        time: event.time,
        screenName: 'Main Auditorium Hall',
        screen: 'Main Hall',
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'ticketx_checkout',
          JSON.stringify({
            holdId: data.holdId,
            expiresAt: data.expiresAt,
            movie: eventMovieFormat,
            theatre: eventTheatreFormat,
            show: eventShowFormat,
            selectedSeats,
            isEvent: true,
          })
        );
      }

      router.push('/checkout');
    } catch (err) {
      console.error('Error holding event seats:', err);
      setReserving(false);
      setHoldError('Failed to reserve event seats. Please try again.');
    }
  };

  if (!event || !layout) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40 bg-background pt-20">
      <div className="container mx-auto px-4 md:px-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Events
        </Link>

        {/* Large Event Header Banner */}
        <div className="relative w-full aspect-[21/9] min-h-[280px] max-h-[380px] rounded-2xl overflow-hidden mb-10 border border-white/10 shadow-2xl">
          <img src={event.poster} alt={event.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full bg-primary text-white mb-3 inline-flex items-center gap-1.5 shadow-lg">
                <Mic className="w-3.5 h-3.5" /> {event.eventType}
              </span>
              <h1 className="text-3xl md:text-5xl font-black font-heading text-white drop-shadow-md">{event.name}</h1>
            </div>

            <div className="bg-black/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-right font-mono">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Starting From</span>
              <span className="text-2xl font-black text-emerald-400">₹{event.startingPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Event Quick Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-secondary/40 p-5 rounded-2xl border border-white/10 mb-10 text-sm">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-bold text-white">
                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="font-bold text-white">{event.time}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Venue & City</p>
              <p className="font-bold text-white truncate">{event.venue}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <Mic className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Hall Capacity</p>
              <p className="font-bold text-amber-300">1,000 Real Seats</p>
            </div>
          </div>
        </div>

        {/* Max Seat Limit Alert Toast */}
        {limitAlert && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black px-6 py-2.5 rounded-full font-bold text-xs shadow-2xl animate-bounce flex items-center gap-2">
            <span>⚠️ Maximum {MAX_SEATS_PER_BOOKING} seats allowed per event transaction</span>
          </div>
        )}

        {/* Seat Conflict Error Banner */}
        {holdError && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/20 border border-destructive/40 text-destructive text-sm font-semibold flex items-center gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{holdError}</span>
          </div>
        )}

        {/* 1000-SEAT AUDITORIUM MAP */}
        <div className="mb-12">
          <EventSeatMap
            layout={layout}
            eventId={event.id}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
          />
        </div>
      </div>

      <BookingBar
        selectedSeats={selectedSeats}
        onProceed={handleProceed}
      />
    </div>
  );
}
