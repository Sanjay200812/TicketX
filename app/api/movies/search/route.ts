import { NextResponse } from 'next/server';
import { movies } from '@/data/movies';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() || '';

  if (!q) {
    return NextResponse.json({ movies: [] });
  }

  const matches = movies.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.genres?.some((g) => g.toLowerCase().includes(q))
  );

  return NextResponse.json({
    source: 'local',
    movies: matches,
  });
}
