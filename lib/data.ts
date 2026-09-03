import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TicketXLocation } from '@/types/location';
import { TicketXMovie } from '@/types/movie';
import { TicketXTheatre } from '@/types/theatre';
import { TicketXShow } from '@/types/show';
import { TicketXEvent } from '@/types/event';

import { locations as staticLocations } from '@/data/locations';
import { movies as staticMovies } from '@/data/movies';
import { theatres as staticTheatres } from '@/data/theatres';
import { shows as staticShows } from '@/data/shows';
import { events as staticEvents } from '@/data/events';

// In-memory live store populated by Firestore listeners, falling back to static
let liveMovies: TicketXMovie[] = [...staticMovies];
let liveTheatres: TicketXTheatre[] = [...staticTheatres];
let liveShows: TicketXShow[] = [...staticShows];
let liveLocations: TicketXLocation[] = [...staticLocations];
let liveEvents: TicketXEvent[] = [...staticEvents];

// Initialize real-time listeners on client
if (typeof window !== 'undefined') {
  try {
    onSnapshot(collection(db, 'movies'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: TicketXMovie[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as TicketXMovie;
          if (data.status === 'published' || !data.status) {
            loaded.push({ ...data, id: d.id });
          }
        });
        if (loaded.length > 0) liveMovies = loaded;
      }
    });

    onSnapshot(collection(db, 'theatres'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: TicketXTheatre[] = [];
        snapshot.forEach((d) => {
          loaded.push({ ...(d.data() as TicketXTheatre), id: d.id });
        });
        if (loaded.length > 0) liveTheatres = loaded;
      }
    });

    onSnapshot(collection(db, 'shows'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: TicketXShow[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as TicketXShow & { status?: string };
          if (data.status === 'open' || !data.status) {
            loaded.push({ ...data, id: d.id });
          }
        });
        if (loaded.length > 0) liveShows = loaded;
      }
    });

    onSnapshot(collection(db, 'locations'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: TicketXLocation[] = [];
        snapshot.forEach((d) => {
          loaded.push({ ...(d.data() as TicketXLocation), id: d.id });
        });
        if (loaded.length > 0) liveLocations = loaded;
      }
    });

    onSnapshot(collection(db, 'events'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: TicketXEvent[] = [];
        snapshot.forEach((d) => {
          loaded.push({ ...(d.data() as TicketXEvent), id: d.id });
        });
        if (loaded.length > 0) liveEvents = loaded;
      }
    });
  } catch (err) {
    console.warn('Live Firestore listener initialization deferred:', err);
  }
}

export function getRowLabel(index: number): string {
  let label = '';
  let i = index;
  while (i >= 0) {
    label = String.fromCharCode((i % 26) + 65) + label;
    i = Math.floor(i / 26) - 1;
  }
  return label;
}

/**
 * Parses 12-hour time string like "02:30 PM", "12:40 PM", "01:00 PM"
 * into minutes since midnight for proper chronological sorting.
 */
export function parse12HourTime(timeStr: string): number {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

export function sortShowtimes(timeList: string[]): string[] {
  return [...timeList].sort((a, b) => parse12HourTime(a) - parse12HourTime(b));
}

export function getLocationById(locationId: string): TicketXLocation | undefined {
  return liveLocations.find((l) => l.id === locationId);
}

/**
 * Derive events for a location.
 */
export function getEventsForLocation(locationId: string): TicketXEvent[] {
  return liveEvents.filter((e) => e.cityId === locationId);
}

/**
 * Derive movies for a location based on shows.
 */
export function getMoviesForLocation(locationId: string, date?: string): (TicketXMovie & { theatreCount: number })[] {
  let locationShows = liveShows.filter((s) => s.locationId === locationId);
  if (date) {
    locationShows = locationShows.filter((s) => s.date === date);
  }

  const movieMap = new Map<string, Set<string>>();
  locationShows.forEach((s) => {
    if (!movieMap.has(s.movieId)) {
      movieMap.set(s.movieId, new Set());
    }
    movieMap.get(s.movieId)!.add(s.theatreId);
  });

  const result: (TicketXMovie & { theatreCount: number })[] = [];
  movieMap.forEach((theatreSet, movieId) => {
    const movieObj = liveMovies.find((m) => m.id === movieId);
    if (movieObj) {
      result.push({
        ...movieObj,
        theatreCount: theatreSet.size
      });
    }
  });

  // Fallback: If no location-specific shows are scheduled, present the full active catalogue with local cinema availability
  if (result.length === 0) {
    const localTheatresCount = liveTheatres.filter((t) => t.locationId === locationId).length;
    return liveMovies.map((m) => ({
      ...m,
      theatreCount: localTheatresCount > 0 ? localTheatresCount : 1,
    }));
  }

  return result;
}

/**
 * Derive theatres showing a specific movie in a location.
 */
export function getTheatresForMovie(
  movieId: string,
  locationId: string,
  date?: string,
  language?: string
): { theatre: TicketXTheatre; shows: TicketXShow[] }[] {
  const movieObj = liveMovies.find((m) => m.id === movieId);
  let matchedShows = liveShows.filter((s) => s.movieId === movieId && s.locationId === locationId);
  if (date) {
    matchedShows = matchedShows.filter((s) => s.date === date);
  }
  if (language) {
    const langLower = language.toLowerCase();
    matchedShows = matchedShows.filter((s) => {
      const showLang = s.language || (movieObj?.languages && movieObj.languages.length === 1 ? movieObj.languages[0] : (movieObj?.language || 'Telugu'));
      return showLang.toLowerCase() === langLower;
    });
  }

  const theatreMap = new Map<string, TicketXShow[]>();
  matchedShows.forEach((s) => {
    if (!theatreMap.has(s.theatreId)) {
      theatreMap.set(s.theatreId, []);
    }
    theatreMap.get(s.theatreId)!.push(s);
  });

  const result: { theatre: TicketXTheatre; shows: TicketXShow[] }[] = [];
  theatreMap.forEach((tShows, theatreId) => {
    const theatreObj = liveTheatres.find((t) => t.id === theatreId);
    if (theatreObj) {
      const sortedShows = [...tShows].sort((a, b) => parse12HourTime(a.time) - parse12HourTime(b.time));
      result.push({ theatre: theatreObj, shows: sortedShows });
    }
  });

  return result;
}

/**
 * Derive movies showing at a theatre.
 */
export function getMoviesForTheatre(
  theatreId: string,
  date?: string
): { movie: TicketXMovie; shows: TicketXShow[] }[] {
  let matchedShows = liveShows.filter((s) => s.theatreId === theatreId);
  if (date) {
    matchedShows = matchedShows.filter((s) => s.date === date);
  }

  const movieMap = new Map<string, TicketXShow[]>();
  matchedShows.forEach((s) => {
    if (!movieMap.has(s.movieId)) {
      movieMap.set(s.movieId, []);
    }
    movieMap.get(s.movieId)!.push(s);
  });

  const result: { movie: TicketXMovie; shows: TicketXShow[] }[] = [];
  movieMap.forEach((mShows, movieId) => {
    const movieObj = liveMovies.find((m) => m.id === movieId);
    if (movieObj) {
      const sortedShows = [...mShows].sort((a, b) => parse12HourTime(a.time) - parse12HourTime(b.time));
      result.push({ movie: movieObj, shows: sortedShows });
    }
  });

  return result;
}

/**
 * Get all theatres for a location.
 */
export function getTheatresForLocation(locationId: string): TicketXTheatre[] {
  return liveTheatres.filter((t) => t.locationId === locationId);
}

/**
 * Get available dates present in show data.
 */
export function getAvailableDatesForLocation(locationId: string): string[] {
  const datesSet = new Set<string>();
  liveShows.forEach((s) => {
    if (s.locationId === locationId) {
      datesSet.add(s.date);
    }
  });
  return Array.from(datesSet).sort();
}

export function getAvailableDatesForMovie(movieId: string, locationId: string): string[] {
  const datesSet = new Set<string>();
  liveShows.forEach((s) => {
    if (s.movieId === movieId && s.locationId === locationId) {
      datesSet.add(s.date);
    }
  });
  return Array.from(datesSet).sort();
}

