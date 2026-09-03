"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { getAllPayments, AdminPaymentTransaction } from '@/services/payments.service';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    setLoading(true);
    const data = await getAllPayments();
    setPayments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const totalCaptured = payments
    .filter((p) => p.status === 'captured')
    .reduce((sum, p) => sum + p.amount, 0);

  const columns: Column<AdminPaymentTransaction>[] = [
    {
      header: 'Transaction ID & Gateway',
      accessor: 'id',
      sortable: true,
      render: (p) => (
        <div className="space-y-0.5 min-w-[200px]">
          <div className="font-mono font-bold text-white text-xs">{p.id}</div>
          <div className="text-[10px] text-gray-500 font-mono">
            {p.gateway} • {p.gatewayTransactionId}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      sortable: true,
      render: (p) => (
        <div className="space-y-0.5">
          <div className="font-bold text-gray-200">{p.customerName}</div>
          <div className="text-[11px] text-gray-400 font-mono">{p.customerEmail}</div>
        </div>
      ),
    },
    {
      header: 'Booking Ref',
      accessor: 'bookingRef',
      sortable: true,
      render: (p) => (
        <span className="font-mono font-bold text-primary text-xs">
          {p.bookingRef}
        </span>
      ),
    },
    {
      header: 'Method',
      accessor: 'method',
      sortable: true,
      render: (p) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-gray-300">
          {p.method}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      sortable: true,
      render: (p) => (
        <span className="font-mono font-bold text-emerald-400 text-sm">
          ₹{p.amount}
        </span>
      ),
    },
    {
      header: 'Gateway Status',
      accessor: 'status',
      sortable: true,
      render: (p) => <AdminStatusBadge status={p.status} />,
    },
    {
      header: 'Date & Time',
      accessor: 'createdAt',
      sortable: true,
      render: (p) => (
        <span className="text-gray-400 font-mono text-[11px]">
          {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payment Gateway Transactions"
        description="Monitor online payments, Razorpay checkouts, UPI intents, and settled cinema revenues."
        actions={
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">Net Settled:</span>
            <span className="text-sm font-mono font-bold text-emerald-400">₹{totalCaptured}</span>
          </div>
        }
      />

      {loading ? (
        <AdminLoader text="Loading payment transactions..." />
      ) : (
        <AdminDataTable
          data={payments}
          columns={columns}
          keyExtractor={(p) => p.id}
          searchPlaceholder="Search by transaction ID, customer, booking reference..."
          searchFields={['id', 'customerName', 'customerEmail', 'bookingRef', 'method']}
          filters={[
            {
              label: 'Status',
              key: 'status',
              options: [
                { label: 'Captured', value: 'captured' },
                { label: 'Refunded', value: 'refunded' },
                { label: 'Failed', value: 'failed' },
              ],
            },
          ]}
          emptyIcon={CreditCard}
          emptyTitle="No payments recorded"
          emptyDescription="Online transactions processed via Razorpay gateway will appear here."
        />
      )}
    </div>
  );
}
