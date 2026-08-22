"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Archive, Trash2, X, AlertTriangle, Mic, Film, Download, Share2, Eye, CheckCircle2 } from 'lucide-react';
import { getBookings } from '@/lib/storage';
import { Booking } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { TicketModal } from '@/components/ticket/TicketModal';
import { useAuth } from '@/context/AuthContext';
import { ServerBooking } from '@/lib/serverBookingStore';
import { downloadTicketPdf } from '@/lib/pdfGenerator';
import { shareTicket } from '@/lib/ticketShare';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Soft remove confirmation modal state (Requirement 15)
  const [removeTarget, setRemoveTarget] = useState<Booking | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const stored = getBookings().filter((b) => b.status !== 'removed').reverse();
    setBookings(stored);

    // Fetch server bookings if logged in
    if (user?.id) {
      fetch(`/api/bookings?userId=${encodeURIComponent(user.id)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.bookings) && data.bookings.length > 0) {
            const mapped: Booking[] = data.bookings
              .filter((b: ServerBooking) => b.status !== 'removed')
              .map((b: ServerBooking) => ({
                id: b.id,
                movieId: b.movieId,
                movieTitle: b.movieTitle,
                theatre: b.theatreName,
                screen: b.screenName,
                date: b.date,
                time: b.time,
                seats: b.seatCodes,
                ticketCount: b.seatCodes.length,
                subtotal: b.pricing.subtotal,
                convenienceFee: b.pricing.bookingFee,
                total: b.pricing.grandTotal,
                status: b.status === 'archived' ? 'past' : 'upcoming',
                bookingDate: b.createdAt,
              }));
            setBookings(mapped);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [user?.id]);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'active') return b.status !== 'past';
    return b.status === 'past';
  });

  const openTicket = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDownload = async (booking: Booking) => {
    const customerName = user?.name || user?.email || user?.displayPhone || 'TicketX Customer';
    await downloadTicketPdf(booking, customerName);
  };

  const handleShare = async (booking: Booking) => {
    const res = await shareTicket(booking);
    if (res.success && res.method === 'clipboard') {
      setToastMessage('Booking details copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleArchive = (booking: Booking) => {
    const updated = bookings.map((b) => (b.id === booking.id ? { ...b, status: 'past' as const } : b));
    setBookings(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ticketx_bookings', JSON.stringify(updated));
    }

    if (user?.id) {
      fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', bookingId: booking.id, userId: user.id }),
      });
    }
  };

  const handleConfirmRemove = () => {
    if (!removeTarget) return;
    const targetId = removeTarget.id;
    const updated = bookings.filter((b) => b.id !== targetId);
    setBookings(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ticketx_bookings', JSON.stringify(updated));
    }

    if (user?.id) {
      fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', bookingId: targetId, userId: user.id }),
      });
    }

    setRemoveTarget(null);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/90 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold font-heading mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/30 rounded-2xl border border-white/5">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Ticket className="w-10 h-10 text-primary opacity-50" />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-2">No TicketX bookings yet.</h2>
            <p className="text-muted-foreground mb-8">Your next movie or live event pass starts here.</p>
            <div className="flex gap-3">
              <Button size="lg" className="rounded-full font-semibold px-8" asChild>
                <Link href="/movies">Explore Movies</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full font-semibold px-8 border-white/20 text-white" asChild>
                <Link href="/events">Explore Events</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* ACTIVE & ARCHIVED TABS */}
            <div className="flex bg-secondary p-1 rounded-xl w-full max-w-sm mb-10 border border-white/10 font-bold text-xs">
              <button
                className={`flex-1 px-4 py-2.5 rounded-lg transition-colors ${
                  activeTab === 'active' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('active')}
              >
                ACTIVE BOOKINGS
              </button>
              <button
                className={`flex-1 px-4 py-2.5 rounded-lg transition-colors ${
                  activeTab === 'archived' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('archived')}
              >
                ARCHIVED
              </button>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No {activeTab} bookings found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBookings.map((booking, i) => {
                  const isEventBooking = booking.id.includes('EV') || booking.movieTitle.includes('Freshers') || booking.movieTitle.includes('StarX');

                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-secondary/40 border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                              isEventBooking
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-primary/15 text-primary border-primary/30'
                            }`}
                          >
                            {isEventBooking ? <Mic className="w-3 h-3 text-amber-400" /> : <Film className="w-3 h-3 text-primary" />}
                            {isEventBooking ? 'EVENT PASS' : 'MOVIE TICKET'}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">{booking.id}</span>
                        </div>

                        <h3 className="text-xl font-bold font-heading mb-1 truncate text-white">{booking.movieTitle}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • {booking.time}
                        </p>

                        <div className="space-y-1.5 mb-6 text-sm">
                          <p><span className="text-muted-foreground">Venue/Cinema:</span> <span className="text-white font-medium">{booking.theatre}</span></p>
                          <p><span className="text-muted-foreground">Seats/Category:</span> <span className="text-white font-mono font-bold">{booking.seats.join(', ')}</span></p>
                          <p><span className="text-muted-foreground">Total Paid:</span> <span className="text-emerald-400 font-mono font-extrabold">₹{booking.total}</span></p>
                        </div>
                      </div>

                      {/* FULL 5-ACTION BAR: VIEW, DOWNLOAD, SHARE, ARCHIVE, DELETE (Requirements 14, 16, 44) */}
                      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/10 justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full bg-primary/10 border-primary/40 text-primary hover:bg-primary hover:text-white font-bold text-xs h-8 px-3"
                            onClick={() => openTicket(booking)}
                          >
                            <Eye className="w-3 h-3 mr-1" /> View Pass
                          </Button>

                          <button
                            onClick={() => handleDownload(booking)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold"
                          >
                            <Download className="w-3 h-3" /> Download
                          </button>

                          <button
                            onClick={() => handleShare(booking)}
                            className="text-xs text-gray-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 font-semibold"
                          >
                            <Share2 className="w-3 h-3" /> Share
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {activeTab === 'active' && (
                            <button
                              onClick={() => handleArchive(booking)}
                              className="text-xs text-muted-foreground hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                              title="Archive Booking"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setRemoveTarget(booking)}
                            className="text-xs text-destructive hover:text-red-400 p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
                            title="Delete Booking"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
      />

      {/* SOFT REMOVE CONFIRMATION MODAL (Requirement 15) */}
      <AnimatePresence>
        {removeTarget && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setRemoveTarget(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl z-10 text-center flex flex-col items-center"
            >
              <button
                onClick={() => setRemoveTarget(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold font-heading text-white mb-2">Delete this booking from My Bookings?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Remove pass for <span className="text-white font-bold">{removeTarget.movieTitle}</span> from your booking history?
              </p>

              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => setRemoveTarget(null)}
                  className="rounded-full w-full border-white/20 text-white"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmRemove}
                  className="rounded-full w-full font-bold"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
