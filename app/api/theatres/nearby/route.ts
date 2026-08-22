import { NextResponse } from 'next/server';
import { getTheatresForLocation } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get('locationId') || searchParams.get('city') || 'guntur';

  const localTheatres = getTheatresForLocation(locationId.toLowerCase());

  return NextResponse.json({
    source: 'local',
    locationId,
    theatres: localTheatres,
  });
}
