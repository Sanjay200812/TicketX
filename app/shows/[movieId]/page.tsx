"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, MapPin, Film, Calendar, Languages } from 'lucide-react';
import { motion } from 'framer-motion';
import { movies } from '@/data/movies';
import { DateSelector } from '@/components/booking/DateSelector';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { ShowtimeConfirmationModal } from '@/components/booking/ShowtimeConfirmationModal';
import { TicketXShow as Show } from '@/types/show';
import { TicketXTheatre as Theatre } from '@/types/theatre';
import { TicketXMovie as Movie } from '@/types/movie';
import { useLocation } from '@/context/LocationContext';
import { getTheatresForMovie } from '@/lib/data';
import { getTodayDateStr, getTomorrowDateStr, getNextDayDateStr } from '@/lib/date';

export default function ShowsPage({ params }: { params: { movieId: string } }) {
  const router = useRouter();
  const { selectedLocation } = useLocation();

  const movie: Movie | null = useMemo(() => {
    return movies.find((m) => m.id === params.movieId) || null;
  }, [params.movieId]);

  // Multi-Language Support (Requirements 7, 8, 9, 10, 11)
  const movieLanguages = useMemo(() => {
    if (!movie) return ['Telugu'];
    if (movie.languages && movie.languages.length > 0) return movie.languages;
    if (movie.language) {
      return movie.language.split('/').map((l) => l.trim()).filter(Boolean);
    }
    return ['Telugu'];
  }, [movie]);

  const [selectedLanguage, setSelectedLanguage] = useState<string>(movieLanguages[0] || 'Telugu');

  useEffect(() => {
    if (movieLanguages.length > 0 && !movieLanguages.includes(selectedLanguage)) {
      setSelectedLanguage(movieLanguages[0]);
    }
  }, [movieLanguages, selectedLanguage]);

  // Today, Tomorrow, Next Day dynamic dates (Requirements 35, 36)
  const availableDates = useMemo(() => {
    return [getTodayDateStr(), getTomorrowDateStr(), getNextDayDateStr()];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]);
  const [selectedShow, setSelectedShow] = useState<{ show: Show; theatre: Theatre } | null>(null);

  // Date and Language aware show filtering (Requirements 7, 9, 37)
  const theatresWithShows = useMemo(() => {
    if (!movie) return [];
    return getTheatresForMovie(
      movie.id,
      selectedLocation.id,
      selectedDate,
      movieLanguages.length > 1 ? selectedLanguage : undefined
    );
  }, [movie, selectedLocation.id, selectedDate, selectedLanguage, movieLanguages.length]);

  // Handle date change: clear stale selection (Requirement 38)
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedShow(null);
  };

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    setSelectedShow(null);
  };

  if (!movie) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-24">
        <h2 className="text-2xl font-bold mb-4 font-heading">Movie Not Found</h2>
        <Link href="/movies" className="text-primary hover:underline font-bold">
          Back to Movies
        </Link>
      </div>
    );
  }

  const handleShowSelect = (show: Show, theatre: Theatre) => {
    setSelectedShow({
      show: {
        ...show,
        language: show.language || selectedLanguage || movie.language || 'Telugu',
      },
      theatre,
    });
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
              <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">{movie.title}</h1>
              <div className="flex items-center gap-2 text-sm font-medium">
                {movieLanguages.length === 1 ? (
                  <span className="text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg border border-white/5 text-xs font-bold font-mono">
                    {movieLanguages[0]}
                  </span>
                ) : (
                  <span className="text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg border border-white/5 text-xs font-bold font-mono">
                    {movie.language || movieLanguages.join(' / ')}
                  </span>
                )}
                <span className="text-muted-foreground ml-2 flex items-center gap-1 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {selectedLocation.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Date Selector Tabs (Requirements 35, 36) */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Select Date</span>
          </div>
          <DateSelector
            dates={availableDates}
            selectedDate={selectedDate}
            onSelect={handleDateChange}
          />
        </div>

        {/* Language Selector (Requirements 7, 8, 10: Render ONLY if > 1 language) */}
        {movieLanguages.length > 1 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
              <Languages className="w-3.5 h-3.5 text-primary" />
              <span>Select Language</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {movieLanguages.map((lang) => {
                const isSelected = selectedLanguage === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white border border-primary shadow-[0_0_20px_rgba(216,33,50,0.35)]'
                        : 'bg-secondary/60 text-gray-300 hover:text-white hover:bg-secondary border border-white/10'
                    }`}
                  >
                    <span>{lang}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Theatres and Shows */}
        <div className="space-y-6">
          {theatresWithShows.length === 0 ? (
            <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-white/5 shadow-xl">
              <Film className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-xl font-bold font-heading mb-2">No shows available</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                No scheduled screenings for {movieLanguages.length > 1 ? `${selectedLanguage} on ` : ''}{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}. Please select another date, language, or location.
              </p>
            </div>
          ) : (
            theatresWithShows.map(({ theatre, shows: tShows }) => (
              <motion.div
                key={theatre.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary/40 rounded-2xl p-5 md:p-6 border border-white/5 flex flex-col lg:flex-row gap-6 lg:items-center shadow-xl hover:border-white/15 transition-all"
              >
                <div className="lg:w-1/3">
                  <h3 className="text-xl font-bold font-heading mb-1 text-white">{theatre.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {theatre.area || theatre.address}
                  </div>
                </div>

                <div className="lg:w-2/3 flex flex-wrap gap-3">
                  {tShows.map((show) => (
                    <motion.button
                      key={show.id}
                      onClick={() => handleShowSelect(show, theatre)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="group flex flex-col items-center justify-center px-4 py-3 border border-white/10 rounded-xl bg-black/40 hover:border-primary hover:bg-primary/10 transition-all min-w-[105px] shadow-md cursor-pointer"
                    >
                      <span className="text-sm font-extrabold font-mono text-white group-hover:text-primary transition-colors">
                        {show.time}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {show.language && movieLanguages.length > 1 && (
                          <span className="text-[10px] text-amber-400 font-bold font-mono">
                            {show.language}
                          </span>
                        )}
                        {show.screenName && (
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                            {show.screenName}
                          </span>
                        )}
                      </div>
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
            language: selectedShow.show.language || selectedLanguage || movie.language || 'Telugu',
            genres: movie.genres || [],
            duration: movie.duration || '2h',
            releaseDate: movie.releaseDate || selectedDate,
            description: movie.description || '',
            cast: movie.cast || [],
            crew: movie.crew || [],
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
