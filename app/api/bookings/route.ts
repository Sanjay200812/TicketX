import { NextResponse } from 'next/server';
import { getUserBookings, archiveBooking, removeBooking } from '@/lib/serverBookingStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
  }

  const bookings = getUserBookings(userId);
  return NextResponse.json({ bookings }, { status: 200 });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, bookingId, userId } = body;

    if (!bookingId || !userId || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (action === 'archive') {
      const success = archiveBooking(bookingId, userId);
      return NextResponse.json({ success }, { status: success ? 200 : 404 });
    } else if (action === 'remove') {
      const success = removeBooking(bookingId, userId);
      return NextResponse.json({ success }, { status: success ? 200 : 404 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
  }
}
