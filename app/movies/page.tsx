"use client";

import { useMemo } from 'react';
import { MovieSection } from '@/components/home/MovieSection';
import { ComingSoonCity } from '@/components/location/ComingSoonCity';
import { Movie } from '@/types/movie';
import { useLocation } from '@/context/LocationContext';
import { getMoviesForLocation } from '@/lib/data';

export default function MoviesPage() {
  const { selectedLocation } = useLocation();

  const moviesForLocation = useMemo(() => {
    return getMoviesForLocation(selectedLocation.id);
  }, [selectedLocation.id]);

  const formattedMovies: Movie[] = useMemo(() => {
    return moviesForLocation.map((m) => ({
      ...m,
      cinemaCount: m.theatreCount,
      status: 'now-showing' as const,
    }));
  }, [moviesForLocation]);

  if (!selectedLocation.bookingEnabled) {
    return <ComingSoonCity />;
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-5xl font-bold font-heading mb-2">
          Movies Playing in {selectedLocation.name}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Browse films currently playing across local cinemas in {selectedLocation.name}.
        </p>

        {formattedMovies.length > 0 ? (
          <MovieSection title="" movies={formattedMovies} />
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            No movies currently scheduled in {selectedLocation.name}.
          </div>
        )}
      </div>
    </div>
  );
}
