"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Film,
  Calendar,
  Building2,
  Clock,
  Ticket,
  DollarSign,
  Store,
  Headphones,
  Sparkles,
  Plus,
  TrendingUp,
  History,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Flame,
} from 'lucide-react';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { CustomerProfile } from '@/lib/serverUserStore';
import { LoginEvent } from '@/lib/serverActivityStore';
import { AuditLogEntry } from '@/types/admin';

interface DashboardStats {
  totalCustomers: number;
  newCustomersToday: number;
  newCustomersThisWeek: number;
  newCustomersThisMonth: number;
  activeCustomersNow: number;
  activeCustomersToday: number;
  totalMovies: number;
  publishedMovies: number;
  activeEvents: number;
  activeTheatres: number;
  showsToday: number;
  totalBookings: number;
  bookingsToday: number;
  revenueToday: number;
  totalRevenue: number;
  pendingRefunds: number;
  pendingVenueApplications: number;
  openSupportTickets: number;
}

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    newCustomersToday: 0,
    newCustomersThisWeek: 0,
    newCustomersThisMonth: 0,
    activeCustomersNow: 0,
    activeCustomersToday: 0,

    totalMovies: 0,
    publishedMovies: 0,
    activeEvents: 0,
    activeTheatres: 0,
    showsToday: 0,
    totalBookings: 0,
    bookingsToday: 0,
    revenueToday: 0,
    totalRevenue: 0,
    pendingRefunds: 0,
    pendingVenueApplications: 0,
    openSupportTickets: 0,
  });

  const [growth, setGrowth] = useState({ today: 0, thisWeek: 0, thisMonth: 0 });
  const [chartData, setChartData] = useState<{ date: string; count: number }[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  const [recentCustomers, setRecentCustomers] = useState<CustomerProfile[]>([]);
  const [recentLogins, setRecentLogins] = useState<LoginEvent[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();
        if (data.success) {
          if (data.stats) setStats(data.stats);
          if (data.growth) setGrowth(data.growth);
          if (data.chart7d) setChartData(data.chart7d);
          if (data.recentCustomers) setRecentCustomers(data.recentCustomers);
          if (data.recentLogins) setRecentLogins(data.recentLogins);
          if (data.recentAuditLogs) setRecentAuditLogs(data.recentAuditLogs);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <AdminLoader text="Aggregating live TicketX metrics..." />;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#1a1c24] via-[#14161c] to-[#0f1115] border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-full bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/30 uppercase">
              <Sparkles className="w-3 h-3" />
              <span>Super Admin Command Deck</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-heading text-white">
              Welcome, {admin?.name || 'Super Admin'}
            </h1>
            <p className="text-xs md:text-sm text-gray-400">
              Real-time platform metrics across customers, catalog, screenings, and revenue transactions.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Manage Customers</span>
            </Link>
            <Link
              href="/admin/movies/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Movie</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 1: CUSTOMER & AUDIENCE KPIS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>Customer &amp; Audience Telemetry</span>
          </h2>
          <Link href="/admin/users" className="text-xs text-primary font-mono hover:underline flex items-center gap-1">
            <span>View All Customers</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <AdminStatCard
            title="Total Customers"
            value={stats.totalCustomers}
            subtitle="Verified mobile users"
            icon={Users}
            tone="default"
          />
          <AdminStatCard
            title="New Customers Today"
            value={`+${stats.newCustomersToday}`}
            subtitle="Registered past 24 hrs"
            icon={Flame}
            tone="primary"
          />
          <AdminStatCard
            title="New This Week"
            value={`+${stats.newCustomersThisWeek}`}
            subtitle="Registered past 7 days"
            icon={TrendingUp}
            tone="default"
          />
          <AdminStatCard
            title="Active Customers"
            value={stats.activeCustomersNow}
            subtitle="Online recently"
            icon={CheckCircle2}
            tone="emerald"
          />
        </div>
      </div>

      {/* SECTION 2: CUSTOMER ANALYTICS & GROWTH CHART */}
      <div className="bg-[#12141a]/95 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Customer Registrations Analytics</span>
            </h3>
            <p className="text-xs text-gray-400">
              Actual Firestore customer registration timestamps plotted by period.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Growth Badges */}
            <div className="hidden sm:flex items-center gap-2 mr-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Today +{growth.today}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                Week +{growth.thisWeek}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                Month +{growth.thisMonth}
              </span>
            </div>

            {/* Period selector */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-mono">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setChartPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    chartPeriod === p
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="space-y-2">
          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 bg-black/30 rounded-2xl border border-white/5">
            {chartData.map((item, idx) => {
              const maxCount = Math.max(...chartData.map((d) => d.count), 5);
              const heightPercent = Math.max((item.count / maxCount) * 100, 12);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-gray-400 group-hover:text-primary transition-colors font-bold">
                    {item.count}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-primary/40 to-primary group-hover:to-primary/80 transition-all shadow-md shadow-primary/10"
                  />
                  <span className="text-[9px] font-mono text-gray-500 truncate w-full text-center group-hover:text-gray-300">
                    {item.date.split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: CATALOG & CINEMA KPIS */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Film className="w-4 h-4 text-sky-400" />
          <span>Catalog &amp; Cinema Operations</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          <AdminStatCard
            title="Total Movies"
            value={stats.totalMovies}
            subtitle="Catalog titles"
            icon={Film}
            tone="default"
          />
          <AdminStatCard
            title="Published Movies"
            value={stats.publishedMovies}
            subtitle="Now showing / upcoming"
            icon={Sparkles}
            tone="primary"
          />
          <AdminStatCard
            title="Active Events"
            value={stats.activeEvents}
            subtitle="Concerts & shows"
            icon={Calendar}
            tone="default"
          />
          <AdminStatCard
            title="Active Theatres"
            value={stats.activeTheatres}
            subtitle="Cinema locations"
            icon={Building2}
            tone="default"
          />
          <AdminStatCard
            title="Shows Today"
            value={stats.showsToday}
            subtitle="Scheduled screenings"
            icon={Clock}
            tone="default"
          />
        </div>
      </div>

      {/* SECTION 4: TRANSACTIONS & OPERATIONS KPIS */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Ticket className="w-4 h-4 text-emerald-400" />
          <span>Transactions &amp; Operations</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          <AdminStatCard
            title="Bookings Today"
            value={stats.bookingsToday}
            subtitle="Orders placed"
            icon={Ticket}
            tone="emerald"
          />
          <AdminStatCard
            title="Revenue Today"
            value={`₹${stats.revenueToday.toLocaleString('en-IN')}`}
            subtitle="Razorpay test gross"
            icon={DollarSign}
            tone="emerald"
          />
          <AdminStatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
            subtitle="Lifetime platform gross"
            icon={DollarSign}
            tone="emerald"
          />
          <AdminStatCard
            title="Pending Venue Requests"
            value={stats.pendingVenueApplications}
            subtitle="Requires review"
            icon={Store}
            tone={stats.pendingVenueApplications > 0 ? 'amber' : 'default'}
          />
          <AdminStatCard
            title="Open Support Tickets"
            value={stats.openSupportTickets}
            subtitle="Inquiries awaiting reply"
            icon={Headphones}
            tone={stats.openSupportTickets > 0 ? 'amber' : 'default'}
          />
        </div>
      </div>

      {/* SECTION 5: TABLES (RECENT CUSTOMERS & RECENT LOGINS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="bg-[#12141a]/95 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm text-white font-heading flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Recent Customers</span>
            </h3>
            <Link href="/admin/users" className="text-xs text-primary font-mono hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {recentCustomers.map((cust) => {
              const masked = cust.phone
                ? cust.phone.length > 6
                  ? `${cust.phone.slice(0, 5)}XXXX${cust.phone.slice(-3)}`
                  : cust.phone
                : '—';
              return (
                <div key={cust.uid} className="py-3 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <Link
                        href={`/admin/users/${encodeURIComponent(cust.uid)}`}
                        className="font-bold text-white hover:text-primary transition-colors block"
                      >
                        {cust.name}
                      </Link>
                      <span className="text-[11px] text-gray-500">{masked}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">₹{cust.totalSpent || 0}</div>
                    <span className="text-[10px] text-gray-500">{cust.loginCount || 1} logins</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Customer Logins */}
        <div className="bg-[#12141a]/95 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm text-white font-heading flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Recent Customer Logins</span>
            </h3>
            <span className="text-[10px] font-mono text-gray-500">Live Phone Auth</span>
          </div>

          <div className="divide-y divide-white/5">
            {recentLogins.map((evt) => {
              const masked = evt.phone.length > 6
                ? `${evt.phone.slice(0, 5)}XXXX${evt.phone.slice(-3)}`
                : evt.phone;
              return (
                <div key={evt.id} className="py-3 flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{evt.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          evt.isNewUser
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {evt.isNewUser ? 'New User' : 'Returning'}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500">{masked} • {evt.device}</span>
                  </div>
                  <div className="text-right text-gray-400 text-[11px]">
                    {new Date(evt.loginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 6: RECENT AUDIT LOGS */}
      {recentAuditLogs.length > 0 && (
        <div className="bg-[#12141a]/95 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm text-white font-heading flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Recent Administrative Actions</span>
            </h3>
            <Link href="/admin/audit-logs" className="text-xs text-primary font-mono hover:underline">
              Full Audit Trail
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary text-[11px]">{log.action}</span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">{log.summary}</p>
                <span className="text-[10px] text-gray-500 block pt-1">By: {log.adminName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
