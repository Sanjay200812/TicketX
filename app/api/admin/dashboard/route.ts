import { NextResponse } from 'next/server';
import { getAllStoredCustomers, getCustomerMetrics } from '@/lib/serverUserStore';
import { getRecentLoginEvents } from '@/lib/serverActivityStore';
import { movies } from '@/data/movies';
import { theatres } from '@/data/theatres';
import { events } from '@/data/events';
import { shows } from '@/data/shows';
import { getAllVenueRegistrations } from '@/lib/serverVenueStore';

import { getContactSubmissions } from '@/lib/serverContactStore';
import { getFeedbackRecords } from '@/lib/serverFeedbackStore';
import { getRecentAuditLogs } from '@/services/audit.service';
import { getCurrentAdmin } from '@/lib/admin/auth';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const customers = getAllStoredCustomers();
    const customerMetrics = getCustomerMetrics();
    const recentLogins = getRecentLoginEvents(10);

    // Compute Customer Growth / Periods
    const nowMs = Date.now();
    const dayMs = 24 * 3600 * 1000;
    const weekMs = 7 * dayMs;
    const monthMs = 30 * dayMs;

    const newToday = customers.filter((c) => nowMs - new Date(c.createdAt).getTime() <= dayMs).length;
    const newThisWeek = customers.filter((c) => nowMs - new Date(c.createdAt).getTime() <= weekMs).length;
    const newThisMonth = customers.filter((c) => nowMs - new Date(c.createdAt).getTime() <= monthMs).length;

    // Daily breakdown for registration charts (past 7 days, 30 days)
    const dailyRegistrations7d: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(nowMs - i * dayMs);
      const dateStr = d.toISOString().split('T')[0];
      const count = customers.filter((c) => c.createdAt.startsWith(dateStr)).length;
      dailyRegistrations7d.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        count,
      });
    }

    // Transaction & Store Aggregations
    const venueRequests = getAllVenueRegistrations();
    const pendingVenues = venueRequests.filter((v) => v.status === 'pending').length;

    const contacts = getContactSubmissions();
    const openSupport = contacts.filter((c) => c.status !== 'resolved').length;

    const feedback = getFeedbackRecords();

    const auditLogs = await getRecentAuditLogs(6).catch(() => []);

    // Movies stats
    const totalMovies = movies.length;
    const publishedMovies = movies.filter((m) => m.status === 'now_showing' || m.status === 'upcoming').length;

    return NextResponse.json({
      success: true,
      stats: {
        // Customer Cards
        totalCustomers: customers.length,
        newCustomersToday: newToday,
        newCustomersThisWeek: newThisWeek,
        newCustomersThisMonth: newThisMonth,
        activeCustomersNow: customerMetrics.activeNow,
        activeCustomersToday: customerMetrics.activeToday,

        // Content Cards
        totalMovies,
        publishedMovies,
        activeEvents: events.length,
        activeTheatres: theatres.length,
        showsToday: shows.length,

        // Transaction Cards
        totalBookings: 6,
        bookingsToday: 2,
        revenueToday: 880,
        totalRevenue: 2840,
        pendingRefunds: 0,

        // Operations Cards
        pendingVenueApplications: pendingVenues,
        openSupportTickets: openSupport,
        recentFeedbackCount: feedback.length,
      },
      growth: {
        today: newToday,
        thisWeek: newThisWeek,
        thisMonth: newThisMonth,
      },
      chart7d: dailyRegistrations7d,
      recentCustomers: customers.slice(0, 5),
      recentLogins,
      recentAuditLogs: auditLogs,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to aggregate dashboard data';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
