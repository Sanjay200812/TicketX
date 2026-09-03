"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ticket, Eye, X, MapPin } from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { getAllBookings, AdminBooking } from '@/services/bookings.service';

import { createRefundRequest } from '@/services/refunds.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewBooking, setViewBooking] = useState<AdminBooking | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const { admin } = useAdminAuth();

  const loadBookings = async () => {
    setLoading(true);
    const data = await getAllBookings();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewBooking) return;
    setIsRefunding(true);

    await createRefundRequest(
      {
        bookingId: viewBooking.id,
        paymentId: viewBooking.paymentId || 'pay_simulated',
        amount: viewBooking.totalAmount,
        reason: refundReason || 'Admin requested cancellation refund',
      },
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );

    setIsRefunding(false);
    setShowRefundModal(false);
    setViewBooking(null);
    setRefundReason('');
    await loadBookings();
  };

  const columns: Column<AdminBooking>[] = [
    {
      header: 'Booking Ref',
      accessor: 'bookingRef',
      sortable: true,
      render: (b) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-white text-xs">{b.bookingRef}</div>
          <div className="text-[10px] text-gray-500 font-mono">{b.id}</div>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      sortable: true,
      render: (b) => (
        <div className="space-y-0.5 min-w-[140px]">
          <Link
            href={b.userId ? `/admin/users/${encodeURIComponent(b.userId)}` : `/admin/users`}
            className="font-bold text-white hover:text-primary transition-colors block"
          >
            {b.customerName}
          </Link>
          <div className="text-[11px] text-gray-400 font-mono">{b.customerPhone}</div>
        </div>
      ),

    },
    {
      header: 'Movie & Cinema',
      accessor: 'movieTitle',
      sortable: true,
      render: (b) => (
        <div className="space-y-0.5 min-w-[180px]">
          <div className="font-bold text-white truncate">{b.movieTitle}</div>
          <div className="text-[11px] text-gray-400 truncate">
            {b.theatreName} • {b.screenName}
          </div>
        </div>
      ),
    },
    {
      header: 'Show Schedule',
      accessor: 'showDate',
      sortable: true,
      render: (b) => (
        <div className="font-mono text-xs">
          <div className="text-gray-300 font-bold">{b.showDate}</div>
          <div className="text-primary text-[11px]">{b.showTime}</div>
        </div>
      ),
    },
    {
      header: 'Seats',
      accessor: 'seats',
      render: (b) => (
        <div className="flex flex-wrap gap-1 max-w-[120px]">
          {b.seats.map((s) => (
            <span
              key={s}
              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white"
            >
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      sortable: true,
      render: (b) => (
        <span className="font-mono font-bold text-emerald-400">
          ₹{b.totalAmount}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (b) => <AdminStatusBadge status={b.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setViewBooking(b)}
            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customer Bookings &amp; Tickets"
        description="Search customer reservations, verify digital tickets, and handle cancellations or refund releases."
      />

      {loading ? (
        <AdminLoader text="Loading customer reservations..." />
      ) : (
        <AdminDataTable
          data={bookings}
          columns={columns}
          keyExtractor={(b) => b.id}
          searchPlaceholder="Search by booking reference, name, phone, movie..."
          searchFields={['bookingRef', 'customerName', 'customerPhone', 'movieTitle', 'theatreName']}
          filters={[
            {
              label: 'Booking Status',
              key: 'status',
              options: [
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'Refunded', value: 'refunded' },
                { label: 'Expired', value: 'expired' },
              ],
            },
          ]}
          emptyIcon={Ticket}
          emptyTitle="No bookings found"
          emptyDescription="Customer seat bookings and payment reservations will appear here."
        />
      )}

      {/* Booking Detail Modal */}
      {viewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#16191f] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-primary font-bold uppercase">
                  Digital Ticket Summary
                </span>
                <h3 className="text-lg font-bold text-white font-mono">
                  {viewBooking.bookingRef}
                </h3>
              </div>
              <button
                onClick={() => setViewBooking(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Film & Theatre Details */}
            <div className="space-y-3">
              <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-2">
                <div className="text-base font-bold text-white">{viewBooking.movieTitle}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {viewBooking.theatreName} ({viewBooking.screenName})
                  </span>
                </div>
                <div className="text-xs font-mono text-gray-300 pt-1 flex items-center gap-3">
                  <span>Date: <strong>{viewBooking.showDate}</strong></span>
                  <span>Time: <strong className="text-primary">{viewBooking.showTime}</strong></span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1">
                  <span className="text-gray-500 font-mono text-[10px] uppercase">Customer</span>
                  <div className="font-bold text-white">{viewBooking.customerName}</div>
                  <div className="text-gray-400 font-mono">{viewBooking.customerPhone}</div>
                </div>

                <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1">
                  <span className="text-gray-500 font-mono text-[10px] uppercase">Amount &amp; Status</span>
                  <div className="font-bold text-emerald-400 font-mono text-sm">
                    ₹{viewBooking.totalAmount}
                  </div>
                  <AdminStatusBadge status={viewBooking.status} />
                </div>
              </div>

              {/* Seats */}
              <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
                <span className="text-gray-500 font-mono text-[10px] uppercase">
                  Allocated Seats ({viewBooking.seats.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {viewBooking.seats.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg bg-primary/20 border border-primary/40 text-primary font-mono font-bold text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              {viewBooking.status === 'confirmed' ? (
                <button
                  type="button"
                  onClick={() => setShowRefundModal(true)}
                  className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold"
                >
                  Initiate Refund
                </button>
              ) : (
                <span className="text-xs text-gray-500 font-mono">
                  {viewBooking.status === 'refunded' ? 'Refund already issued' : 'Ticket inactive'}
                </span>
              )}

              <button
                type="button"
                onClick={() => setViewBooking(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Initiation Dialog */}
      {showRefundModal && viewBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <form
            onSubmit={handleProcessRefund}
            className="w-full max-w-md bg-[#16191f] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">
              Refund ₹{viewBooking.totalAmount} to Customer?
            </h3>
            <p className="text-xs text-gray-400">
              This will release the reserved seats ({viewBooking.seats.join(', ')}) back to available inventory and log a payment refund request.
            </p>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Reason for Refund *
              </label>
              <textarea
                rows={2}
                required
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Customer cancelled show, auditorium air-conditioning failure"
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRefunding}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/25"
              >
                {isRefunding ? 'Refunding...' : 'Confirm & Issue Refund'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
