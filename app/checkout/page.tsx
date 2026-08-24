"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookingSummary } from '@/components/checkout/BookingSummary';
import { RazorpayPayment } from '@/components/checkout/RazorpayPayment';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { TicketXHeading } from '@/components/shared/TicketXHeading';
import { saveBookingForUser } from '@/lib/storage';
import { Booking } from '@/types/booking';
import { Movie } from '@/types/movie';
import { Theatre } from '@/types/theatre';
import { Show } from '@/types/show';
import { Seat } from '@/types/seat';
import { useAuth } from '@/context/AuthContext';
import { Clock, ChevronLeft, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [checkoutData, setCheckoutData] = useState<{
    holdId?: string;
    expiresAt?: number;
    movie: Movie;
    theatre: Theatre;
    show: Show;
    selectedSeats: Seat[];
    isEvent?: boolean;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes default
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('ticketx_checkout');
    if (!data) {
      router.push('/movies');
      return;
    }
    const parsed = JSON.parse(data);
    setCheckoutData(parsed);

    if (parsed.expiresAt) {
      const remainingSecs = Math.max(0, Math.floor((parsed.expiresAt - Date.now()) / 1000));
      setTimeLeft(remainingSecs);
    }
  }, [router]);

  useEffect(() => {
    if (!checkoutData?.expiresAt) return;

    const timer = setInterval(() => {
      const remainingSecs = Math.max(0, Math.floor((checkoutData.expiresAt! - Date.now()) / 1000));
      setTimeLeft(remainingSecs);

      if (remainingSecs <= 0) {
        clearInterval(timer);
        setError('Seat reservation hold expired. Please reselect your seats.');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [checkoutData?.expiresAt]);

  const handleLeaveCheckout = () => {
    if (checkoutData?.isEvent) {
      router.push(`/events/${checkoutData.movie.id}`);
    } else if (checkoutData?.show?.id) {
      router.push(`/booking/${checkoutData.show.id}`);
    } else {
      router.push('/movies');
    }
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { movie, theatre, show, selectedSeats } = checkoutData;

  // Calculate Account Owner Key (Requirements 27, 42)
  const ownerId = user?.uid || (user?.phone ? `phone:+91${user.phone}` : null);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Called ONLY after server-side Razorpay signature verification succeeds (Requirements 1, 26, 30)
  const handlePaymentSuccess = async (confirmedBooking: Booking) => {
    if (!ownerId) {
      setError('Please sign in to save your ticket.');
      return;
    }

    try {
      // Account-scoped booking persistence (Requirements 27, 42)
      await saveBookingForUser(ownerId, confirmedBooking);

      sessionStorage.removeItem('ticketx_checkout');
      sessionStorage.setItem('ticketx_success', confirmedBooking.id);

      router.push(`/booking-success?id=${encodeURIComponent(confirmedBooking.id)}`);
    } catch (err) {
      console.error('Error saving verified booking:', err);
      setError('Failed to store verified booking. Please check My Bookings.');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <button
          onClick={handleLeaveCheckout}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6 font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Seat Map
        </button>

        <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <TicketXHeading size="lg">Review &amp; Pay</TicketXHeading>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground font-medium">Seats reserved for:</span>
              <span className={`px-3 py-1 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 ${
                timeLeft < 120
                  ? 'bg-destructive/20 text-destructive border-destructive/40 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatCountdown(timeLeft)}</span>
              </span>
            </div>
          </div>

          <BookingProgress currentStep="checkout" />
        </div>

        {/* Require Sign In if Guest (Requirement 27, 28) */}
        {!ownerId ? (
          <div className="max-w-xl mx-auto py-12 text-center bg-secondary/30 rounded-3xl border border-white/10 p-8 shadow-2xl space-y-4">
            <LogIn className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-white font-heading">Sign In to Complete Booking</h2>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-md mx-auto">
              You must be signed in to issue your Digital Ticket Pass under your account. Your selected seats will be preserved.
            </p>
            <Button
              size="lg"
              onClick={() => router.push('/login?redirect=/checkout')}
              className="rounded-full px-8 font-bold text-sm"
            >
              Sign In / Register Now →
            </Button>
          </div>
        ) : timeLeft <= 0 ? (
          <div className="max-w-2xl mx-auto py-16 text-center bg-secondary/30 rounded-2xl border border-destructive/30 p-8 shadow-2xl">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Seat Hold Expired</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Your 10-minute active checkout hold has expired to allow other customers access to the seats.
            </p>
            <button
              onClick={handleLeaveCheckout}
              className="px-6 py-3 rounded-full bg-primary text-white font-bold text-sm"
            >
              Reselect Seats
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="max-w-5xl mx-auto mb-6 p-4 rounded-xl bg-destructive/20 border border-destructive/40 text-destructive text-sm font-semibold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <BookingSummary
                  movie={movie}
                  theatre={theatre}
                  show={show}
                  selectedSeats={selectedSeats}
                  isEvent={checkoutData.isEvent}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Razorpay Test Mode Payment Standard Checkout (Requirement 1, 16, 50) */}
                <RazorpayPayment
                  movie={movie}
                  theatre={theatre}
                  show={show}
                  selectedSeats={selectedSeats}
                  onSuccess={handlePaymentSuccess}
                />
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
