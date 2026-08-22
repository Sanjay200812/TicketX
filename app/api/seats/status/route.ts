import { NextResponse } from 'next/server';
import { getShowSeatsStatus } from '@/lib/serverBookingStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showId = searchParams.get('showId');
  const userId = searchParams.get('userId') || undefined;

  if (!showId) {
    return NextResponse.json({ error: 'showId parameter is required' }, { status: 400 });
  }

  const { booked, held, myHeld } = getShowSeatsStatus(showId, userId);
  return NextResponse.json({ showId, booked, held, myHeld }, { status: 200 });
}
