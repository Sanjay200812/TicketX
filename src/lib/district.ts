import type { Format, Language, Movie, PosterArt } from './types';
import raw from '@/data/district.json';

/**
 * Films listed for Hyderabad on District and BookMyShow, snapshotted into src/data/district.json.
 * Posters, cast photos, certificates, runtimes and trailers come from District's public listings.
 * Refresh the snapshot with scripts/district-snapshot.cjs.
 */

type Raw = {
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
  cast: { name: string; photo?: string }[];
  ratings: { by: string; value: number; base: number }[];
  status?: 'now_showing' | 'coming_soon';
};

const KNOWN: Language[] = ['Telugu', 'Tamil', 'Hindi', 'English', 'Malayalam', 'Kannada', 'Japanese', 'Marathi'];

/** Premium formats for the big releases, matching what Hyderabad's large-format screens are running */
const FORMATS: Record<number, Format[]> = {
  176735: ['2D', '3D', 'IMAX 3D', 'Dolby Cinema', 'PCX', '4DX'], // Avengers: Doomsday
  176276: ['2D', '3D', 'IMAX 3D', 'Dolby Cinema', 'PCX'], // Ramayana
  225928: ['2D', 'Dolby Cinema', 'PCX', 'IMAX 2D'], // O.M: Operation Mole
  219297: ['2D', 'IMAX 2D', 'Dolby Cinema'], // Godzilla Minus Zero
  174475: ['2D', 'IMAX 2D', 'Dolby Cinema'], // The Hunger Games
  203295: ['2D', 'Dolby Cinema', 'PCX'], // Aakasamlo Oka Tara
  227790: ['2D', 'Dolby Cinema'], // ENE Repeat
  233181: ['2D', 'Dolby Cinema'], // Scene
};

/** Rough order of how big each release is in Hyderabad this week; drives the home carousel */
const BUZZ: Record<number, number> = {
  225928: 100, 227790: 96, 203295: 92, 176735: 90, 176276: 86, 219297: 70, 233181: 66, 230033: 60,
  221047: 55, 233661: 52, 212781: 48, 239722: 44,
};

/** How many people tapped "interested" on upcoming films, from BookMyShow's upcoming list */
const INTERESTED: Record<number, number> = {
  201788: 93100, 196977: 8300, 187693: 5300, 201023: 6000, 213955: 4400, 239276: 210, 239280: 290,
};

function cert(c: string) {
  if (!c) return 'UA';
  return c.replace(/^UA(\d+)\+$/, 'UA $1+');
}

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
  const h = hashStr(title);
  const [bg, bg2, ink, accent] = palettes[h % palettes.length];
  return { layout: 'frame', bg, bg2, ink, accent, font: 'anton' };
}

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
}

function toMovie(d: Raw, status: Movie['status']): Movie {
  const languages = d.langs.filter((l): l is Language => (KNOWN as string[]).includes(l));
  // Hyderabad audiences mostly watch Telugu prints, so list Telugu first when there is one
  languages.sort((a, b) => (b === 'Telugu' ? 1 : 0) - (a === 'Telugu' ? 1 : 0));
  const critics = d.ratings.filter((r) => r.value > 0 && r.base > 0);
  const avg = critics.length ? critics.reduce((s, r) => s + (r.value / r.base) * 10, 0) / critics.length : undefined;
  const tba = d.rel.startsWith('2090');

  return {
    id: `${d.id}-${slug(d.name)}`,
    title: d.name,
    tagline: '',
    synopsis: d.desc || 'Synopsis not available yet.',
    status,
    releaseDate: tba ? '' : d.rel,
    runtime: d.dur > 30 ? d.dur : 0,
    certificate: d.cert ? cert(d.cert) : status === 'coming_soon' ? 'Not rated yet' : 'UA',
    genres: d.genre.slice(0, 3),
    languages: languages.length ? languages : ['Telugu'],
    formats: FORMATS[d.id] ?? ['2D'],
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
    popularity: BUZZ[d.id] ?? 10,
  };
}

/** The first 21 entries are on sale in Hyderabad now (listed on both District and BookMyShow); the rest are upcoming. */
const NOW_COUNT = 21;

export function districtMovies(): Movie[] {
  const list = raw as Raw[];
  return list
    .map((d, i) => toMovie(d, d.status ?? (i < NOW_COUNT ? 'now_showing' : 'coming_soon')))
    .sort((a, b) => (a.status === b.status ? (b.popularity ?? 0) - (a.popularity ?? 0) : a.status === 'now_showing' ? -1 : 1));
}
