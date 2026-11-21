'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Area, Booking, Cinema, User } from '@/lib/types';
import { sortByDistance } from '@/lib/catalog';
import { CITY_COOKIE, cityCentre } from '@/lib/cities';
import { useCatalog } from './CatalogContext';

export type Toast = { id: string; message: string; tone?: 'info' | 'success' | 'error' };

export type Draft = {
  showId: string;
  seats: { id: string; tierId: string; price: number; label?: string }[];
  holdUntil: number | null;
  promo: string | null;
};

type Ctx = {
  hydrated: boolean;
  /** The user's chosen area in the current city (or their GPS location); null until chosen */
  area: Area | null;
  setArea: (a: Area) => void;
  /** Switches city: reloads that city's films, cinemas and showtimes */
  setCity: (cityId: string, area?: Area) => void;
  switchingCity: boolean;
  cityPickerOpen: boolean;
  openCityPicker: (open: boolean) => void;

  user: User | null;
  signIn: (u: User) => void;
  signOut: () => void;
  signInOpen: boolean;
  requireSignIn: (after?: () => void) => boolean;
  closeSignIn: () => void;

  watchlist: string[];
  toggleWatch: (movieId: string) => void;

  bookings: Booking[];
  addBooking: (b: Booking) => void;
  cancelBooking: (id: string, refund: number) => void;

  draft: Draft | null;
  setDraft: (d: Draft | null | ((prev: Draft | null) => Draft | null)) => void;

  toasts: Toast[];
  toast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: string) => void;

  searchOpen: boolean;
  setSearchOpen: (o: boolean) => void;
  trailerFor: string | null;
  playTrailer: (movieId: string | null) => void;
};

const TicketXContext = createContext<Ctx | null>(null);

function read<T>(storage: 'local' | 'session', key: string, fallback: T): T {
  try {
    const s = storage === 'local' ? window.localStorage : window.sessionStorage;
    const raw = s.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(storage: 'local' | 'session', key: string, value: unknown) {
  try {
    const s = storage === 'local' ? window.localStorage : window.sessionStorage;
    if (value === null || value === undefined) s.removeItem(key);
    else s.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

type StoredArea = Area & { city: string };

export function TicketXProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { city } = useCatalog();
  const [switchingCity, startSwitch] = useTransition();
  const [hydrated, setHydrated] = useState(false);
  const [storedArea, setStoredArea] = useState<StoredArea | null>(null);
  const area: Area | null = storedArea && storedArea.city === city.id ? storedArea : null;
  const [cityPickerOpen, openCityPicker] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const afterSignIn = useRef<(() => void) | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [draft, setDraftState] = useState<Draft | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [trailerFor, playTrailer] = useState<string | null>(null);

  useEffect(() => {
    const c = read<StoredArea | null>('local', 'tx.area', null);
    setStoredArea(c && typeof c.lat === 'number' && c.city ? c : null);
    setUser(read('local', 'tx.user', null));
    setWatchlist(read('local', 'tx.watchlist', []));
    setBookings(read('local', 'tx.bookings', []));
    setDraftState(read('session', 'tx.draft', null));
    setHydrated(true);
  }, []);

  const setArea = useCallback(
    (a: Area) => {
      const v = { ...a, city: city.id };
      setStoredArea(v);
      write('local', 'tx.area', v);
    },
    [city.id],
  );

  const setCity = useCallback(
    (cityId: string, a?: Area) => {
      if (a) {
        const v = { ...a, city: cityId };
        setStoredArea(v);
        write('local', 'tx.area', v);
      }
      if (cityId === city.id) return;
      document.cookie = `${CITY_COOKIE}=${cityId}; path=/; max-age=31536000; samesite=lax`;
      startSwitch(() => router.refresh());
    },
    [city.id, router],
  );

  const toast = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const signIn = useCallback((u: User) => {
    setUser(u);
    write('local', 'tx.user', u);
    setSignInOpen(false);
    const next = afterSignIn.current;
    afterSignIn.current = null;
    if (next) setTimeout(next, 50);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    write('local', 'tx.user', null);
  }, []);

  const requireSignIn = useCallback(
    (after?: () => void) => {
      if (user) return true;
      afterSignIn.current = after ?? null;
      setSignInOpen(true);
      return false;
    },
    [user],
  );

  const closeSignIn = useCallback(() => {
    afterSignIn.current = null;
    setSignInOpen(false);
  }, []);

  const toggleWatch = useCallback(
    (movieId: string) => {
      setWatchlist((w) => {
        const has = w.includes(movieId);
        const next = has ? w.filter((x) => x !== movieId) : [...w, movieId];
        write('local', 'tx.watchlist', next);
        return next;
      });
    },
    [],
  );

  const addBooking = useCallback((b: Booking) => {
    setBookings((all) => {
      const next = [b, ...all];
      write('local', 'tx.bookings', next);
      return next;
    });
  }, []);

  const cancelBooking = useCallback((id: string, refund: number) => {
    setBookings((all) => {
      const next = all.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const, refund } : b));
      write('local', 'tx.bookings', next);
      return next;
    });
  }, []);

  const setDraft = useCallback((d: Draft | null | ((prev: Draft | null) => Draft | null)) => {
    setDraftState((prev) => {
      const next = typeof d === 'function' ? d(prev) : d;
      write('session', 'tx.draft', next);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      hydrated,
      area,
      setArea,
      setCity,
      switchingCity,
      cityPickerOpen,
      openCityPicker,
      user,
      signIn,
      signOut,
      signInOpen,
      requireSignIn,
      closeSignIn,
      watchlist,
      toggleWatch,
      bookings,
      addBooking,
      cancelBooking,
      draft,
      setDraft,
      toasts,
      toast,
      dismissToast,
      searchOpen,
      setSearchOpen,
      trailerFor,
      playTrailer,
    }),
    [hydrated, area, setArea, setCity, switchingCity, cityPickerOpen, user, signIn, signOut, signInOpen, requireSignIn, closeSignIn, watchlist, toggleWatch, bookings, addBooking, cancelBooking, draft, setDraft, toasts, toast, dismissToast, searchOpen, trailerFor],
  );

  return <TicketXContext.Provider value={value}>{children}</TicketXContext.Provider>;
}

export function useTicketX() {
  const ctx = useContext(TicketXContext);
  if (!ctx) throw new Error('useTicketX must be used inside TicketXProvider');
  return ctx;
}

/** The user's area, defaulting to the city centre until they choose one. */
export function useArea(): Area {
  const { city } = useCatalog();
  return useTicketX().area ?? cityCentre(city);
}

/** The city's cinemas sorted by distance from the user's area. */
export function useCinemas(): Cinema[] {
  const area = useArea();
  const { cinemas } = useCatalog();
  return useMemo(() => sortByDistance(cinemas, area), [cinemas, area]);
}
