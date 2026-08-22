import { NextResponse } from 'next/server';
import { movies } from '@/data/movies';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const movie = movies.find((m) => m.id === params.id);

  if (!movie) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  }

  return NextResponse.json({
    source: 'local',
    movie,
  });
}
