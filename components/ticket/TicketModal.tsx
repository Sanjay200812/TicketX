"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Booking } from '@/types/booking';
import { TicketCard } from '@/components/ticket/TicketCard';
import { downloadTicketPdf } from '@/lib/pdfGenerator';
import { shareTicket } from '@/lib/ticketShare';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export function TicketModal({ isOpen, onClose, booking }: TicketModalProps) {
  const { user } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleDownload = async () => {
    if (!booking) return;
    const name = user?.name || user?.email || user?.displayPhone || 'TicketX Customer';
    await downloadTicketPdf(booking, name);
  };

  const handleShare = async () => {
    if (!booking) return;
    const res = await shareTicket(booking);
    if (res.success && res.method === 'clipboard') {
      setToast('Booking details copied to clipboard!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && booking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />

          {toast && (
            <div className="fixed top-20 z-[120] bg-emerald-500/90 text-white font-bold text-xs px-5 py-2 rounded-full shadow-2xl">
              {toast}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm z-10 flex flex-col items-center gap-3"
          >
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <TicketCard booking={booking} />

            {/* Quick Action Buttons */}
            <div className="flex gap-2.5 w-full mt-1">
              <Button
                size="sm"
                onClick={handleDownload}
                className="flex-1 rounded-full font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShare}
                className="flex-1 rounded-full font-bold border-white/20 text-white hover:bg-white/10 text-xs flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
