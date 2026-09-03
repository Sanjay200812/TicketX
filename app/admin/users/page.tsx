"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { CustomerProfile } from '@/lib/serverUserStore';
import { LoginEvent } from '@/lib/serverActivityStore';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [metrics, setMetrics] = useState<{
    total: number;
    newToday: number;
    newThisWeek: number;
    activeNow: number;
  }>({ total: 0, newToday: 0, newThisWeek: 0, activeNow: 0 });
  const [recentLogins, setRecentLogins] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new_today' | 'active' | 'suspended' | 'has_bookings'>('all');
  const [sortField, setSortField] = useState<'newest' | 'logins' | 'bookings' | 'spent'>('newest');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
        if (data.metrics) setMetrics(data.metrics);
        if (data.recentLogins) setRecentLogins(data.recentLogins);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Sort
  const filteredCustomers = customers
    .filter((c) => {
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(term);
        const matchPhone = c.phone?.toLowerCase().includes(term);
        const matchUid = c.uid?.toLowerCase().includes(term);
        if (!matchName && !matchPhone && !matchUid) return false;
      }

      // Tab filter
      const nowMs = Date.now();
      const dayMs = 24 * 3600 * 1000;
      if (statusFilter === 'new_today') {
        return nowMs - new Date(c.createdAt).getTime() <= dayMs;
      }
      if (statusFilter === 'active') {
        return c.status === 'active';
      }
      if (statusFilter === 'suspended') {
        return c.status === 'suspended';
      }
      if (statusFilter === 'has_bookings') {
        return (c.totalBookings || 0) > 0;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortField === 'logins') return (b.loginCount || 0) - (a.loginCount || 0);
      if (sortField === 'bookings') return (b.totalBookings || 0) - (a.totalBookings || 0);
      if (sortField === 'spent') return (b.totalSpent || 0) - (a.totalSpent || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="TicketX Customers"
        description="Live customer directory, verified mobile identity, real-time login activity, and account status management."
      />

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#12141a]/95 border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Total Customers</span>
          <div className="text-2xl font-black font-heading text-white">{metrics.total}</div>
          <span className="text-[11px] text-emerald-400 font-mono">Mobile Verified</span>
        </div>

        <div className="bg-[#12141a]/95 border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">New Today</span>
          <div className="text-2xl font-black font-heading text-primary">+{metrics.newToday}</div>
          <span className="text-[11px] text-gray-400 font-mono">Past 24 hours</span>
        </div>

        <div className="bg-[#12141a]/95 border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">New This Week</span>
          <div className="text-2xl font-black font-heading text-sky-400">+{metrics.newThisWeek}</div>
          <span className="text-[11px] text-gray-400 font-mono">Past 7 days</span>
        </div>

        <div className="bg-[#12141a]/95 border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Active Recently</span>
          <div className="text-2xl font-black font-heading text-emerald-400">{metrics.activeNow}</div>
          <span className="text-[11px] text-emerald-400 font-mono">Past 5 mins</span>
        </div>
      </div>

      {/* RECENT CUSTOMER LOGINS WIDGET */}
      {recentLogins.length > 0 && (
        <div className="bg-[#12141a]/95 border border-white/10 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Recent Customer Logins</span>
            </h2>
            <span className="text-[10px] font-mono text-gray-500">Live Telemetry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentLogins.slice(0, 4).map((evt) => {
              const masked = evt.phone.length > 6
                ? `${evt.phone.slice(0, 5)}XXXX${evt.phone.slice(-3)}`
                : evt.phone;
              return (
                <div
                  key={evt.id}
                  className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate max-w-[120px]">{evt.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        evt.isNewUser
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {evt.isNewUser ? 'New User' : 'Returning'}
                    </span>
                  </div>
                  <div className="text-gray-400 text-[11px]">{masked}</div>
                  <div className="text-[10px] text-gray-500 pt-0.5">
                    {new Date(evt.loginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {evt.device}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEARCH, FILTERS & SORT */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12141a]/95 border border-white/10 p-3 rounded-2xl shadow-xl">
        {/* Search bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, UID..."
            className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 outline-none focus:border-primary transition-colors font-mono"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'new_today', label: 'New Today' },
              { id: 'active', label: 'Active' },
              { id: 'suspended', label: 'Suspended' },
              { id: 'has_bookings', label: 'Has Bookings' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as 'newest' | 'logins' | 'bookings' | 'spent')}
          className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-black/40 border border-white/10 text-white outline-none focus:border-primary shrink-0"
        >

          <option value="newest">Newest First</option>
          <option value="logins">Most Logins</option>
          <option value="bookings">Most Bookings</option>
          <option value="spent">Highest Spend</option>
        </select>
      </div>

      {/* CUSTOMERS TABLE */}
      {loading ? (
        <AdminLoader text="Loading customer accounts..." />
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-[#12141a]/90 border border-white/10 rounded-3xl p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-gray-500 mx-auto" />
          <h2 className="text-base font-bold text-white font-heading">No Customers Found</h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchTerm
              ? 'No registered customers match your current search query.'
              : 'New TicketX customers will appear here after they verify their mobile number.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#12141a]/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/50 text-gray-400 uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Mobile Phone</th>
                  <th className="p-4">Logins</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4">Bookings</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredCustomers.map((cust) => {
                  const masked = cust.phone
                    ? cust.phone.length > 6
                      ? `${cust.phone.slice(0, 5)}XXXX${cust.phone.slice(-3)}`
                      : cust.phone
                    : '—';

                  const isActiveNow =
                    Date.now() - new Date(cust.lastActiveAt).getTime() <= 5 * 60 * 1000;

                  return (
                    <tr key={cust.uid} className="hover:bg-white/5 transition-colors group">
                      {/* Customer Photo & Name */}
                      <td className="p-4">
                        <Link
                          href={`/admin/users/${encodeURIComponent(cust.uid)}`}
                          className="flex items-center gap-3 group-hover:text-primary transition-colors"
                        >
                          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-xs shrink-0 overflow-hidden">
                            {cust.photoURL ? (
                              <img src={cust.photoURL} alt={cust.name} className="w-full h-full object-cover" />
                            ) : (
                              cust.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-primary transition-colors">
                              {cust.name}
                            </div>
                            <span className="text-[10px] text-gray-500 truncate block max-w-[120px]">
                              {cust.uid}
                            </span>
                          </div>
                        </Link>
                      </td>

                      {/* Phone */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-gray-300 font-bold">
                          <span>{masked}</span>
                          {cust.phoneVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>
                      </td>

                      {/* Logins */}
                      <td className="p-4 text-primary font-bold">
                        {cust.loginCount || 1} logins
                      </td>

                      {/* Last Active */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActiveNow ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
                            }`}
                          />
                          <span className="text-gray-400 text-[11px]">
                            {cust.lastActiveAt
                              ? new Date(cust.lastActiveAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Recently'}
                          </span>
                        </div>
                      </td>

                      {/* Bookings */}
                      <td className="p-4">
                        <span className="font-bold text-white">
                          {cust.totalBookings || 0}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="p-4 font-bold text-emerald-400">
                        ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                            cust.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : cust.status === 'suspended'
                              ? 'bg-red-500/15 text-red-400 border-red-500/30'
                              : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                          }`}
                        >
                          {cust.status}
                        </span>
                      </td>

                      {/* Detail Link */}
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/users/${encodeURIComponent(cust.uid)}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-primary hover:text-white border border-white/10 text-gray-300 font-bold transition-all text-xs"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
