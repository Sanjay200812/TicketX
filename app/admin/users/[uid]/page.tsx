"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  Ticket,
  AlertTriangle,
  CheckCircle2,
  Ban,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { CustomerProfile } from '@/lib/serverUserStore';
import { ServerBooking } from '@/lib/serverBookingStore';
import { LoginEvent } from '@/lib/serverActivityStore';

export default function CustomerDetailPage({ params }: { params: { uid: string } }) {
  const { uid } = params;


  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [summary, setSummary] = useState<{
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    upcomingBookings: number;
    totalSpent: number;
    refundedAmount: number;
  } | null>(null);
  const [bookings, setBookings] = useState<ServerBooking[]>([]);
  const [activity, setActivity] = useState<LoginEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Masked phone toggle
  const [showFullPhone, setShowFullPhone] = useState(false);

  // Status modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'active' | 'suspended' | 'disabled'>('active');
  const [statusLoading, setStatusLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(uid)}`);
      if (!res.ok) {
        throw new Error('Customer profile not found');
      }
      const data = await res.json();
      if (data.success) {
        setCustomer(data.customer);
        setSummary(data.summary);
        setBookings(data.bookings || []);
        setActivity(data.activity || []);
      } else {
        setError(data.error || 'Failed to load customer');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not load customer';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [uid]);

  const handleStatusChange = async () => {
    if (!customer) return;
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(uid)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: pendingStatus, name: customer.name }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomer((prev) => (prev ? { ...prev, status: pendingStatus } : null));
        setShowStatusModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return <AdminLoader text="Loading customer details..." />;
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
        <div className="p-8 rounded-3xl bg-secondary/30 border border-white/10 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Customer Not Found</h2>
          <p className="text-xs text-gray-400">{error || 'The requested customer profile could not be located.'}</p>
        </div>
      </div>
    );
  }

  const maskedPhone = customer.phone
    ? customer.phone.length > 6
      ? `${customer.phone.slice(0, 5)}XXXXXX${customer.phone.slice(-3)}`
      : customer.phone
    : 'Not available';

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>

        <div className="flex items-center gap-2">
          {customer.status === 'active' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPendingStatus('suspended');
                setShowStatusModal(true);
              }}
              className="rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-xs gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Suspend Customer</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setPendingStatus('active');
                setShowStatusModal(true);
              }}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reactivate Customer</span>
            </Button>
          )}
        </div>
      </div>

      {/* SECTION 1: CUSTOMER PROFILE HERO */}
      <div className="bg-[#12141a]/95 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-xl overflow-hidden shrink-0">
              {customer.photoURL ? (
                <img src={customer.photoURL} alt={customer.name} className="w-full h-full object-cover" />
              ) : (
                customer.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold font-heading text-white">{customer.name}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${
                    customer.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : customer.status === 'suspended'
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                  }`}
                >
                  {customer.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-400">
                <span className="text-gray-500">UID: {customer.uid}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Mobile Verified
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-black/40 px-4 py-3 rounded-2xl border border-white/5">
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase block">Phone Number</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-white">
                  {showFullPhone ? customer.phone : maskedPhone}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullPhone(!showFullPhone)}
                  className="text-gray-400 hover:text-white p-1"
                  title={showFullPhone ? 'Hide full phone' : 'Show full phone (Admin only)'}
                >
                  {showFullPhone ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile attributes grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs font-mono">
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">Gender</span>
            <span className="text-white font-bold">{customer.gender || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">Date of Birth</span>
            <span className="text-white font-bold">{customer.dob || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">Account Created</span>
            <span className="text-white font-bold">
              {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">Total Logins</span>
            <span className="text-primary font-bold">{customer.loginCount || 1} logins</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: STATS SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#12141a]/95 border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Total Bookings</span>
          <div className="text-2xl font-black font-heading text-white">{summary?.totalBookings || 0}</div>
          <span className="text-[11px] text-emerald-400 font-mono">
            {summary?.completedBookings || 0} Confirmed
          </span>
        </div>

        <div className="bg-[#12141a]/95 border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Total Spend</span>
          <div className="text-2xl font-black font-heading text-emerald-400">
            ₹{summary?.totalSpent?.toLocaleString('en-IN') || 0}
          </div>
          <span className="text-[11px] text-gray-400 font-mono">Lifetime Gross</span>
        </div>

        <div className="bg-[#12141a]/95 border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Last Login</span>
          <div className="text-sm font-bold font-mono text-white mt-1 truncate">
            {customer.lastLoginAt
              ? new Date(customer.lastLoginAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Recently'}
          </div>
          <span className="text-[11px] text-primary font-mono">OTP Phone Auth</span>
        </div>

        <div className="bg-[#12141a]/95 border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Last Active</span>
          <div className="text-sm font-bold font-mono text-white mt-1 truncate">
            {customer.lastActiveAt
              ? new Date(customer.lastActiveAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Recently'}
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">Realtime heartbeat</span>
        </div>
      </div>

      {/* SECTION 3: RECENT BOOKINGS */}
      <div className="bg-[#12141a]/95 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="font-bold text-base text-white font-heading flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" />
            <span>Booking History ({bookings.length})</span>
          </h2>
        </div>

        {bookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 font-mono">
            No ticket bookings found for this customer yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-gray-400 uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Movie</th>
                  <th className="p-3">Theatre &amp; Screen</th>
                  <th className="p-3">Show Date</th>
                  <th className="p-3">Seats</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white">{b.id}</td>
                    <td className="p-3 text-gray-200">{b.movieTitle}</td>
                    <td className="p-3 text-gray-400">{b.theatreName} • {b.screenName}</td>
                    <td className="p-3 text-gray-400">{b.date} {b.time}</td>
                    <td className="p-3 text-primary font-bold">{b.seatCodes.join(', ')}</td>
                    <td className="p-3 text-emerald-400 font-bold">₹{b.pricing.grandTotal}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 4: LOGIN & ACCOUNT ACTIVITY TIMELINE */}
      <div className="bg-[#12141a]/95 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
        <h2 className="font-bold text-base text-white font-heading flex items-center gap-2 border-b border-white/10 pb-3">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Account Activity Timeline</span>
        </h2>

        {activity.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 font-mono">
            No recent login events recorded for this customer.
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{evt.isNewUser ? 'First-Time Registration & Login' : 'Customer Phone OTP Login'}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 uppercase">
                      {evt.device}
                    </span>
                  </div>
                  <span className="text-gray-500 text-[11px]">
                    Method: {evt.loginMethod} OTP authentication
                  </span>
                </div>
                <span className="text-gray-400">
                  {new Date(evt.loginAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STATUS CHANGE MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161920] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">
              {pendingStatus === 'suspended' ? 'Suspend Customer Account?' : 'Reactivate Customer Account?'}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {pendingStatus === 'suspended'
                ? `Suspending "${customer.name}" will temporarily block booking and checkout privileges.`
                : `Reactivating "${customer.name}" will restore complete ticket booking privileges.`}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowStatusModal(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleStatusChange}
                disabled={statusLoading}
                className={`rounded-xl font-bold ${
                  pendingStatus === 'suspended' ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {statusLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
