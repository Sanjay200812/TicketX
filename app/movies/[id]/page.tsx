"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Clock, Calendar, ChevronLeft, Star } from 'lucide-react';
import { movies } from '@/data/movies';
import { useLocation } from '@/context/LocationContext';
import { getTheatresForMovie } from '@/lib/data';
import { MoviePoster } from '@/components/shared/MoviePoster';

export default function MovieDetailsPage({ params }: { params: { id: string } }) {
  const { selectedLocation } = useLocation();

  const movie = useMemo(() => {
    return movies.find((m) => m.id === params.id) || null;
  }, [params.id]);

  const carryingTheatres = useMemo(() => {
    if (!movie) return [];
    return getTheatresForMovie(movie.id, selectedLocation.id);
  }, [movie, selectedLocation.id]);

  if (!movie) {
    return (
      <div className="min-h-screen pt-32 pb-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Movie Not Found</h2>
        <Link href="/movies" className="text-primary hover:underline">Back to Movies</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background pt-20">
      <div className="container mx-auto px-4 md:px-6">
        <Link
          href="/movies"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6 font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Movies
        </Link>

        {/* Hero Section with Rich Movie Backdrop & Poster Image */}
        <div className="relative w-full min-h-[380px] rounded-2xl overflow-hidden mb-10 border border-white/10 shadow-2xl bg-black">
          {/* Backdrop Image Blur Overlay */}
          {movie.poster && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover opacity-30 blur-md scale-110"
              />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />

          <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-end h-full justify-between">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Exact Matching Movie Poster Image */}
              <MoviePoster
                src={movie.poster}
                title={movie.title}
                rating={movie.rating}
                className="w-36 md:w-48 aspect-[2/3] shadow-2xl shrink-0 rounded-xl border border-white/20"
              />

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {movie.certificate && (
                    <span className="px-2.5 py-0.5 rounded bg-primary/20 text-primary font-bold text-xs border border-primary/30">
                      {movie.certificate}
                    </span>
                  )}
                  {movie.rating && (
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {movie.rating} / 10
                    </span>
                  )}
                  {movie.genres?.map((g) => (
                    <span key={g} className="px-2.5 py-0.5 rounded bg-white/10 text-white text-xs border border-white/10">
                      {g}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl md:text-5xl font-bold font-heading text-white">{movie.title}</h1>

                <div className="flex items-center gap-4 text-xs text-gray-300 font-medium">
                  {movie.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {movie.duration}
                    </span>
                  )}
                  {movie.releaseDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> {movie.releaseDate}
                    </span>
                  )}
                  {movie.language && (
                    <span className="px-2 py-0.5 rounded bg-secondary text-gray-300 text-xs border border-white/5">
                      {movie.language}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Synopsis & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-2xl font-bold font-heading mb-4">Synopsis</h3>
              <p className="text-gray-300 leading-relaxed text-base">{movie.description}</p>
            </div>
          </div>

          {/* Theatres Showing This Movie */}
          <div>
            <div className="bg-secondary/40 border border-white/10 rounded-2xl p-6 space-y-6 sticky top-24 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-lg font-bold font-heading flex items-center gap-2 text-white">
                  <MapPin className="w-5 h-5 text-primary" /> Theatres Showing This Movie
                </h3>
              </div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                LOCATION: <span className="text-white font-bold">{selectedLocation.name}</span>
              </p>

              {carryingTheatres.length > 0 ? (
                <div className="space-y-4">
                  {carryingTheatres.map(({ theatre, shows: tShows }) => (
                    <div key={theatre.id} className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-3 shadow-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm text-white">{theatre.name}</p>
                          <p className="text-xs text-muted-foreground">{theatre.area || theatre.address}</p>
                        </div>
                        <Link
                          href={`/shows/${movie.id}?theatreId=${theatre.id}`}
                          className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shrink-0 shadow-md flex items-center gap-1"
                        >
                          Book →
                        </Link>
                      </div>

                      {/* Timings preview */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tShows.map((s) => (
                          <span
                            key={s.id}
                            className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-secondary text-gray-200 border border-white/10 font-bold"
                          >
                            {s.time}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-6">
                  No showtimes listed for this movie in {selectedLocation.name}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
