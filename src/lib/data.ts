import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import type { Movie, PosterArt, Screen, ScreenKind } from './types';
import { getCity } from './cities';
import { toCinema, type RawCinema } from './catalog';
import { formatName, slugify } from './normalize';
import type { CityPayload, RawSession } from './payload';

/**
 * Films, cinemas and showtimes per city, from the District snapshot in src/data.
 * Refresh it with `node scripts/snapshot.cjs`.
 */

type RawMovie = {
  id: number;
  name: string;
  desc: string;
  rel: string;
  cert: string;
  lang: string;
  langs: string[];
  genre: string[];
  dur: number;
  poster: string;
  hori: string;
  yt: string | null;
  trailers?: Record<string, string>;
  cast: { name: string; photo?: string }[];
  ratings: { by: string; value: number; base: number }[];
};

type RawCity = {
  city: string;
  fetchedAt: string;
  movies: number[];
  cinemas: RawCinema[];
  sessions: RawSession[];
};

const DATA = path.join(process.cwd(), 'src', 'data');

const readJson = <T,>(file: string): T => JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8')) as T;

const loadMovies = cache((): Map<number, RawMovie> => new Map(readJson<RawMovie[]>('movies.json').map((m) => [m.id, m])));
const loadUpcoming = cache((): number[] => {
  try {
    return readJson<number[]>('upcoming.json');
  } catch {
    return [];
  }
});

/** "Interested" counts from BookMyShow's upcoming list */
const INTERESTED: Record<number, number> = {
  201788: 93100, 196977: 8300, 187693: 5300, 201023: 6000, 213955: 4400, 239276: 210, 239280: 290,
};

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function artFor(title: string): PosterArt {
  const palettes: [string, string, string, string][] = [
    ['#101820', '#24384a', '#f1ece2', '#e8a33b'],
    ['#2a0f08', '#5a1e0c', '#f6dcb4', '#e8542a'],
    ['#0c2430', '#1d4b4a', '#eef4f2', '#5fb3b3'],
    ['#1b1530', '#2e2350', '#fff2d6', '#ffb347'],
  ];
  const [bg, bg2, ink, accent] = palettes[hashStr(title) % palettes.length];
  return { layout: 'frame', bg, bg2, ink, accent, font: 'anton' };
}

const cert = (c: string) => (c ? c.replace(/^UA(\d+)\+$/, 'UA $1+') : '');

/** Today's date in India */
export function istToday() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

function countBy<T extends string>(xs: T[]) {
  const m = new Map<T, number>();
  xs.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

function toMovie(d: RawMovie, status: Movie['status'], citySessions: RawSession[]): Movie {
  const mine = citySessions.filter((s) => s[0] === d.id);
  const critics = d.ratings.filter((r) => r.value > 0 && r.base > 0);
  const avg = critics.length ? critics.reduce((s, r) => s + (r.value / r.base) * 10, 0) / critics.length : undefined;
  const tba = !d.rel || d.rel.startsWith('2090');
  const languages = mine.length ? countBy(mine.map((s) => s[6]).filter(Boolean)) : d.langs;
  const formats = mine.length ? countBy(mine.map((s) => formatName(s[5]))) : ['2D'];
  const dates = mine.map((s) => s[2]).sort();
  const today = istToday();
  const tomorrow = new Date(Date.parse(today) + 86400000).toISOString().slice(0, 10);

  return {
    id: `${d.id}-${slugify(d.name)}`,
    did: d.id,
    title: d.name,
    tagline: '',
    synopsis: d.desc || 'Synopsis not available yet.',
    status,
    releaseDate: tba ? '' : d.rel,
    runtime: d.dur > 30 ? d.dur : 0,
    certificate: cert(d.cert) || (status === 'coming_soon' ? 'Not rated yet' : 'UA'),
    genres: d.genre.slice(0, 3),
    languages: languages.length ? languages : [d.lang],
    formats,
    rating: avg ? Math.round(avg * 10) / 10 : undefined,
    critics: critics.map((r) => ({ outlet: r.by, score: r.value, base: r.base })),
    interested: INTERESTED[d.id],
    director: '',
    writers: [],
    music: '',
    cinematography: '',
    cast: d.cast.map((c) => ({ name: c.name, role: '', photo: c.photo })),
    reviews: [],
    poster: artFor(d.name),
    posterUrl: d.poster || undefined,
    backdropUrl: d.hori || undefined,
    trailerKey: d.yt || undefined,
    popularity: mine.length,
    firstShow: dates[0],
    advance: status === 'now_showing' && !!dates[0] && dates[0] > tomorrow,
  };
}

function screenKind(total: number, reclinerOnly: boolean): ScreenKind {
  if (reclinerOnly && total < 120) return 'premium';
  if (total >= 380) return 'large';
  return 'standard';
}

export const getCityPayload = cache((cityId: string): CityPayload => {
  const city = getCity(cityId);
  let raw: RawCity;
  try {
    raw = readJson<RawCity>(`cities/${city.id}.json`);
  } catch {
    raw = { city: city.id, fetchedAt: new Date().toISOString(), movies: [], cinemas: [], sessions: [] };
  }
  const movies = loadMovies();

  // Drop sessions for dates already gone (snapshot from an earlier day)
  const today = istToday();
  const sessions = raw.sessions.filter((s) => s[2] >= today || raw.sessions.every((x) => x[2] < today));

  const showing = raw.movies.filter((id) => movies.has(id) && raw.sessions.some((s) => s[0] === id));
  const now = showing.map((id) => toMovie(movies.get(id)!, 'now_showing', raw.sessions)).sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  // Advance bookings go after films already running
  now.sort((a, b) => Number(!!a.advance) - Number(!!b.advance));
  const soon = loadUpcoming()
    .filter((id) => !showing.includes(id) && movies.has(id))
    .map((id) => toMovie(movies.get(id)!, 'coming_soon', []));

  const cinemas = raw.cinemas.map((c) => {
    const mine = raw.sessions.filter((s) => s[1] === c.id);
    const byAudi = new Map<string, RawSession[]>();
    mine.forEach((s) => byAudi.set(s[4], [...(byAudi.get(s[4]) ?? []), s]));
    const screens: Screen[] = [...byAudi.entries()].map(([name, ss]) => {
      const total = Math.max(...ss.map((s) => s[8].reduce((a, x) => a + x[2], 0)));
      const reclinerOnly = ss[0][8].every((x) => /reclin|lounge|sofa|bed/i.test(x[0]));
      return { name, formats: countBy(ss.map((s) => formatName(s[5]))), kind: screenKind(total, reclinerOnly) };
    });
    return toCinema(c, city.id, city.name, screens);
  });

  return { city: city.id, fetchedAt: raw.fetchedAt, movies: [...now, ...soon], cinemas, sessions };
});
