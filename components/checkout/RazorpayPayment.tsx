"use client";

import { useState } from 'react';
import Script from 'next/script';
import { Loader2, ShieldCheck, AlertCircle, RefreshCw, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Movie } from '@/types/movie';
import { Theatre } from '@/types/theatre';
import { Show } from '@/types/show';
import { Seat } from '@/types/seat';
import { Booking } from '@/types/booking';
import { calculateTotal, calculateSubtotal, calculateTotalBookingFee } from '@/lib/pricing';

export type PaymentState =
  | "idle"
  | "creating-order"
  | "checkout-open"
  | "verifying"
  | "success"
  | "failed";

interface RazorpayPaymentProps {
  movie: Movie;
  theatre: Theatre;
  show: Show;
  selectedSeats: Seat[];
  onSuccess: (booking: Booking) => void;
}

export function RazorpayPayment({
  movie,
  theatre,
  show,
  selectedSeats,
  onSuccess,
}: RazorpayPaymentProps) {
  const { user } = useAuth();
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = calculateSubtotal(selectedSeats);
  const bookingFee = calculateTotalBookingFee(selectedSeats.length);
  const total = calculateTotal(selectedSeats);

  const accountKey = user?.uid || (user?.phone ? `phone:+91${user.phone}` : 'guest');

  const handleInitiatePayment = async () => {
    if (paymentState === "creating-order" || paymentState === "verifying") return;

    setErrorMessage(null);
    setPaymentState("creating-order");

    try {
      // 1. Create Razorpay order on TicketX server (Requirements 1, 8, 11)
      const res = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: movie.id,
          theatreId: theatre.id,
          showId: show.id,
          seatIds: selectedSeats.map((s) => s.id),
          seatPrices: selectedSeats.map((s) => ({ code: s.id, price: s.price })),
          accountKey,
        }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.success) {
        setPaymentState("failed");
        setErrorMessage(orderData.error || "Failed to initialize payment order.");
        return;
      }

      if (typeof window === "undefined" || !window.Razorpay) {
        setPaymentState("failed");
        setErrorMessage("Razorpay checkout SDK failed to load. Please refresh.");
        return;
      }

      setPaymentState("checkout-open");

      // 2. Open Razorpay Standard Checkout modal (Requirements 18, 39, 40)
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TicketX Cinemas",
        description: `${movie.title} • ${theatre.name}`,
        order_id: orderData.orderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setPaymentState("verifying");

          try {
            // 3. Verify payment signature on TicketX server (Requirements 20, 21, 22)
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                accountKey,
                bookingDetails: {
                  movieId: movie.id,
                  movieTitle: movie.title,
                  theatreName: theatre.name,
                  screenName: show.screenName || show.screen || "Screen 1",
                  date: show.date,
                  time: show.time,
                  seats: selectedSeats.map((s) => s.id),
                  subtotal,
                  convenienceFee: bookingFee,
                  total,
                },
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              setPaymentState("failed");
              setErrorMessage(verifyData.error || "Payment verification failed.");
              return;
            }

            setPaymentState("success");
            onSuccess(verifyData.booking);
          } catch (err: unknown) {
            console.error("Verification error:", err);
            setPaymentState("failed");
            setErrorMessage("An error occurred verifying your payment.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phoneNumber || user?.displayPhone || "",
        },
        notes: {
          bookingType: "movie",
          movieId: movie.id,
          theatreId: theatre.id,
        },
        theme: {
          color: "#D82132",
        },
        modal: {
          ondismiss: function () {
            setPaymentState("failed");
            setErrorMessage("Payment cancelled. Your seats have not been booked.");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response: { error?: { description?: string } }) {
        console.error("Razorpay payment failed:", response.error);
        setPaymentState("failed");
        setErrorMessage(response.error?.description || "Payment unsuccessful. Your booking was not confirmed.");
      });

      razorpayInstance.open();
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Failed to start secure payment.";
      console.error("Order creation error:", err);
      setPaymentState("failed");
      setErrorMessage(errMessage);
    }
  };

  return (
    <>
      {/* Load official Razorpay Checkout SDK (Requirement 14) */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="bg-secondary/40 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Requirement 29, 50: Clear Test Mode Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs p-4 rounded-xl flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-[11px]">Razorpay Test Mode</span>
              <span className="text-[11px] text-amber-300/80">No real money will be charged. Use test card or success@razorpay.</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 font-mono text-[10px] font-bold border border-amber-500/30 shrink-0">
            TEST MODE
          </span>
        </div>

        {/* Pricing Summary */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2 text-sm font-mono">
          <div className="flex justify-between text-muted-foreground">
            <span>Tickets ({selectedSeats.length})</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Convenience Fee (incl. GST)</span>
            <span>₹{bookingFee.toLocaleString()}</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between text-white font-extrabold text-base">
            <span>Total Payable</span>
            <span className="text-emerald-400">₹{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Failure alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-bold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => {
                setErrorMessage(null);
                setPaymentState("idle");
              }}
              className="text-[11px] text-white hover:underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Pay Button */}
        <Button
          type="button"
          disabled={paymentState === "creating-order" || paymentState === "checkout-open" || paymentState === "verifying"}
          onClick={handleInitiatePayment}
          className="w-full h-14 text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(216,33,50,0.4)] flex items-center justify-center gap-2"
        >
          {paymentState === "creating-order" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Creating Secure Order...
            </>
          ) : paymentState === "checkout-open" ? (
            <>
              <CreditCard className="w-5 h-5 animate-pulse" /> Checkout Window Open...
            </>
          ) : paymentState === "verifying" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" /> Verifying Signature...
            </>
          ) : paymentState === "failed" ? (
            <>
              <RefreshCw className="w-5 h-5 mr-1" /> Try Payment Again — ₹{total.toLocaleString()}
            </>
          ) : (
            `Pay ₹${total.toLocaleString()}`
          )}
        </Button>
      </div>
    </>
  );
}
