"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { movies } from '@/data/movies';
import { shows } from '@/data/shows';
import { theatres } from '@/data/theatres';
import { seatLayouts } from '@/data/seatLayouts';
import { Seat } from '@/types/seat';
import { TheatreSeatMap } from '@/components/booking/TheatreSeatMap';
import { BookingBar, MAX_SEATS_PER_BOOKING } from '@/components/booking/BookingBar';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { TicketXMovie as Movie } from '@/types/movie';
import { TicketXShow as Show } from '@/types/show';
import { TicketXTheatre as Theatre } from '@/types/theatre';
import { TicketXSeatLayout } from '@/types/seatLayouts';
import { useAuth } from '@/context/AuthContext';

export default function BookingPage({ params }: { params: { showId: string } }) {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [show, setShow] = useState<Show | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [theatre, setTheatre] = useState<Theatre | null>(null);
  const [layout, setLayout] = useState<TicketXSeatLayout | null>(null);
  const [limitAlert, setLimitAlert] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);

  // User hold restoration state (Requirement 12, 17)
  const [userHoldInfo, setUserHoldInfo] = useState<{
    holdId: string;
    seatCodes: string[];
    expiresAt: number;
    isAbandoned: boolean;
  } | null>(null);
  const [remainingHoldSecs, setRemainingHoldSecs] = useState<number>(0);

  useEffect(() => {
    const s = shows.find((sh) => sh.id === params.showId) || shows[0];
    if (s) {
      const m = movies.find((mv) => mv.id === s.movieId) || null;
      const t = theatres.find((th) => th.id === s.theatreId) || null;
      const l =
        seatLayouts.find((sl) => sl.id === s.seatLayoutId) ||
        seatLayouts.find((sl) => sl.theatreId === s.theatreId) ||
        seatLayouts[0];

      setShow(s);
      setMovie(m);
      setTheatre(t);

      if (l && s.priceOverrides) {
        const customLayout = {
          ...l,
          sections: l.sections.map((sec) => {
            const cat = (sec.categoryKey || sec.name || '').toLowerCase();
            let newPrice = sec.price;
            if (cat.includes('premium') || cat.includes('silver')) {
              newPrice = s.priceOverrides?.premium ?? sec.price;
            } else if (cat.includes('gold')) {
              newPrice = s.priceOverrides?.gold ?? sec.price;
            } else if (cat.includes('land') || cat.includes('luxury')) {
              newPrice = s.priceOverrides?.onLand ?? sec.price;
            }
            return { ...sec, price: newPrice };
          }),
        };
        setLayout(customLayout);
      } else {
        setLayout(l);
      }
    }
  }, [params.showId]);

  // Hold expiration timer for user's own reserved seats
  useEffect(() => {
    if (!userHoldInfo?.expiresAt) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((userHoldInfo.expiresAt - Date.now()) / 1000));
      setRemainingHoldSecs(remaining);
      if (remaining <= 0) {
        setUserHoldInfo(null);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [userHoldInfo?.expiresAt]);

  const handleRestoreUserHold = useCallback(
    (holdInfo: { seatCodes: string[]; holdId: string; expiresAt: number; isAbandoned: boolean }) => {
      setUserHoldInfo(holdInfo);
      const secs = Math.max(0, Math.floor((holdInfo.expiresAt - Date.now()) / 1000));
      setRemainingHoldSecs(secs);
    },
    []
  );

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
    if (selectedSeats.length === 0 || reserving) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/booking/${params.showId}`)}`);
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
          showId: params.showId,
          seatCodes,
          userId: user.id,
        }),
      });

      const data = await res.json();
      setReserving(false);

      if (!res.ok || !data.success) {
        setHoldError(data.error || 'This seat was just reserved by another customer. Please select another seat.');
        setSelectedSeats([]); // clear unavailable selection
        return;
      }

      // Store hold context for checkout
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'ticketx_checkout',
          JSON.stringify({
            holdId: data.holdId,
            expiresAt: data.expiresAt,
            show,
            movie,
            theatre,
            selectedSeats,
          })
        );
      }

      router.push('/checkout');
    } catch (err) {
      console.error('Error reserving seats:', err);
      setReserving(false);
      setHoldError('Failed to reserve seats. Please try again.');
    }
  };

  const handleResumeUserHold = () => {
    if (!userHoldInfo || !show || !movie || !theatre) return;

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'ticketx_checkout',
        JSON.stringify({
          holdId: userHoldInfo.holdId,
          expiresAt: userHoldInfo.expiresAt,
          show,
          movie,
          theatre,
          selectedSeats: userHoldInfo.seatCodes.map((code) => ({
            id: code,
            row: code.charAt(0),
            number: parseInt(code.slice(1), 10) || 1,
            category: 'Reserved',
            price: 250,
            status: 'selected' as const,
          })),
        })
      );
    }
    router.push('/checkout');
  };

  if (!show || !movie || !theatre) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-40 bg-background">
      {/* Header & Progress */}
      <div className="bg-secondary/50 border-b border-white/5 pb-4 pt-4 sticky top-16 z-30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-2">
            <Link
              href={`/shows/${movie.id}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Shows
            </Link>
            <BookingProgress currentStep="seats" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold font-heading">{movie.title}</h1>
              {layout && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {layout.layoutFamily} Layout
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <span className="text-white font-medium">{theatre.name}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{new Date(show.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-white font-medium">{show.time}</span>
              {show.screenName && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>{show.screenName}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Hold Resume Banner (Requirement 12, 17) */}
      {userHoldInfo && remainingHoldSecs > 0 && (
        <div className="container mx-auto px-4 md:px-6 pt-4">
          <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-sm font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <span>
                Your seats ({userHoldInfo.seatCodes.join(', ')}) are reserved for{' '}
                <strong className="font-mono text-white text-base">{formatSecs(remainingHoldSecs)}</strong>
              </span>
            </div>

            <button
              onClick={handleResumeUserHold}
              className="px-5 py-2 rounded-full bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5 shrink-0 shadow-lg"
            >
              <span>Resume Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Max Seat Limit Alert Toast */}
      {limitAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black px-6 py-2.5 rounded-full font-bold text-xs shadow-2xl animate-bounce flex items-center gap-2">
          <span>⚠️ Maximum {MAX_SEATS_PER_BOOKING} seats allowed per booking transaction</span>
        </div>
      )}

      {/* Seat Hold Conflict Error Banner */}
      {holdError && (
        <div className="container mx-auto px-4 md:px-6 pt-4">
          <div className="p-4 rounded-xl bg-destructive/20 border border-destructive/40 text-destructive text-sm font-semibold flex items-center gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{holdError}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 py-8">
        {layout ? (
          <TheatreSeatMap
            layout={layout}
            showId={params.showId}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
            onRestoreUserHold={handleRestoreUserHold}
          />
        ) : (
          <div className="max-w-xl mx-auto py-20 px-6 text-center bg-secondary/30 border border-white/10 rounded-2xl shadow-2xl flex flex-col items-center">
            <h3 className="text-xl font-bold text-white mb-2">Seating Layout Pending</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Seating layout for this screen will be added soon.
            </p>
          </div>
        )}
      </div>

      {layout && (
        <BookingBar
          selectedSeats={selectedSeats}
          onProceed={handleProceed}
        />
      )}
    </div>
  );
}
