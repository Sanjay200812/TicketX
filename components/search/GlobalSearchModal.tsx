"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Film, Building2, Calendar, X, MapPin } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { movies } from '@/data/movies';
import { theatres } from '@/data/theatres';
import { events } from '@/data/events';
import { TicketXMovie } from '@/types/movie';
import { TicketXTheatre } from '@/types/theatre';
import { TicketXEvent } from '@/types/event';
import { Input } from '@/components/ui/input';

export interface GlobalSearchItem {
  id: string;
  type: 'movie' | 'theatre' | 'event';
  title: string;
  subtitle: string;
  extraInfo?: string;
  posterUrl?: string;
  link: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { selectedLocation } = useLocation();
  const [query, setQuery] = useState('');

  // Requirement 31, 32: Index Movies, Theatres, and Events
  const searchIndex: GlobalSearchItem[] = useMemo(() => {
    const items: GlobalSearchItem[] = [];

    // 1. Movies
    movies.forEach((m: TicketXMovie) => {
      items.push({
        id: `movie-${m.id}`,
        type: 'movie',
        title: m.title,
        subtitle: `${m.language || 'Telugu'} • ${(m.genres || []).join(', ')}`,
        extraInfo: `Rating: ${m.rating || 9}/10`,
        posterUrl: m.poster,
        link: `/movies/${m.id}`,
      });
    });

    // 2. Theatres
    theatres.forEach((t: TicketXTheatre) => {
      items.push({
        id: `theatre-${t.id}`,
        type: 'theatre',
        title: t.name,
        subtitle: `${t.address || t.locationId} • ${t.area || 'Cinema'}`,
        extraInfo: `${t.screenIds ? t.screenIds.length : 1} Screens`,
        link: `/theatres/${t.id}`,
      });
    });

    // 3. Events
    events.forEach((ev: TicketXEvent) => {
      items.push({
        id: `event-${ev.id}`,
        type: 'event',
        title: ev.title || ev.name,
        subtitle: `${ev.eventType} • ${ev.venue}`,
        extraInfo: ev.date,
        posterUrl: ev.poster || ev.image,
        link: `/events/${ev.id}`,
      });
    });

    return items;
  }, []);

  // Requirement 25, 32: Instant real-time case-insensitive filtering
  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return searchIndex.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.extraInfo && item.extraInfo.toLowerCase().includes(q))
      );
    });
  }, [searchIndex, query]);

  const handleSelectResult = (item: GlobalSearchItem) => {
    onClose();
    setQuery('');
    router.push(item.link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-start justify-center pt-16 md:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Search Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#141417] border border-white/15 rounded-3xl p-5 md:p-6 shadow-2xl z-10 font-sans"
          >
            {/* Input Header */}
            <div className="relative flex items-center mb-4">
              <Search className="absolute left-4 w-5 h-5 text-primary pointer-events-none" />
              <Input
                autoFocus
                placeholder="Search movies, theatres or events..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-10 py-6 text-sm md:text-base bg-black/50 border-white/15 rounded-2xl text-white focus:border-primary focus:ring-1 focus:ring-primary font-medium"
              />
              {query ? (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 text-gray-400 hover:text-white p-1"
                  title="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="absolute right-4 text-gray-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Current Location Filter Banner */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 pb-3 border-b border-white/10">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Location Context: <strong className="text-white">{selectedLocation.name}</strong>
              </span>
              <span className="text-[10px] font-mono uppercase bg-white/5 px-2 py-0.5 rounded text-gray-300">
                GLOBAL SEARCH
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
              {query.trim() === '' ? (
                <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                  <Search className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                  <p className="text-gray-300 font-bold">Start typing to search TicketX</p>
                  <p className="text-[11px] text-gray-500">
                    Find movies like <span className="text-primary font-mono">&quot;Irumudi&quot;</span>, theatres like <span className="text-amber-400 font-mono">&quot;Studio 81&quot;</span>, or events like <span className="text-rose-400 font-mono">&quot;StarX Live&quot;</span>.
                  </p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="w-full flex items-center justify-between p-3 md:p-3.5 rounded-2xl bg-black/40 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {item.type === 'movie' && (
                        <div className="w-10 h-14 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.posterUrl ? (
                            <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <Film className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      )}
                      {item.type === 'theatre' && (
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-amber-400" />
                        </div>
                      )}
                      {item.type === 'event' && (
                        <div className="w-10 h-14 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.posterUrl ? (
                            <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <Calendar className="w-5 h-5 text-rose-400" />
                          )}
                        </div>
                      )}

                      <div className="truncate">
                        <p className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      </div>
                    </div>

                    {/* Result Type Badge (Requirement 26) */}
                    <div className="shrink-0 ml-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase font-mono px-2.5 py-1 rounded-full border ${
                          item.type === 'movie'
                            ? 'bg-primary/20 text-primary border-primary/40'
                            : item.type === 'theatre'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                /* Requirement 27: Empty Search State */
                <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                  <Search className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                  <p className="text-sm font-bold text-white">No results found</p>
                  <p className="text-xs text-gray-400">
                    No movies, theatres or events found matching &quot;{query}&quot;.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
