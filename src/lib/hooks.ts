'use client';

import { useEffect, useState } from 'react';
import { showDateTime } from './shows';

/** Current time, set after mount (avoids hydration mismatch) and refreshed every 30s. */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/** Bookings close 15 minutes after the scheduled start (trailers + ads run first). */
export function isPast(date: string, time: string, now: number | null) {
  if (now === null) return false;
  return showDateTime(date, time).getTime() + 15 * 60 * 1000 < now;
}

export function useFavCinemas() {
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    try {
      setFavs(JSON.parse(localStorage.getItem('tx.favCinemas') || '[]'));
    } catch {}
  }, []);
  const toggle = (id: string) =>
    setFavs((f) => {
      const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
      try {
        localStorage.setItem('tx.favCinemas', JSON.stringify(next));
      } catch {}
      return next;
    });
  return { favs, toggle };
}
