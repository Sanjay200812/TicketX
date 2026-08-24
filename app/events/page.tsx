"use client";

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search, Sparkles, MapPin } from 'lucide-react';
import { EventCard } from '@/components/events/EventCard';
import { useLocation } from '@/context/LocationContext';
import { events as allEvents } from '@/data/events';
import { getLocationById } from '@/lib/data';
import { Input } from '@/components/ui/input';

import { TicketXHeading } from '@/components/shared/TicketXHeading';

export default function EventsPage() {
  const { location, selectedLocation, selectLocation } = useLocation();
  const [selectedFilterCity, setSelectedFilterCity] = useState<string>('current'); // 'current' or specific cityId
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = useMemo(() => {
    return allEvents.filter((e) => {
      let matchesCity = true;
      if (selectedFilterCity === 'current') {
        // If current city selected
        matchesCity = e.cityId === (selectedLocation?.id || location.city.id);
      } else if (selectedFilterCity !== 'all') {
        matchesCity = e.cityId === selectedFilterCity;
      }

      const matchesSearch =
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.cityName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCity && matchesSearch;
    });
  }, [selectedFilterCity, location.city.id, selectedLocation?.id, searchQuery]);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <TicketXHeading
            subtitle="Live stage concerts, college freshers & auditorium events."
            size="lg"
            icon={<Sparkles className="w-7 h-7" />}
          >
            Events in {location.city.name}
          </TicketXHeading>
        </div>

        {/* LOCATION FILTER TABS & SEARCH */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
            <button
              onClick={() => setSelectedFilterCity('current')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedFilterCity === 'current'
                  ? 'bg-primary text-white border-primary shadow-[0_0_12px_rgba(216,33,50,0.4)]'
                  : 'bg-secondary/60 text-gray-400 hover:text-white border-white/10'
              }`}
            >
              Current City ({location.city.name})
            </button>

            <button
              onClick={() => setSelectedFilterCity('guntur')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedFilterCity === 'guntur'
                  ? 'bg-primary text-white border-primary shadow-[0_0_12px_rgba(216,33,50,0.4)]'
                  : 'bg-secondary/60 text-gray-400 hover:text-white border-white/10'
              }`}
            >
              Guntur (Aakash Marriage)
            </button>

            <button
              onClick={() => setSelectedFilterCity('nrt')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedFilterCity === 'nrt'
                  ? 'bg-primary text-white border-primary shadow-[0_0_12px_rgba(216,33,50,0.4)]'
                  : 'bg-secondary/60 text-gray-400 hover:text-white border-white/10'
              }`}
            >
              Narasaraopet (NEC Freshers)
            </button>

            <button
              onClick={() => setSelectedFilterCity('hyderabad')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedFilterCity === 'hyderabad'
                  ? 'bg-primary text-white border-primary shadow-[0_0_12px_rgba(216,33,50,0.4)]'
                  : 'bg-secondary/60 text-gray-400 hover:text-white border-white/10'
              }`}
            >
              Hyderabad (StarX Live)
            </button>

            <button
              onClick={() => setSelectedFilterCity('all')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedFilterCity === 'all'
                  ? 'bg-primary text-white border-primary shadow-[0_0_12px_rgba(216,33,50,0.4)]'
                  : 'bg-secondary/60 text-gray-400 hover:text-white border-white/10'
              }`}
            >
              All Events ({allEvents.length})
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search event or venue..."
              className="pl-9 bg-secondary border-white/10 text-white text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* EVENT CARDS GRID */}
        {filteredEvents.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredEvents.map((evt, index) => (
                <EventCard key={evt.id} event={evt} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-secondary/20 border border-white/10 rounded-2xl p-8 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No events available in {location.city.name} right now</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Check out active events in nearby locations such as Narasaraopet or Hyderabad!
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => {
                  const loc = getLocationById('nrt');
                  if (loc) selectLocation(loc);
                  setSelectedFilterCity('nrt');
                }}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" /> View NEC Freshers (Narasaraopet)
              </button>

              <button
                onClick={() => {
                  const loc = getLocationById('hyderabad');
                  if (loc) selectLocation(loc);
                  setSelectedFilterCity('hyderabad');
                }}
                className="px-4 py-2 rounded-xl bg-secondary border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-white/10"
              >
                <MapPin className="w-3.5 h-3.5" /> View StarX Live (Hyderabad)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
