import { NextResponse } from 'next/server';
import { events as activeEvents } from '@/data/events';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const event = activeEvents.find((e) => e.id === params.id) || activeEvents[0];
  return NextResponse.json({
    source: 'local',
    event,
  });
}
