"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { HeroBanner } from '@/components/home/HeroBanner';
import { MovieSection } from '@/components/home/MovieSection';
import { EventCard } from '@/components/events/EventCard';
import { ComingSoonCity } from '@/components/location/ComingSoonCity';
import { mockEvents } from '@/data/events';
import { Movie } from '@/types/movie';
import { useLocation } from '@/context/LocationContext';
import { getMoviesForLocation, getTheatresForLocation, getEventsForLocation } from '@/lib/data';
import { MapPin, Sparkles, Languages } from 'lucide-react';
import { INDIAN_LANGUAGES } from '@/lib/languages';

export default function Home() {
  const { selectedLocation } = useLocation();

  const moviesForLocation = useMemo(() => {
    return getMoviesForLocation(selectedLocation.id);
  }, [selectedLocation.id]);

  const theatresForLocation = useMemo(() => {
    return getTheatresForLocation(selectedLocation.id);
  }, [selectedLocation.id]);

  const eventsForLocation = useMemo(() => {
    const list = getEventsForLocation(selectedLocation.id);
    return list.length > 0 ? list : mockEvents;
  }, [selectedLocation.id]);

  const formattedNowShowing: Movie[] = useMemo(() => {
    return moviesForLocation.map((m) => ({
      ...m,
      cinemaCount: m.theatreCount,
      status: 'now-showing' as const,
    }));
  }, [moviesForLocation]);

  const heroMovies = formattedNowShowing.slice(0, 3);

  if (!selectedLocation.bookingEnabled) {
    return <ComingSoonCity />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeroBanner movies={heroMovies} />

      {/* Now Showing Near You Header & Location Controls */}
      <section className="pt-8 pb-4 bg-background">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Now Showing in {selectedLocation.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Showing movies currently programming across {theatresForLocation.length} theatres in {selectedLocation.name}
            </p>
          </div>
        </div>
      </section>

      {/* Now Showing Movie Grid */}
      <MovieSection
        title=""
        movies={formattedNowShowing}
        viewAllLink="/movies"
      />

      <div className="border-t border-white/5" />

      {/* Browse by Language (Indian Cinema) */}
      <section className="py-12 bg-secondary/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 mb-6">
            <Languages className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold font-heading">Browse by Indian Language</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 hide-scrollbar">
            {INDIAN_LANGUAGES.map((lang) => (
              <Link
                key={lang.code}
                href={`/movies?lang=${lang.name}`}
                className="px-5 py-2.5 rounded-xl bg-secondary/60 hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-sm font-semibold text-gray-200 hover:text-white transition-all whitespace-nowrap"
              >
                {lang.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-white/5" />

      {/* Events Near You */}
      <section className="py-16 bg-secondary/40 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-heading flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Events Near {selectedLocation.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Live concerts, comedy shows, sports & tech workshops</p>
            </div>
            <Link href="/events" className="text-xs font-semibold text-primary hover:underline">
              Explore All Events →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {eventsForLocation.slice(0, 4).map((evt, idx) => (
              <EventCard key={evt.id} event={evt} index={idx} />
            ))}
          </div>

        </div>
      </section>

      {/* Nearby Theatres Section */}
      <section className="py-16 bg-background border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-heading">Theatres in {selectedLocation.name}</h2>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Showing {theatresForLocation.length} active cinemas
              </p>
            </div>
            <Link href="/theatres" className="text-xs font-semibold text-primary hover:underline">
              View All Cinemas →
            </Link>
          </div>

          {theatresForLocation.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {theatresForLocation.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="bg-secondary/60 border border-white/10 rounded-xl p-5 hover:border-primary/40 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{c.address || c.area}</p>

                  <div className="text-right border-t border-white/5 pt-3">
                    <Link href={`/theatres/${c.id}`} className="text-xs font-semibold text-primary group-hover:underline">
                      View Listings →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No cinemas found for this location.
            </div>
          )}
        </div>
      </section>

      {/* Brand slogan */}
      <section className="py-20 bg-secondary border-y border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Your Seat. Your Show. Your TicketX.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Experience multi-location cinema discovery, active theatre listings, live events, and seamless seat booking on TicketX.
          </p>
        </div>
      </section>
    </div>
  );
}
