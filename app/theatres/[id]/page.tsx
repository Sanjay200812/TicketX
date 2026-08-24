"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MapPin, Film, ChevronLeft, Calendar, Sparkles, Building2 } from 'lucide-react';
import { theatres } from '@/data/theatres';
import { getLocationById, getMoviesForTheatre } from '@/lib/data';
import { getTodayDateStr, getTomorrowDateStr, getNextDayDateStr } from '@/lib/date';
import { DateSelector } from '@/components/booking/DateSelector';

export default function TheatreDetailsPage({ params }: { params: { id: string } }) {
  // Stable ID/slug lookup (Requirements 30, 31, 32, 33)
  const theatre = useMemo(() => {
    return theatres.find((t) => t.id === params.id) || null;
  }, [params.id]);

  const locationObj = useMemo(() => {
    if (!theatre) return null;
    return getLocationById(theatre.locationId);
  }, [theatre]);

  // Date Tabs (Requirements 35, 36)
  const availableDates = useMemo(() => {
    return [getTodayDateStr(), getTomorrowDateStr(), getNextDayDateStr()];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]);

  // Date-aware movie listings for this specific theatre (Requirements 34, 37)
  const moviesAtTheatre = useMemo(() => {
    if (!theatre) return [];
    return getMoviesForTheatre(theatre.id, selectedDate);
  }, [theatre, selectedDate]);

  // Clean 404 UX if theatre slug not found (Requirement 33, 67)
  if (!theatre) {
    return (
      <div className="min-h-screen pt-32 pb-20 text-center flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-heading mb-3 text-white">Theatre not found</h1>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          The cinema you requested does not exist or may have been updated.
        </p>
        <Link
          href="/theatres"
          className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-colors shadow-lg"
        >
          Back to Theatres
        </Link>
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

        {/* Selected Theatre Header Information (Requirement 34) */}
        <div className="bg-secondary/40 border border-white/10 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 font-mono mb-2 inline-block">
                CINEMA AUDITORIUM
              </span>
              <h1 className="text-2xl md:text-3xl font-bold font-heading text-white">{theatre.name}</h1>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                {theatre.address || theatre.area}, {locationObj?.name || 'Andhra Pradesh'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 self-start md:self-center">
              {theatre.format?.map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono font-bold text-white"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          {theatre.facilities && theatre.facilities.length > 0 && (
            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
              {theatre.facilities.map((fac) => (
                <span
                  key={fac}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 font-medium flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {fac}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Date Selector Tabs (Requirements 35, 36) */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Select Date</span>
          </div>
          <DateSelector
            dates={availableDates}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />
        </div>

        {/* Movies & Shows Section (Requirement 34) */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-heading mb-6 flex items-center gap-2 text-white">
            <Film className="w-5 h-5 text-primary" /> NOW SHOWING AT {theatre.name}
          </h2>

          {moviesAtTheatre.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {moviesAtTheatre.map(({ movie, shows: mShows }) => (
                <div
                  key={movie.id}
                  className="bg-secondary/30 border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover:border-white/20 transition-all"
                >
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1 truncate">{movie.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {movie.language} • {movie.genres?.join(', ')}
                    </p>

                    <div className="border-t border-white/5 pt-3 mb-4">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase mb-2 font-mono">
                        Available Showtimes ({mShows.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {mShows.map((s) => (
                          <Link
                            key={s.id}
                            href={`/booking/${s.id}`}
                            className="text-xs font-mono font-bold bg-black/50 text-gray-200 hover:text-white hover:bg-primary/20 hover:border-primary/40 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                          >
                            {s.time}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/shows/${movie.id}?theatreId=${theatre.id}`}
                    className="block text-center w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-md mt-2"
                  >
                    Select Showtimes →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-secondary/20 rounded-3xl border border-white/5">
              <Film className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-lg font-bold font-heading mb-1 text-white">No shows available for this date</h3>
              <p className="text-xs text-muted-foreground">
                Please select another date above to view upcoming screenings for {theatre.name}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
