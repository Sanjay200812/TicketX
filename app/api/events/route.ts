import { NextResponse } from 'next/server';
import { events as activeEvents } from '@/data/events';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const city = searchParams.get('city');

  let filtered = activeEvents;

  if (category && category !== 'All') {
    filtered = filtered.filter(
      (e) => (e.eventType || '').toLowerCase().includes(category.toLowerCase())
    );
  }

  if (city) {
    const cityMatches = filtered.filter(
      (e) =>
        e.cityId.toLowerCase() === city.toLowerCase() ||
        e.cityName.toLowerCase().includes(city.toLowerCase())
    );
    if (cityMatches.length > 0) {
      filtered = cityMatches;
    }
  }

  return NextResponse.json({
    source: 'local',
    events: filtered,
  });
}
