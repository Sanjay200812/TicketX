import 'server-only';
import { cache } from 'react';
import type { Format, Language, Movie, PosterArt } from './types';
import { districtMovies } from './district';

/**
 * Live movie catalogue from The Movie Database (TMDB).
 * Set TMDB_API_KEY (v3 key) or TMDB_READ_ACCESS_TOKEN (v4 token) in .env.local.
 * Responses are cached for an hour. Without a key the app falls back to demo films.
 */

const API = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';
const REVALIDATE = 3600;

export type CatalogSource = 'tmdb' | 'district';
export type Catalog = { movies: Movie[]; source: CatalogSource; error?: string; updatedAt: string };

const LANG: Record<string, Language> = { te: 'Telugu', ta: 'Tamil', hi: 'Hindi', en: 'English', ml: 'Malayalam', kn: 'Kannada' };
/** How strongly each original language is weighted for a Hyderabad audience */
const LANG_WEIGHT: Record<string, number> = { te: 1.7, hi: 1.2, en: 1.15, ta: 1.1, ml: 0.95, kn: 0.9 };

type TmdbListItem = {
  id: number;
  title: string;
  original_title: string;
  original_language: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult?: boolean;
};

type TmdbDetail = TmdbListItem & {
  tagline: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  credits?: {
    cast: { name: string; character: string; order: number; profile_path: string | null }[];
    crew: { name: string; job: string; department: string }[];
  };
  videos?: { results: { key: string; site: string; type: string; official: boolean; iso_639_1: string }[] };
  release_dates?: { results: { iso_3166_1: string; release_dates: { certification: string; release_date: string; type: number }[] }[] };
};

function credentials(): { headers: Record<string, string>; query: string } | null {
  const key = process.env.TMDB_API_KEY?.trim();
  const token = process.env.TMDB_READ_ACCESS_TOKEN?.trim();
  if (token) return { headers: { Authorization: `Bearer ${token}` }, query: '' };
  if (key?.startsWith('eyJ')) return { headers: { Authorization: `Bearer ${key}` }, query: '' };
  if (key) return { headers: {}, query: `api_key=${encodeURIComponent(key)}` };
  return null;
}

async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const cred = credentials();
  if (!cred) throw new Error('No TMDB key');
  const qs = new URLSearchParams(params).toString();
  const url = `${API}${path}?${[qs, cred.query].filter(Boolean).join('&')}`;
  const res = await fetch(url, { headers: { accept: 'application/json', ...cred.headers }, next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`TMDB ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

function isoDay(offsetDays: number) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
}

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Fallback artwork when a film has no poster image */
function artFor(title: string): PosterArt {
  const palettes: [string, string, string, string][] = [
    ['#101820', '#24384a', '#f1ece2', '#e8a33b'],
    ['#2a0f08', '#5a1e0c', '#f6dcb4', '#e8542a'],
    ['#0c2430', '#1d4b4a', '#eef4f2', '#5fb3b3'],
    ['#1b1530', '#2e2350', '#fff2d6', '#ffb347'],
  ];
  const layouts: PosterArt['layout'][] = ['sun', 'bands', 'ridge', 'rings', 'frame', 'split'];
  const h = hashStr(title);
  const [bg, bg2, ink, accent] = palettes[h % palettes.length];
  return { layout: layouts[h % layouts.length], bg, bg2, ink, accent, font: 'anton' };
}

async function discover(range: { gte: string; lte: string }, page: number) {
  return tmdb<{ results: TmdbListItem[] }>('/discover/movie', {
    region: 'IN',
    with_release_type: '2|3',
    'release_date.gte': range.gte,
    'release_date.lte': range.lte,
    with_original_language: 'te|hi|ta|en|ml|kn',
    sort_by: 'popularity.desc',
    include_adult: 'false',
    page: String(page),
  });
}

function pickTop(items: TmdbListItem[], n: number) {
  const seen = new Set<number>();
  return items
    .filter((m) => m.poster_path && !m.adult && !seen.has(m.id) && seen.add(m.id))
    .map((m) => ({ m, score: m.popularity * (LANG_WEIGHT[m.original_language] ?? 0.8) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.m);
}

function languagesFor(orig: string, rank: number, total: number): Language[] {
  const base = LANG[orig] ?? 'English';
  const big = rank < Math.ceil(total * 0.4);
  switch (orig) {
    case 'te':
      return big ? ['Telugu', 'Hindi', 'Tamil'] : ['Telugu'];
    case 'ta':
    case 'ml':
    case 'kn':
      return [base, 'Telugu'];
    case 'hi':
      return big ? ['Hindi', 'Telugu'] : ['Hindi'];
    case 'en':
      return big ? ['English', 'Hindi', 'Telugu'] : ['English'];
    default:
      return [base];
  }
}

function formatsFor(orig: string, genres: string[], rank: number, total: number): Format[] {
  const f: Format[] = ['2D'];
  const big = rank < Math.ceil(total * 0.35);
  const spectacle = genres.some((g) => ['Action', 'Adventure', 'Science Fiction', 'Animation', 'Fantasy'].includes(g));
  if (spectacle && orig === 'en') f.push('3D');
  if (big) f.push('Dolby Cinema', 'PCX');
  if (big && spectacle) f.push('IMAX 2D');
  if (big && spectacle && orig === 'en') f.push('IMAX 3D');
  return f;
}

function toMovie(d: TmdbDetail, status: Movie['status'], rank: number, total: number): Movie {
  const genres = d.genres?.map((g) => g.name) ?? [];
  const inRelease = d.release_dates?.results.find((r) => r.iso_3166_1 === 'IN')?.release_dates ?? [];
  const cert = inRelease.map((r) => r.certification.trim()).find(Boolean);
  const inTheatrical = inRelease.filter((r) => r.type === 3 || r.type === 2).map((r) => r.release_date.slice(0, 10)).sort()[0];
  const crew = d.credits?.crew ?? [];
  const job = (...jobs: string[]) => crew.filter((c) => jobs.includes(c.job)).map((c) => c.name);
  const videos = (d.videos?.results ?? []).filter((v) => v.site === 'YouTube');
  const trailer =
    videos.find((v) => v.type === 'Trailer' && v.official) ?? videos.find((v) => v.type === 'Trailer') ?? videos.find((v) => v.type === 'Teaser');
  const showTitle = d.original_title !== d.title && d.original_language !== 'en';

  return {
    id: `${d.id}-${slug(d.title) || 'film'}`,
    tmdbId: d.id,
    title: d.title,
    originalTitle: showTitle ? d.original_title : undefined,
    tagline: d.tagline || '',
    synopsis: d.overview || 'Synopsis not available yet.',
    status,
    releaseDate: inTheatrical || d.release_date || isoDay(0),
    runtime: d.runtime && d.runtime > 30 ? d.runtime : 140,
    certificate: cert || 'UA',
    genres: genres.slice(0, 3),
    languages: languagesFor(d.original_language, rank, total),
    formats: formatsFor(d.original_language, genres, rank, total),
    rating: d.vote_count >= 10 ? Math.round(d.vote_average * 10) / 10 : undefined,
    votes: d.vote_count >= 10 ? d.vote_count : undefined,
    director: job('Director')[0] ?? '—',
    writers: Array.from(new Set(job('Screenplay', 'Writer', 'Story'))).slice(0, 2),
    music: job('Original Music Composer', 'Music')[0] ?? '—',
    cinematography: job('Director of Photography')[0] ?? '—',
    cast: (d.credits?.cast ?? [])
      .sort((a, b) => a.order - b.order)
      .slice(0, 12)
      .map((c) => ({ name: c.name, role: c.character || '—', photo: c.profile_path ? `${IMG}/w185${c.profile_path}` : undefined })),
    reviews: [],
    poster: artFor(d.title),
    posterUrl: d.poster_path ? `${IMG}/w500${d.poster_path}` : undefined,
    backdropUrl: d.backdrop_path ? `${IMG}/w1280${d.backdrop_path}` : undefined,
    trailerKey: trailer?.key,
    popularity: d.popularity,
  };
}

async function loadTmdb(): Promise<Movie[]> {
  const nowRange = { gte: isoDay(-45), lte: isoDay(0) };
  const soonRange = { gte: isoDay(1), lte: isoDay(75) };
  const [n1, n2, s1] = await Promise.all([discover(nowRange, 1), discover(nowRange, 2), discover(soonRange, 1)]);
  const now = pickTop([...n1.results, ...n2.results], 16);
  const soon = pickTop(s1.results, 10).filter((m) => !now.some((x) => x.id === m.id));

  const detail = (m: TmdbListItem) =>
    tmdb<TmdbDetail>(`/movie/${m.id}`, { append_to_response: 'credits,videos,release_dates', language: 'en-US' }).catch(() => null);
  const [nowD, soonD] = await Promise.all([Promise.all(now.map(detail)), Promise.all(soon.map(detail))]);

  const movies = [
    ...nowD.flatMap((d, i) => (d ? [toMovie(d, 'now_showing', i, now.length)] : [])),
    ...soonD.flatMap((d, i) => (d ? [toMovie(d, 'coming_soon', i, soon.length)] : [])),
  ];
  // A film TMDB lists as released but with a future Indian date belongs in Coming soon
  const today = isoDay(0);
  return movies.map((m) => (m.status === 'now_showing' && m.releaseDate > today ? { ...m, status: 'coming_soon' as const } : m));
}

export const getCatalog = cache(async (): Promise<Catalog> => {
  const updatedAt = new Date().toISOString();
  // Without a TMDB key, use the Hyderabad listings snapshotted from District and BookMyShow
  if (!credentials()) return { movies: districtMovies(), source: 'district', updatedAt };
  try {
    const movies = await loadTmdb();
    if (movies.filter((m) => m.status === 'now_showing').length === 0) throw new Error('TMDB returned no films');
    return { movies, source: 'tmdb', updatedAt };
  } catch (e) {
    console.error('[tmdb]', e);
    return { movies: districtMovies(), source: 'district', error: e instanceof Error ? e.message : String(e), updatedAt };
  }
});
