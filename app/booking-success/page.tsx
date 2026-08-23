"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserBookingsLocal } from '@/lib/storage';
import { Booking } from '@/types/booking';
import { TicketCard } from '@/components/ticket/TicketCard';
import { downloadTicketJpg, shareTicketJpg } from '@/lib/ticketExport';
import { useAuth } from '@/context/AuthContext';

export default function BookingSuccessPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const successId = sessionStorage.getItem('ticketx_success');
    if (!successId) {
      router.push('/');
      return;
    }

    // Account-isolated booking retrieval (Requirements 23, 24, 26, 30)
    const bookings = user?.uid ? getUserBookingsLocal(user.uid) : [];
    const found = bookings.find((b) => b.id === successId);

    if (found) {
      setBooking(found);
    } else {
      // Fallback: If not found in local user cache, try any recent booking stored in session
      const rawStored = sessionStorage.getItem(`ticketx_booking_${successId}`);
      if (rawStored) {
        try {
          setBooking(JSON.parse(rawStored));
          return;
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [router, user?.uid]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Requirement: Digital Ticket JPEG Pass export (TicketX_<BookingID>.jpg)
  const handleDownload = async () => {
    if (!booking) return;
    const customerName = user?.name || user?.email || user?.displayPhone || 'TicketX Customer';
    await downloadTicketJpg(booking, customerName);
  };

  // Requirement: Native Web Share API with JPG pass fallback
  const handleShare = async () => {
    if (!booking) return;
    const customerName = user?.name || user?.email || user?.displayPhone || 'TicketX Customer';
    const res = await shareTicketJpg(booking, customerName);
    if (res.success) {
      if (res.method === 'clipboard') {
        triggerToast('Digital Ticket Pass copied to clipboard!');
      } else if (res.method === 'download') {
        triggerToast('Digital Ticket Pass downloaded!');
      } else {
        triggerToast('Ticket Pass shared successfully!');
      }
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Share Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/90 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">BOOKING CONFIRMED</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Your TicketX digital pass is ready. Get ready for an amazing cinematic experience!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100, damping: 20 }}
          className="w-full"
        >
          <TicketCard booking={booking} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex flex-wrap justify-center gap-3.5 max-w-xl w-full"
        >
          <Button
            size="lg"
            onClick={handleDownload}
            className="rounded-full px-7 font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Ticket JPG
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleShare}
            className="rounded-full px-7 font-bold border-white/20 text-white hover:bg-white/10 flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Share Ticket Pass
          </Button>

          <Button size="lg" className="rounded-full px-7 font-bold" asChild>
            <Link href="/my-bookings">View My Bookings</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
