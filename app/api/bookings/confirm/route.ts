import { NextResponse } from 'next/server';
import { confirmBooking } from '@/lib/serverBookingStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      holdId,
      showId,
      seatCodes,
      seatPrices,
      userId,
      userName,
      userEmail,
      userPhone,
      idempotencyKey,
      movieId,
      movieTitle,
      moviePoster,
      movieLanguage,
      theatreId,
      theatreName,
      locationId,
      cityName,
      date,
      time,
      screenName,
    } = body;

    if (!showId || !Array.isArray(seatCodes) || seatCodes.length === 0 || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const result = confirmBooking({
      holdId,
      showId,
      seatCodes,
      seatPrices: seatPrices || seatCodes.map((c: string) => ({ code: c, price: 120 })),
      userId,
      userName,
      userEmail,
      userPhone,
      idempotencyKey,
      movieId: movieId || 'movie',
      movieTitle: movieTitle || 'Movie',
      moviePoster,
      movieLanguage,
      theatreId: theatreId || 'theatre',
      theatreName: theatreName || 'Theatre',
      locationId: locationId || 'location',
      cityName: cityName || 'City',
      date: date || '2026-08-22',
      time: time || '06:30 PM',
      screenName: screenName || 'Screen 1',
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 409 });
    }

    return NextResponse.json({ success: true, booking: result.booking }, { status: 200 });
  } catch (error) {
    console.error('Error confirming booking:', error);
    return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 });
  }
}
