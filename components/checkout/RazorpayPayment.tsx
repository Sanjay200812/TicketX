"use client";

import { useState } from 'react';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle2,
  X,
  Lock,
} from 'lucide-react';
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
  | "creating_order"
  | "order_created"
  | "opening_checkout"
  | "payment_pending"
  | "verifying_payment"
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Integrated Test Checkout Modal State
  const [showTestCheckoutModal, setShowTestCheckoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [selectedUpi, setSelectedUpi] = useState('gpay');
  const [currentOrder, setCurrentOrder] = useState<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  } | null>(null);

  const subtotal = calculateSubtotal(selectedSeats);
  const bookingFee = calculateTotalBookingFee(selectedSeats.length);
  const total = calculateTotal(selectedSeats);

  const accountKey = user?.uid || (user?.phone ? `phone:+91${user.phone}` : 'guest');

  const handleInitiatePayment = async () => {
    if (paymentState === "creating_order" || paymentState === "verifying_payment") return;

    setStatusMessage(null);
    setIsError(false);
    setPaymentState("creating_order");

    try {
      // 1. Create Razorpay order on TicketX server in integer paise (Requirements 17, 20, 21)
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
        setIsError(true);
        setStatusMessage(orderData.error || "Unable to start secure payment order. Please try again.");
        return;
      }

      const orderInfo = {
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        keyId: orderData.keyId,
      };
      setCurrentOrder(orderInfo);
      setPaymentState("order_created");

      // Check if official Razorpay SDK is available and keys are active
      const hasRealRazorpayKey = orderData.keyId && !orderData.keyId.includes("demo") && !orderData.keyId.includes("fallback");

      if (typeof window !== "undefined" && window.Razorpay && hasRealRazorpayKey) {
        setPaymentState("opening_checkout");

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
            await verifyPaymentSignature(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.phoneNumber || user?.displayPhone || "",
          },
          theme: {
            color: "#D82132",
          },
          modal: {
            ondismiss: function () {
              setPaymentState("idle");
              setIsError(false);
              setStatusMessage("Payment cancelled. Your seats remain reserved while the timer is active.");
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on("payment.failed", function (response: { error?: { description?: string; code?: string; reason?: string } }) {
          console.error("Razorpay payment failed:", response.error);
          setPaymentState("failed");
          setIsError(true);
          setStatusMessage(response.error?.description || "Payment failed. Please try again with another payment method.");
        });

        razorpayInstance.open();
      } else {
        // Open Seamless Integrated Test Checkout Gateway
        setPaymentState("opening_checkout");
        setShowTestCheckoutModal(true);
      }
    } catch (err: unknown) {
      console.error("Payment initiation error:", err);
      setPaymentState("failed");
      setIsError(true);
      setStatusMessage("Unable to connect to payment server. Please try again.");
    }
  };

  const verifyPaymentSignature = async (paymentId: string, orderId: string, signature: string) => {
    setPaymentState("verifying_payment");
    setShowTestCheckoutModal(false);

    try {
      const verifyRes = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
          accountKey,
          bookingDetails: {
            movieId: movie.id,
            movieTitle: movie.title,
            moviePoster: movie.poster,
            movieLanguage: show.language || movie.language || 'Telugu',
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
        setIsError(true);
        setStatusMessage(verifyData.error || "Payment verification failed. Please contact support.");
        return;
      }

      setPaymentState("success");
      onSuccess(verifyData.booking);
    } catch (err: unknown) {
      console.error("Verification error:", err);
      setPaymentState("failed");
      setIsError(true);
      setStatusMessage("An error occurred verifying your payment. Please check My Bookings.");
    }
  };

  const handleSimulateTestPaymentSuccess = async () => {
    if (!currentOrder) return;
    const testPaymentId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const testSignature = `sig_test_${Date.now()}`;
    await verifyPaymentSignature(testPaymentId, currentOrder.orderId, testSignature);
  };

  const handleCloseTestModal = () => {
    setShowTestCheckoutModal(false);
    setPaymentState("idle");
    setIsError(false);
    setStatusMessage("Payment cancelled. Your seats remain reserved while the timer is active.");
  };

  return (
    <>
      {/* Load Razorpay Checkout SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="bg-secondary/40 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Test Mode Notification Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs p-4 rounded-xl flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-[11px]">Razorpay Test Sandbox</span>
              <span className="text-[11px] text-amber-300/80">Safe demo environment. No real money will be charged.</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 font-mono text-[10px] font-bold border border-amber-500/30 shrink-0">
            TEST MODE
          </span>
        </div>

        {/* Pricing Summary (Gold ₹295, Silver ₹150 + ₹20 Booking Fee + 18% IGST) */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2 text-sm font-mono">
          <div className="flex justify-between text-muted-foreground">
            <span>Tickets ({selectedSeats.length})</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Convenience Fee (incl. 18% IGST)</span>
            <span>₹{bookingFee.toFixed(2)}</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between text-white font-extrabold text-base">
            <span>Total Payable</span>
            <span className="text-emerald-400">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Status / Error Banner */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between gap-3 ${
              isError
                ? 'bg-destructive/15 border border-destructive/30 text-destructive'
                : 'bg-primary/15 border border-primary/30 text-primary-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button
              onClick={() => {
                setStatusMessage(null);
                setIsError(false);
              }}
              className="text-[11px] hover:underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Action Button */}
        <Button
          type="button"
          disabled={paymentState === "creating_order" || paymentState === "verifying_payment"}
          onClick={handleInitiatePayment}
          className="w-full h-14 text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(216,33,50,0.4)] flex items-center justify-center gap-2"
        >
          {paymentState === "creating_order" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Creating Secure Order...
            </>
          ) : paymentState === "verifying_payment" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" /> Verifying Payment...
            </>
          ) : paymentState === "failed" ? (
            <>
              <RefreshCw className="w-5 h-5 mr-1" /> Try Payment Again — ₹{total.toFixed(2)}
            </>
          ) : (
            `Pay ₹${total.toFixed(2)}`
          )}
        </Button>
      </div>

      {/* INTEGRATED RAZORPAY TEST CHECKOUT MODAL */}
      <AnimatePresence>
        {showTestCheckoutModal && currentOrder && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
              onClick={handleCloseTestModal}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#121216] border border-white/15 rounded-3xl p-6 shadow-2xl z-10 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-black font-heading text-white tracking-wide">Razorpay Checkout</h3>
                    <p className="text-xs text-muted-foreground font-mono">{theatre.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseTestModal}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Amount Display */}
              <div className="bg-black/50 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block font-mono">Amount to Pay</span>
                  <span className="text-2xl font-black font-heading text-emerald-400">₹{total.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-muted-foreground block">Order ID</span>
                  <span className="text-xs font-mono text-gray-300 font-bold">{currentOrder.orderId.slice(0, 14)}...</span>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 border border-white/10 rounded-xl">
                <button
                  onClick={() => setActiveTab('upi')}
                  className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'upi' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> UPI / QR
                </button>
                <button
                  onClick={() => setActiveTab('card')}
                  className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'card' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Card
                </button>
                <button
                  onClick={() => setActiveTab('netbanking')}
                  className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'netbanking' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" /> NetBanking
                </button>
              </div>

              {/* Tab Contents */}
              <div className="min-h-[120px] flex flex-col justify-center">
                {activeTab === 'upi' && (
                  <div className="space-y-2.5">
                    <label className="text-xs font-semibold text-gray-300 block">Select UPI App:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                        <button
                          key={app}
                          onClick={() => setSelectedUpi(app)}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                            selectedUpi === app
                              ? 'border-primary bg-primary/20 text-white'
                              : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'card' && (
                  <div className="space-y-2 text-xs font-mono bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="text-gray-300 flex justify-between">
                      <span>Card Number</span>
                      <span className="font-bold text-white">•••• •••• •••• 4242</span>
                    </div>
                    <div className="text-gray-300 flex justify-between">
                      <span>Expiry / CVV</span>
                      <span className="font-bold text-white">12/28 • 123</span>
                    </div>
                  </div>
                )}

                {activeTab === 'netbanking' && (
                  <div className="space-y-2.5">
                    <label className="text-xs font-semibold text-gray-300 block">Select Popular Bank:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['HDFC', 'SBI', 'ICICI'].map((bank) => (
                        <button
                          key={bank}
                          onClick={() => setSelectedUpi(bank)}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                            selectedUpi === bank
                              ? 'border-primary bg-primary/20 text-white'
                              : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pay Simulation Button */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <Button
                  onClick={handleSimulateTestPaymentSuccess}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <CheckCircle2 className="w-5 h-5" /> Pay ₹{total.toFixed(2)} (Complete Test Order)
                </Button>
                <button
                  onClick={handleCloseTestModal}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-white transition-colors text-center"
                >
                  Cancel and Keep Seats
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
