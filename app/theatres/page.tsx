"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MapPin, Film, Building2 } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { getMoviesForTheatre } from '@/lib/data';
import { theatres } from '@/data/theatres';
import { locations } from '@/data/locations';

const CITY_FILTER_TABS = [
  { id: 'all', name: 'All Cities' },
  { id: 'guntur', name: 'Guntur' },
  { id: 'vijayawada', name: 'Vijayawada' },
  { id: 'nrt', name: 'Narasaraopeta' },
  { id: 'sattenapalli', name: 'Sattenapalli' },
  { id: 'edlapadu', name: 'Edlapadu' },
  { id: 'martur', name: 'Martur' },
];

export default function TheatresPage() {
  const { selectedLocation } = useLocation();

  // Active filter tab initialized to selected city (or 'all')
  const [activeCityTab, setActiveCityTab] = useState<string>(
    selectedLocation.bookingEnabled ? selectedLocation.id : 'all'
  );

  const filteredTheatres = useMemo(() => {
    if (activeCityTab === 'all') {
      return theatres;
    }
    return theatres.filter((t) => t.locationId === activeCityTab);
  }, [activeCityTab]);

  const theatresWithMovies = useMemo(() => {
    return filteredTheatres.map((t) => {
      const moviesAtTheatre = getMoviesForTheatre(t.id);
      const locObj = locations.find((l) => l.id === t.locationId);
      return {
        theatre: t,
        locationName: locObj ? locObj.name : t.locationId,
        movies: moviesAtTheatre.map((m) => m.movie),
      };
    });
  }, [filteredTheatres]);

  // Group theatres by city when 'ALL' tab is selected
  const groupedTheatres = useMemo(() => {
    const map = new Map<string, { cityId: string; cityName: string; items: typeof theatresWithMovies }>();

    theatresWithMovies.forEach((item) => {
      const cId = item.theatre.locationId;
      if (!map.has(cId)) {
        map.set(cId, { cityId: cId, cityName: item.locationName, items: [] });
      }
      map.get(cId)!.items.push(item);
    });

    return Array.from(map.values());
  }, [theatresWithMovies]);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold font-heading">
              TicketX Cinema Directory
            </h1>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-primary" />
              Active cinemas across bookable locations in India
            </p>
          </div>
        </div>

        {/* CITY FILTER TABS */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 hide-scrollbar">
          {CITY_FILTER_TABS.map((tab) => {
            const isActive = activeCityTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCityTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(216,33,50,0.3)]'
                    : 'bg-secondary/40 text-gray-300 border-white/10 hover:border-white/20 hover:bg-secondary'
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* THEATRES DISPLAY GROUPED BY CITY */}
        {groupedTheatres.length > 0 ? (
          <div className="space-y-12">
            {groupedTheatres.map((group) => (
              <div key={group.cityId} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl md:text-2xl font-bold font-heading text-white">
                    {group.cityName}
                  </h2>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    Available
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map(({ theatre, movies }) => (
                    <div
                      key={theatre.id}
                      className="bg-secondary/40 border border-white/10 rounded-2xl p-6 flex flex-col justify-between transition-all group hover:border-primary/40"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors">
                            {theatre.name}
                          </h3>
                        </div>

                        <p className="text-xs text-muted-foreground mb-4">
                          {theatre.address || theatre.area}
                        </p>

                        <div className="border-t border-white/5 pt-3">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                            <Film className="w-3 h-3 text-primary" /> Now Showing ({movies.length})
                          </p>

                          {movies.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {movies.map((m) => (
                                <span
                                  key={m.id}
                                  className="text-xs bg-black/40 text-gray-200 px-2.5 py-1 rounded-lg border border-white/5 truncate max-w-[180px]"
                                >
                                  {m.title}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No current movie listings available.</p>
                          )}
                        </div>
                      </div>

                      <div className="pt-5 mt-4 border-t border-white/5 flex justify-end">
                        <Link
                          href={`/theatres/${theatre.id}`}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          View Cinema Listings →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No cinemas found</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              No cinemas currently registered for this filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
