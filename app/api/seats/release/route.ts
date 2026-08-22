import { NextResponse } from 'next/server';
import { releaseHold, abandonHold } from '@/lib/serverBookingStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { holdId, userId, action } = body;

    if (holdId) {
      if (action === 'abandon' && userId) {
        // Transition to 5-minute abandoned grace period (Requirement 12)
        const res = abandonHold(holdId, userId);
        return NextResponse.json({ success: true, expiresAt: res.expiresAt }, { status: 200 });
      } else {
        // Immediate release (Requirement 13)
        releaseHold(holdId);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error releasing/abandoning hold:', error);
    return NextResponse.json({ error: 'Failed to update seat hold' }, { status: 500 });
  }
}
