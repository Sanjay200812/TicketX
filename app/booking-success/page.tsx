"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Share2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserBookingsLocal } from '@/lib/storage';
import { Booking } from '@/types/booking';
import { TicketCard } from '@/components/ticket/TicketCard';
import { TicketXHeading } from '@/components/shared/TicketXHeading';
import { downloadTicketJpg, shareTicketJpg } from '@/lib/ticketExport';
import { useAuth } from '@/context/AuthContext';

export default function BookingSuccessPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const successId = sessionStorage.getItem('ticketx_success');
    if (!successId) {
      router.push('/');
      return;
    }

    const bookings = user?.uid ? getUserBookingsLocal(user.uid) : [];
    const found = bookings.find((b) => b.id === successId);

    if (found) {
      setBooking(found);
    } else {
      const rawStored = sessionStorage.getItem(`ticketx_booking_${successId}`);
      if (rawStored) {
        try {
          setBooking(JSON.parse(rawStored));
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

  // Requirement 22, 23, 24, 25, 26, 66: Single DOWNLOAD TICKET button & robust error handling
  const handleDownload = async () => {
    if (!booking || isDownloading) return;
    setDownloadError(null);
    setIsDownloading(true);

    const success = await downloadTicketJpg(booking);
    setIsDownloading(false);

    if (!success) {
      setDownloadError('Unable to download ticket. Please try again.');
      setTimeout(() => setDownloadError(null), 5000);
    } else {
      triggerToast('Ticket downloaded successfully!');
    }
  };

  const handleShare = async () => {
    if (!booking) return;
    const res = await shareTicketJpg(booking);
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
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/95 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Download Error Banner (Requirement 66) */}
      {downloadError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-destructive text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{downloadError}</span>
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
          <TicketXHeading
            subtitle="Your TicketX digital pass is ready. Get ready for an amazing cinematic experience!"
            size="xl"
            className="justify-center"
          >
            BOOKING CONFIRMED
          </TicketXHeading>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100, damping: 20 }}
          className="w-full"
        >
          <TicketCard booking={booking} />
        </motion.div>

        {/* Actions (Requirements 22, 23, 24, 25, 26) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex flex-wrap justify-center gap-3.5 max-w-xl w-full"
        >
          {/* Exactly one DOWNLOAD TICKET button (Requirement 22) */}
          <Button
            size="lg"
            onClick={handleDownload}
            disabled={isDownloading}
            className="rounded-full px-8 font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(216,33,50,0.35)] flex items-center gap-2 uppercase tracking-wider text-xs"
          >
            <Download className="w-4 h-4" /> {isDownloading ? 'GENERATING TICKET...' : 'DOWNLOAD TICKET'}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleShare}
            className="rounded-full px-7 font-bold border-white/20 text-white hover:bg-white/10 flex items-center gap-2 text-xs"
          >
            <Share2 className="w-4 h-4" /> Share Ticket Pass
          </Button>

          <Button size="lg" className="rounded-full px-7 font-bold text-xs" asChild>
            <Link href="/my-bookings">View My Bookings</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
