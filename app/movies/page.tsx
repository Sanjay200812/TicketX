"use client";

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { MovieSection } from '@/components/home/MovieSection';
import { ComingSoonCity } from '@/components/location/ComingSoonCity';
import { Movie } from '@/types/movie';
import { useLocation } from '@/context/LocationContext';
import { getMoviesForLocation } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { TicketXHeading } from '@/components/shared/TicketXHeading';

export default function MoviesPage() {
  const { selectedLocation } = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Real-time filtering by title & language scoped to selected location
  const filteredMovies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return formattedMovies;
    return formattedMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.language && m.language.toLowerCase().includes(q)) ||
        (m.genres && m.genres.some((g) => g.toLowerCase().includes(q)))
    );
  }, [formattedMovies, searchQuery]);

  if (!selectedLocation.bookingEnabled) {
    return <ComingSoonCity />;
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TicketXHeading
            subtitle={`Browse films currently playing across local cinemas in ${selectedLocation.name}.`}
            size="lg"
          >
            Movies Playing in {selectedLocation.name}
          </TicketXHeading>

          {/* Requirement 26, 27: Search button expands into animated search bar */}
          <div className="shrink-0 flex items-center justify-end">
            {!isSearchOpen ? (
              <Button
                variant="outline"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full border-white/20 font-bold gap-2 text-xs text-gray-200 hover:text-white"
              >
                <Search className="w-4 h-4 text-primary" /> Search Movies
              </Button>
            ) : (
              <motion.div
                initial={{ width: 40, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 40, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative flex items-center"
              >
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  autoFocus
                  placeholder={`Search movies in ${selectedLocation.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 bg-secondary border-primary/50 text-xs rounded-full text-white"
                />
                {/* Requirement 33: Clear button restores full list */}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2.5 p-1 rounded-full text-gray-400 hover:text-white"
                  title="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Search Results Display */}
        {filteredMovies.length > 0 ? (
          <MovieSection title="" movies={filteredMovies} />
        ) : (
          /* Requirement 32: Search Empty State */
          <div className="py-20 text-center text-muted-foreground space-y-3 bg-secondary/20 rounded-2xl border border-white/5 my-8">
            <Search className="w-10 h-10 mx-auto text-gray-500" />
            <p className="text-base font-bold text-white">No movies found for &quot;{searchQuery}&quot;</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No films matching this query are currently scheduled in {selectedLocation.name}. Try searching by another title or language.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="rounded-full text-xs border-white/20 mt-2"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
