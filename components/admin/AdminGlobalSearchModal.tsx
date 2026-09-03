"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Film, Building2, Clock, Ticket, Users, Calendar, X, ArrowRight } from 'lucide-react';
import { movies as staticMovies } from '@/data/movies';
import { theatres as staticTheatres } from '@/data/theatres';
import { events as staticEvents } from '@/data/events';

interface SearchResultItem {
  id: string;
  type: 'movie' | 'theatre' | 'show' | 'booking' | 'user' | 'event';
  title: string;
  subtitle: string;
  href: string;
}


interface AdminGlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminGlobalSearchModal({ isOpen, onClose }: AdminGlobalSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const runSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    const q = term.toLowerCase().trim();
    const items: SearchResultItem[] = [];

    // Search static + live movies
    // Search movies
    staticMovies.forEach((m) => {
      if (m.title.toLowerCase().includes(q) || (m.language && m.language.toLowerCase().includes(q))) {
        items.push({
          id: m.id,
          type: 'movie',
          title: m.title,
          subtitle: `Movie • ${m.language || 'Telugu'} • ${m.certificate || 'U/A'}`,
          href: `/admin/movies/${m.id}/edit`,
        });
      }
    });

    // Search theatres
    staticTheatres.forEach((t) => {
      if (t.name.toLowerCase().includes(q) || t.locationId.toLowerCase().includes(q)) {
        items.push({
          id: t.id,
          type: 'theatre',
          title: t.name,
          subtitle: `Theatre • ${t.locationId} • ${t.area || ''}`,
          href: `/admin/theatres`,
        });
      }
    });

    // Search events
    staticEvents.forEach((ev) => {
      if (ev.title?.toLowerCase().includes(q) || (ev.eventType && ev.eventType.toLowerCase().includes(q))) {
        items.push({
          id: ev.id,
          type: 'event',
          title: ev.title || ev.name,
          subtitle: `Event • ${ev.eventType || 'Live'} • ${ev.venue || 'Auditorium'}`,
          href: `/admin/events`,
        });
      }
    });


    // Search live customers
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        data.customers.forEach((c: { name?: string; phone?: string; uid: string }) => {

          if (
            c.name?.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q) ||
            c.uid?.toLowerCase().includes(q)
          ) {
            items.push({
              id: c.uid,
              type: 'user',
              title: c.name || 'Customer',
              subtitle: `Customer • ${c.phone || ''} • UID: ${c.uid}`,
              href: `/admin/users/${encodeURIComponent(c.uid)}`,

            });
          }
        });
      }
    } catch {}

    setResults(items.slice(0, 12));
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, runSearch]);

  if (!isOpen) return null;

  const getIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'movie':
        return <Film className="w-4 h-4 text-rose-400" />;
      case 'theatre':
        return <Building2 className="w-4 h-4 text-amber-400" />;
      case 'show':
        return <Clock className="w-4 h-4 text-sky-400" />;
      case 'booking':
        return <Ticket className="w-4 h-4 text-emerald-400" />;
      case 'user':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-sky-400" />;
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#16191f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 border-b border-white/10">
          <Search className="w-4 h-4 text-gray-400 mr-3" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search movies, theatres, shows, bookings, or users..."
            className="w-full py-4 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 rounded-md text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {results.length > 0 ? (
            results.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => {
                  onClose();
                  router.push(item.href);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl text-left hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/10 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{item.subtitle}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </button>
            ))
          ) : searchTerm ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No results found for &ldquo;{searchTerm}&rdquo;
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-400">
              Type to search movies, theatres, showtimes, users, or bookings across TicketX.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-black/30 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span>Navigate with mouse or keyboard</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
