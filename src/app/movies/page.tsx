'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { Page } from '@/components/Page';
import { MovieCard } from '@/components/MovieCard';
import { Chip } from '@/components/ui';
import type { Format, Language, Movie } from '@/lib/types';
import { useCatalog } from '@/context/CatalogContext';

const LANGS: Language[] = ['Telugu', 'Tamil', 'Hindi', 'English', 'Malayalam', 'Kannada', 'Japanese'];
const FORMATS: Format[] = ['2D', '3D', 'IMAX 2D', 'IMAX 3D', 'Dolby Cinema', 'PCX'];
const SORTS = {
  popular: { label: 'Popularity', fn: (a: Movie, b: Movie) => (b.popularity ?? b.votes ?? b.interested ?? 0) - (a.popularity ?? a.votes ?? a.interested ?? 0) },
  rating: { label: 'Rating', fn: (a: Movie, b: Movie) => (b.rating ?? 0) - (a.rating ?? 0) },
  release: { label: 'Release date', fn: (a: Movie, b: Movie) => b.releaseDate.localeCompare(a.releaseDate) },
  az: { label: 'A – Z', fn: (a: Movie, b: Movie) => a.title.localeCompare(b.title) },
} as const;

export default function MoviesPage() {
  return (
    <Suspense fallback={null}>
      <Movies />
    </Suspense>
  );
}

function Movies() {
  const params = useSearchParams();
  const router = useRouter();
  const { movies } = useCatalog();
  const GENRES = useMemo(() => Array.from(new Set(movies.flatMap((m) => m.genres))).sort(), [movies]);
  const status = params.get('status') === 'coming_soon' ? 'coming_soon' : 'now_showing';
  const [langs, setLangs] = useState<Language[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [sort, setSort] = useState<keyof typeof SORTS>('popular');

  const list = useMemo(
    () =>
      movies.filter(
        (m) =>
          m.status === status &&
          (langs.length === 0 || m.languages.some((l) => langs.includes(l))) &&
          (genres.length === 0 || m.genres.some((g) => genres.includes(g))) &&
          (formats.length === 0 || m.formats.some((f) => formats.includes(f))),
      ).sort(SORTS[sort].fn),
    [movies, status, langs, genres, formats, sort],
  );

  const toggle = <T,>(arr: T[], set: (v: T[]) => void, v: T) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const active = langs.length + genres.length + formats.length;

  return (
    <Page>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Movies</h1>
            <div className="mt-4 flex gap-1 rounded-lg border border-line p-1">
              {(['now_showing', 'coming_soon'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => router.replace(s === 'now_showing' ? '/movies' : '/movies?status=coming_soon', { scroll: false })}
                  className={clsx('relative rounded-md px-4 py-1.5 text-sm font-medium transition-colors', status === s ? 'text-canvas' : 'text-muted hover:text-cream')}
                >
                  {status === s && <motion.span layoutId="status-pill" className="absolute inset-0 rounded-md bg-cream" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                  <span className="relative">{s === 'now_showing' ? 'Now showing' : 'Coming soon'}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="relative flex items-center gap-2 text-sm text-muted">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as keyof typeof SORTS)}
              className="h-9 appearance-none rounded-lg border border-line-strong bg-panel pl-3 pr-8 text-sm text-cream outline-none"
            >
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5" />
          </label>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Filters</span>
              {active > 0 && (
                <button
                  onClick={() => {
                    setLangs([]);
                    setGenres([]);
                    setFormats([]);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-marquee hover:underline"
                >
                  <X size={12} /> Clear ({active})
                </button>
              )}
            </div>
            <Group label="Language">
              {LANGS.map((l) => (
                <Chip key={l} active={langs.includes(l)} onClick={() => toggle(langs, setLangs, l)}>
                  {l}
                </Chip>
              ))}
            </Group>
            <Group label="Genre">
              {GENRES.map((g) => (
                <Chip key={g} active={genres.includes(g)} onClick={() => toggle(genres, setGenres, g)}>
                  {g}
                </Chip>
              ))}
            </Group>
            <Group label="Format">
              {FORMATS.map((f) => (
                <Chip key={f} active={formats.includes(f)} onClick={() => toggle(formats, setFormats, f)}>
                  {f}
                </Chip>
              ))}
            </Group>
          </aside>

          <div className="min-w-0">
            <p className="mb-5 text-sm text-muted">
              {list.length} {list.length === 1 ? 'film' : 'films'}
            </p>
            <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {list.map((m) => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <MovieCard movie={m} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {list.length === 0 && (
              <div className="rounded-xl border border-dashed border-line py-20 text-center">
                <p className="font-medium">No films match these filters</p>
                <p className="mt-1 text-sm text-muted">Try removing a language or genre.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-faint">{label}</div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">{children}</div>
    </div>
  );
}
