"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Archive, ArchiveRestore, Trash2, X, AlertTriangle, Mic, Film, Download, Share2, Eye, CheckCircle2 } from 'lucide-react';
import { subscribeUserBookings, archiveUserBooking, deleteUserBooking } from '@/lib/storage';
import { Booking } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { TicketModal } from '@/components/ticket/TicketModal';
import { TicketXHeading } from '@/components/shared/TicketXHeading';
import { useAuth } from '@/context/AuthContext';
import { downloadTicketJpg, shareTicketJpg } from '@/lib/ticketExport';

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  // EXACTLY TWO TABS: 1. BOOKINGS, 2. ARCHIVED (Requirements 5, 21, 22, 23, 24)
  const [activeTab, setActiveTab] = useState<'bookings' | 'archived'>('bookings');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);

  useEffect(() => {
    setIsMounted(true);

    if (!user?.uid) {
      setBookings([]);
      return;
    }

    const unsub = subscribeUserBookings(user.uid, (data) => {
      setBookings(data);
    });

    return () => {
      if (unsub) unsub();
    };
  }, [user?.uid]);

  // Tab Filtering: BOOKINGS (all non-archived) vs ARCHIVED
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'archived') {
      return Boolean(b.archived);
    }
    return !b.archived;
  });

  const openTicket = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDownload = async (booking: Booking) => {
    const ok = await downloadTicketJpg(booking);
    if (ok) {
      setToastMessage('Ticket downloaded successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage('Unable to download ticket. Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleShare = async (booking: Booking) => {
    const res = await shareTicketJpg(booking);
    if (res.success && res.method === 'clipboard') {
      setToastMessage('Booking details copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    } else if (res.success && res.method === 'download') {
      setToastMessage('Ticket downloaded!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleToggleArchive = async (booking: Booking) => {
    if (!user?.uid) return;
    const newStatus = !booking.archived;
    await archiveUserBooking(user.uid, booking.id, newStatus);
    setToastMessage(newStatus ? 'Booking moved to Archived' : 'Booking restored to Bookings');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !user?.uid) return;
    await deleteUserBooking(user.uid, deleteTarget.id);
    setDeleteTarget(null);
    setToastMessage('Booking deleted');
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!isMounted || authLoading) return null;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/95 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="mb-8">
          <TicketXHeading
            subtitle="Manage your confirmed movie passes and event admissions."
            size="lg"
          >
            My Bookings
          </TicketXHeading>
        </div>

        {/* EXACTLY TWO TABS: BOOKINGS | ARCHIVED */}
        <div className="flex bg-secondary p-1 rounded-2xl w-full max-w-xs mb-10 border border-white/10 font-bold text-xs shadow-lg">
          <button
            type="button"
            className={`flex-1 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'bookings' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            BOOKINGS
          </button>
          <button
            type="button"
            className={`flex-1 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'archived' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('archived')}
          >
            ARCHIVED
          </button>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/30 rounded-3xl border border-white/5 shadow-xl">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Ticket className="w-10 h-10 text-primary opacity-50" />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-2">No {activeTab} found.</h2>
            <p className="text-muted-foreground mb-8 text-sm">Your movie passes and event tickets will appear here.</p>
            <div className="flex gap-3">
              <Button size="lg" className="rounded-full font-semibold px-8 text-xs" asChild>
                <Link href="/movies">Explore Movies</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full font-semibold px-8 border-white/20 text-white text-xs" asChild>
                <Link href="/events">Explore Events</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBookings.map((booking, i) => {
              const isEventBooking = booking.id.includes('EV') || (booking.movieTitle && (booking.movieTitle.includes('Freshers') || booking.movieTitle.includes('StarX') || booking.movieTitle.includes('Aakash') || booking.movieTitle.includes('Marriage')));

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-secondary/40 border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden backdrop-blur-xl"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 font-mono ${
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
                    <p className="text-sm text-muted-foreground mb-4 font-medium">
                      {booking.movieLanguage && <span className="text-gray-300 font-semibold">{booking.movieLanguage} • </span>}
                      {new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • {booking.time}
                    </p>

                    <div className="space-y-1.5 mb-6 text-xs font-mono">
                      <p><span className="text-muted-foreground">Venue:</span> <span className="text-white font-medium">{booking.theatre}</span></p>
                      <p><span className="text-muted-foreground">Seats:</span> <span className="text-white font-bold">{booking.seats.join(', ')}</span></p>
                      <p><span className="text-muted-foreground">Paid:</span> <span className="text-emerald-400 font-extrabold">₹{booking.total}</span></p>
                    </div>
                  </div>

                  {/* ACTION BAR: VIEW TICKET, DOWNLOAD TICKET, SHARE, ARCHIVE/UNARCHIVE, DELETE */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/10 justify-between">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full bg-primary/10 border-primary/40 text-primary hover:bg-primary hover:text-white font-bold text-xs h-8 px-3 cursor-pointer"
                        onClick={() => openTicket(booking)}
                      >
                        <Eye className="w-3 h-3 mr-1" /> View Ticket
                      </Button>

                      <button
                        type="button"
                        onClick={() => handleDownload(booking)}
                        className="text-xs text-white hover:bg-primary/90 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary font-bold transition-colors shadow-sm cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> Download Ticket
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(booking)}
                        className="text-xs text-gray-300 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 font-semibold cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" /> Share
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleArchive(booking)}
                        className="text-xs text-muted-foreground hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                        title={booking.archived ? 'Unarchive Booking' : 'Archive Booking'}
                      >
                        {booking.archived ? (
                          <>
                            <ArchiveRestore className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[10px] text-amber-400">Unarchive</span>
                          </>
                        ) : (
                          <Archive className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(booking)}
                        className="text-xs text-destructive hover:text-red-400 p-1.5 rounded-full hover:bg-destructive/10 transition-colors cursor-pointer"
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
      </div>

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
      />

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
              onClick={() => setDeleteTarget(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl z-10 text-center flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold font-heading text-white mb-2">Delete this booking?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Remove pass for <span className="text-white font-bold">{deleteTarget.movieTitle}</span> permanently from your account?
              </p>

              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-full w-full border-white/20 text-white cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  className="rounded-full w-full font-bold cursor-pointer"
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
