"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Film, ChevronLeft } from 'lucide-react';
import { theatres } from '@/data/theatres';
import { getLocationById, getMoviesForTheatre } from '@/lib/data';

export default function TheatreDetailsPage({ params }: { params: { id: string } }) {
  const theatre = useMemo(() => {
    return theatres.find((t) => t.id === params.id) || null;
  }, [params.id]);

  const locationObj = useMemo(() => {
    if (!theatre) return null;
    return getLocationById(theatre.locationId);
  }, [theatre]);

  const moviesAtTheatre = useMemo(() => {
    if (!theatre) return [];
    return getMoviesForTheatre(theatre.id);
  }, [theatre]);

  if (!theatre) {
    return (
      <div className="min-h-screen pt-32 pb-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Cinema Not Found</h2>
        <Link href="/theatres" className="text-primary hover:underline">Back to Theatres</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <Link
          href="/theatres"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Theatres
        </Link>

        <div className="bg-secondary/40 border border-white/10 rounded-2xl p-6 md:p-8 mb-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold font-heading text-white">{theatre.name}</h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                {theatre.address || theatre.area}, {locationObj?.name || 'Andhra Pradesh'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" /> NOW SHOWING AT {theatre.name}
          </h2>

          {moviesAtTheatre.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {moviesAtTheatre.map(({ movie, shows: mShows }) => (
                <div key={movie.id} className="bg-secondary/30 border border-white/10 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white mb-2">{movie.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{movie.language} • {movie.genres?.join(', ')}</p>

                    <div className="border-t border-white/5 pt-3 mb-4">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase mb-2">Showtimes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {mShows.map((s) => (
                          <span key={s.id} className="text-xs font-mono bg-black/40 text-gray-200 px-2 py-1 rounded border border-white/5">
                            {s.time}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/shows/${movie.id}?theatreId=${theatre.id}`}
                    className="block text-center w-full py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors"
                  >
                    Select Showtimes →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No current movie listings available for this cinema.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
