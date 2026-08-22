import { NextResponse } from 'next/server';
import { movies } from '@/data/movies';

export async function GET() {
  return NextResponse.json({
    source: 'local',
    movies,
  });
}
