import { NextResponse } from 'next/server';
import { shows } from '@/data/shows';
import { TicketXShow } from '@/types/show';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get('movieId');
  const date = searchParams.get('date');
  const locationId = searchParams.get('locationId') || searchParams.get('city') || 'guntur';

  let filteredShows: TicketXShow[] = shows;
  if (locationId) {
    filteredShows = filteredShows.filter((s) => s.locationId.toLowerCase() === locationId.toLowerCase());
  }
  if (movieId) {
    filteredShows = filteredShows.filter((s) => s.movieId === movieId);
  }
  if (date) {
    filteredShows = filteredShows.filter((s) => s.date === date);
  }

  return NextResponse.json({
    source: 'local',
    locationId,
    shows: filteredShows,
  });
}
