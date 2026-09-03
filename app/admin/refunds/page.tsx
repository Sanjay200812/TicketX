"use client";

import React, { useState, useEffect } from 'react';
import { RotateCcw, Plus } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { getAllRefunds, createRefundRequest } from '@/services/refunds.service';
import { RefundRecord } from '@/types/admin';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [amount, setAmount] = useState(250);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { admin } = useAdminAuth();

  const loadRefunds = async () => {
    setLoading(true);
    const data = await getAllRefunds();
    setRefunds(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId.trim() || amount <= 0) return;
    setSubmitting(true);

    await createRefundRequest(
      {
        bookingId: bookingId.trim(),
        paymentId: paymentId.trim() || 'pay_manual_refund',
        amount,
        reason: reason || 'Manual refund processed by admin',
      },
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );

    setSubmitting(false);
    setIsModalOpen(false);
    setBookingId('');
    setPaymentId('');
    setReason('');
    await loadRefunds();
  };

  const columns: Column<RefundRecord>[] = [
    {
      header: 'Refund ID & Gateway Ref',
      accessor: 'id',
      sortable: true,
      render: (r) => (
        <div className="space-y-0.5 min-w-[180px]">
          <div className="font-mono font-bold text-white text-xs">{r.id}</div>
          <div className="text-[10px] text-gray-500 font-mono">
            {r.gatewayRefundId || 'Simulated'}
          </div>
        </div>
      ),
    },
    {
      header: 'Booking ID',
      accessor: 'bookingId',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold text-primary text-xs">
          {r.bookingId}
        </span>
      ),
    },
    {
      header: 'Refund Amount',
      accessor: 'amount',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold text-rose-400 text-sm">
          ₹{r.amount}
        </span>
      ),
    },
    {
      header: 'Reason / Notes',
      accessor: 'reason',
      render: (r) => (
        <p className="text-xs text-gray-300 max-w-xs truncate" title={r.reason}>
          {r.reason}
        </p>
      ),
    },
    {
      header: 'Processed By',
      accessor: 'approvedBy',
      render: (r) => (
        <div className="text-[11px] font-mono text-gray-400">
          <div>Approved: {r.approvedBy || 'Admin'}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (r) => <AdminStatusBadge status={r.status} />,
    },
    {
      header: 'Processed Date',
      accessor: 'createdAt',
      sortable: true,
      render: (r) => (
        <span className="text-gray-400 font-mono text-[11px]">
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Refunds &amp; Cancellations"
        description="Review customer refund audit trails, issue cancellation refunds, and trace gateway reimbursements."
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Process New Refund</span>
          </button>
        }
      />

      {loading ? (
        <AdminLoader text="Loading refund logs..." />
      ) : (
        <AdminDataTable
          data={refunds}
          columns={columns}
          keyExtractor={(r) => r.id}
          searchPlaceholder="Search refunds by ID, booking ID, reason..."
          searchFields={['id', 'bookingId', 'reason', 'gatewayRefundId']}
          emptyIcon={RotateCcw}
          emptyTitle="No refunds recorded"
          emptyDescription="Processed cancellations and ticket reimbursement audits will be logged here."
        />
      )}

      {/* Manual Refund Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateRefund}
            className="w-full max-w-md bg-[#16191f] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">Manual Refund Processing</h3>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Booking ID or Reference *
              </label>
              <input
                type="text"
                required
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="e.g. BK_2026_09101 or TX-94821"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Payment ID
                </label>
                <input
                  type="text"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder="pay_rzp_..."
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Refund Reason *
              </label>
              <textarea
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explanation for auditing logs"
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/25"
              >
                {submitting ? 'Processing...' : 'Issue Refund'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
