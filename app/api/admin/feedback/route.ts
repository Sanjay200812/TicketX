import { NextResponse } from 'next/server';
import { getFeedbackRecords } from '@/lib/serverFeedbackStore';
import { getCurrentAdmin } from '@/lib/admin/auth';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const records = getFeedbackRecords();

    // Baseline sample feedback if empty
    const feedbackList =
      records.length > 0
        ? records
        : [
            {
              id: 'fb_101',
              type: 'Booking Experience',
              rating: 5,
              title: 'Super smooth booking flow!',
              message: 'Loved the 6-digit OTP login and instant ticket download on mobile. Very fast checkout.',
              createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
            },
            {
              id: 'fb_102',
              type: 'Theatre Facility',
              rating: 4,
              title: 'Great recliner seats at VMax',
              message: 'Audio and projection were fantastic. Snacks counter had a small queue, but overall great.',
              createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            },
          ];

    return NextResponse.json({ success: true, feedback: feedbackList });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch feedback';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
