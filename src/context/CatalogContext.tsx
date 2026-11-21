'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { Cinema, City, Movie } from '@/lib/types';
import type { CityPayload } from '@/lib/payload';
import { buildIndex, type ShowIndex } from '@/lib/shows';
import { getCity } from '@/lib/cities';

type CatalogCtx = {
  city: City;
  fetchedAt: string;
  movies: Movie[];
  nowShowing: Movie[];
  comingSoon: Movie[];
  featured: Movie[];
  cinemas: Cinema[];
  index: ShowIndex;
  getMovie: (id: string) => Movie | undefined;
};

const Ctx = createContext<CatalogCtx | null>(null);

export function CatalogProvider({ payload, children }: { payload: CityPayload; children: React.ReactNode }) {
  const value = useMemo<CatalogCtx>(() => {
    const { movies, cinemas } = payload;
    const byId = new Map(movies.map((m) => [m.id, m]));
    const nowShowing = movies.filter((m) => m.status === 'now_showing');
    const comingSoon = movies.filter((m) => m.status === 'coming_soon').sort((a, b) => (a.releaseDate || '9').localeCompare(b.releaseDate || '9'));
    const featured = nowShowing.filter((m) => m.backdropUrl && m.posterUrl && !m.advance).slice(0, 6);
    return {
      city: getCity(payload.city),
      fetchedAt: payload.fetchedAt,
      movies,
      nowShowing,
      comingSoon,
      featured: featured.length >= 3 ? featured : nowShowing.slice(0, 5),
      cinemas,
      index: buildIndex(payload),
      // Links may use the full id ("225928-o-m-operation-mole") or just District's number
      getMovie: (id: string) => byId.get(id) ?? (/^\d+/.test(id) ? movies.find((m) => m.did === parseInt(id, 10)) : undefined),
    };
  }, [payload]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalog() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCatalog must be used inside CatalogProvider');
  return c;
}
