"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { movies } from '@/data/movies';
import { DateSelector } from '@/components/booking/DateSelector';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { ShowtimeConfirmationModal } from '@/components/booking/ShowtimeConfirmationModal';
import { TicketXShow as Show } from '@/types/show';
import { TicketXTheatre as Theatre } from '@/types/theatre';
import { TicketXMovie as Movie } from '@/types/movie';
import { useLocation } from '@/context/LocationContext';
import { getAvailableDatesForMovie, getTheatresForMovie } from '@/lib/data';

export default function ShowsPage({ params }: { params: { movieId: string } }) {
  const router = useRouter();
  const { selectedLocation } = useLocation();

  const movie: Movie | null = useMemo(() => {
    return movies.find((m) => m.id === params.movieId) || null;
  }, [params.movieId]);

  const availableDates = useMemo(() => {
    if (!movie) return [];
    const dates = getAvailableDatesForMovie(movie.id, selectedLocation.id);
    return dates.length > 0 ? dates : ["2026-08-22"];
  }, [movie, selectedLocation.id]);

  const [selectedDate, setSelectedDate] = useState(availableDates[0] || "2026-08-22");
  const [selectedShow, setSelectedShow] = useState<{ show: Show; theatre: Theatre } | null>(null);

  const theatresWithShows = useMemo(() => {
    if (!movie) return [];
    return getTheatresForMovie(movie.id, selectedLocation.id, selectedDate);
  }, [movie, selectedLocation.id, selectedDate]);

  if (!movie) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Movie Not Found</h2>
        <Link href="/movies" className="text-primary hover:underline">Back to Movies</Link>
      </div>
    );
  }

  const handleShowSelect = (show: Show, theatre: Theatre) => {
    setSelectedShow({ show, theatre });
  };

  const handleConfirmShow = () => {
    if (selectedShow) {
      router.push(`/booking/${selectedShow.show.id}`);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20 bg-background">
      {/* Header & Progress */}
      <div className="bg-secondary/50 border-b border-white/5 pb-4 pt-4">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/movies/${movie.id}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> {movie.title}
            </Link>
            <BookingProgress currentStep="showtime" />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">{movie.title}</h1>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                {movie.language && (
                  <span className="text-muted-foreground bg-secondary px-2 py-1 rounded border border-white/5">
                    {movie.language}
                  </span>
                )}
                <span className="text-muted-foreground ml-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {selectedLocation.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Date Selector */}
        {availableDates.length > 0 && (
          <div className="mb-10">
            <DateSelector dates={availableDates} selectedDate={selectedDate} onSelect={setSelectedDate} />
          </div>
        )}

        {/* Theatres and Shows */}
        <div className="space-y-6">
          {theatresWithShows.length === 0 ? (
            <div className="text-center py-20 bg-secondary/30 rounded-xl border border-white/5">
              <h3 className="text-xl font-semibold mb-2">No shows available for this date</h3>
              <p className="text-muted-foreground">Please choose another date or location above.</p>
            </div>
          ) : (
            theatresWithShows.map(({ theatre, shows: tShows }) => (
              <motion.div
                key={theatre.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary/40 rounded-xl p-4 md:p-6 border border-white/5 flex flex-col lg:flex-row gap-6 lg:items-center"
              >
                <div className="lg:w-1/3">
                  <h3 className="text-xl font-semibold mb-2">{theatre.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 text-primary" /> {theatre.area || theatre.address}
                  </div>
                </div>

                <div className="lg:w-2/3 flex flex-wrap gap-3">
                  {tShows.map((show) => (
                    <motion.button
                      key={show.id}
                      onClick={() => handleShowSelect(show, theatre)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="group flex flex-col items-center justify-center p-3 border border-white/10 rounded-lg bg-background hover:border-primary/50 hover:bg-primary/5 transition-all min-w-[105px]"
                    >
                      <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                        {show.time}
                      </span>
                      {show.screenName && (
                        <span className="text-[10px] text-muted-foreground uppercase mt-0.5 tracking-wider">
                          {show.screenName}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {selectedShow && (
        <ShowtimeConfirmationModal
          isOpen={!!selectedShow}
          onClose={() => setSelectedShow(null)}
          movie={{
            id: movie.id,
            title: movie.title,
            poster: movie.poster || '',
            backdrop: movie.backdrop || '',
            rating: movie.rating || 8.0,
            language: movie.language || 'Telugu',
            genres: movie.genres || [],
            duration: movie.duration || '2h',
            releaseDate: movie.releaseDate || '2026-08-22',
            description: movie.description || '',
            cast: [],
            format: ['2D'],
            status: 'now-showing'
          }}
          theatre={selectedShow.theatre}
          show={selectedShow.show}
          onConfirm={handleConfirmShow}
        />
      )}
    </div>
  );
}
