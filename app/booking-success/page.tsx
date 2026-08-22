"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBookings } from '@/lib/storage';
import { Booking } from '@/types/booking';
import { TicketCard } from '@/components/ticket/TicketCard';
import { downloadTicketPdf } from '@/lib/pdfGenerator';
import { shareTicket } from '@/lib/ticketShare';
import { useAuth } from '@/context/AuthContext';

export default function BookingSuccessPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [shareSuccessToast, setShareSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const successId = sessionStorage.getItem('ticketx_success');
    if (!successId) {
      router.push('/');
      return;
    }

    const bookings = getBookings();
    const found = bookings.find((b) => b.id === successId);

    if (found) {
      setBooking(found);
    } else {
      router.push('/');
    }
  }, [router]);

  const handleDownload = async () => {
    if (!booking) return;
    const customerName = user?.name || user?.email || user?.displayPhone || 'TicketX Customer';
    await downloadTicketPdf(booking, customerName);
  };

  const handleShare = async () => {
    if (!booking) return;
    const res = await shareTicket(booking);
    if (res.success && res.method === 'clipboard') {
      setShareSuccessToast('Booking details copied to clipboard!');
      setTimeout(() => setShareSuccessToast(null), 3500);
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
      {shareSuccessToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/90 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{shareSuccessToast}</span>
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
            Your TicketX experience is ready. Get ready for an amazing time at the show.
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
            <Download className="w-4 h-4" /> Download Ticket
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleShare}
            className="rounded-full px-7 font-bold border-white/20 text-white hover:bg-white/10 flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Share Ticket
          </Button>

          <Button size="lg" className="rounded-full px-7 font-bold" asChild>
            <Link href="/my-bookings">View My Bookings</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
