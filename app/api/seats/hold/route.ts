import { NextResponse } from 'next/server';
import { holdSeats } from '@/lib/serverBookingStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { showId, seatCodes, userId } = body;

    if (!showId || !Array.isArray(seatCodes) || seatCodes.length === 0 || !userId) {
      return NextResponse.json({ error: 'Missing required parameters: showId, seatCodes, userId' }, { status: 400 });
    }

    const result = holdSeats(showId, seatCodes, userId);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Some of your selected seats were just reserved by another customer.',
          unavailableSeats: result.unavailableSeats,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error holding seats:', error);
    return NextResponse.json({ error: 'Failed to process seat reservation hold' }, { status: 500 });
  }
}
