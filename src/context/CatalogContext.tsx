'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { Movie } from '@/lib/types';

type CatalogCtx = {
  movies: Movie[];
  nowShowing: Movie[];
  comingSoon: Movie[];
  featured: Movie[];
  source: 'tmdb' | 'district';
  getMovie: (id: string) => Movie | undefined;
};

const Ctx = createContext<CatalogCtx | null>(null);

export function CatalogProvider({ movies, source, children }: { movies: Movie[]; source: 'tmdb' | 'district'; children: React.ReactNode }) {
  const value = useMemo<CatalogCtx>(() => {
    const byId = new Map(movies.map((m) => [m.id, m]));
    const nowShowing = movies.filter((m) => m.status === 'now_showing');
    const comingSoon = movies.filter((m) => m.status === 'coming_soon').sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
    const featured =
      [...nowShowing]
        .filter((m) => m.backdropUrl && m.posterUrl)
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .slice(0, 6);
    return {
      movies,
      nowShowing,
      comingSoon,
      featured: featured.length >= 3 ? featured : nowShowing.slice(0, 5),
      source,
      getMovie: (id: string) => byId.get(id) ?? (/^\d+/.test(id) ? movies.find((m) => m.tmdbId === parseInt(id, 10)) : undefined),
    };
  }, [movies, source]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalog() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCatalog must be used inside CatalogProvider');
  return c;
}
