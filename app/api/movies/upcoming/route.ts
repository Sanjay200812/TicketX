import { NextResponse } from 'next/server';
import { movies } from '@/data/movies';

export async function GET() {
  // Return upcoming / coming soon movies from local dataset
  const upcoming = movies.filter((m) => m.id === 'khalifa-the-ruler' || m.id === 'hushar-pittalu');
  return NextResponse.json({ source: 'local', movies: upcoming });
}
