import type { Cinema, Movie, Seat, SeatLayout, SeatTier, Show } from './types';
import type { CityPayload, RawSession } from './payload';
import { formatName, isReclinerClass, className, slugify } from './normalize';

/* ---------- deterministic randomness ---------- */
export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: string) {
  let a = hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- dates ---------- */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateKey(k: string): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function upcomingDates(count = 7, from = new Date()): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(dateKey(new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)));
  return out;
}

export function showDateTime(date: string, time: string): Date {
  const d = parseDateKey(date);
  const [h, m] = time.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

const daysBetween = (a: string, b: string) => Math.round((parseDateKey(b).getTime() - parseDateKey(a).getTime()) / 86400000);

/* ---------- index over the city's listings ---------- */
export type ShowIndex = {
  city: string;
  movies: Movie[];
  cinemas: Cinema[];
  byMovie: Map<number, RawSession[]>;
  /** For each film, the listed dates and the busiest one (used to carry the schedule forward) */
  movieDates: Map<number, { dates: string[]; template: string }>;
};

export function buildIndex(p: CityPayload): ShowIndex {
  const byMovie = new Map<number, RawSession[]>();
  for (const s of p.sessions) byMovie.set(s[0], [...(byMovie.get(s[0]) ?? []), s]);
  const movieDates = new Map<number, { dates: string[]; template: string }>();
  for (const [did, ss] of byMovie) {
    const count = new Map<string, number>();
    ss.forEach((s) => count.set(s[2], (count.get(s[2]) ?? 0) + 1));
    const dates = [...count.keys()].sort();
    const template = [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
    movieDates.set(did, { dates, template });
  }
  return { city: p.city, movies: p.movies, cinemas: p.cinemas, byMovie, movieDates };
}

/** Dates to offer in the date strip for a film */
export function datesForMovie(ix: ShowIndex, movie: Movie, count = 7): string[] {
  const md = ix.movieDates.get(movie.did);
  const today = dateKey(new Date());
  if (!md) return upcomingDates(count);
  if (movie.advance || md.dates[0] > dateKey(new Date(Date.now() + 86400000))) {
    return md.dates.filter((d) => d >= today).slice(0, count);
  }
  return upcomingDates(count);
}

function showId(city: string, s: RawSession, date: string) {
  const tag = (hash(`${s[4]}|${s[5]}|${s[6]}`) % 46656).toString(36);
  return `${city}.${s[0]}.${s[1]}.${date.replace(/-/g, '')}.${s[3].replace(':', '')}.${tag}`;
}

function toShow(ix: ShowIndex, s: RawSession, movie: Movie, date: string, listed: boolean): Show {
  const id = showId(ix.city, s, date);
  let classes = s[8].filter((c) => c[2] > 0).map(([label, price, total, avail]) => ({ label: className(label), price, total, avail: Math.max(0, Math.min(total, avail)) }));
  if (!listed) {
    // Carried-forward days: estimate how full the show is from the time of day and how far ahead it is
    const r = rng(`occ|${id}`);
    const hour = Number(s[3].slice(0, 2));
    const ahead = Math.max(0, daysBetween(dateKey(new Date()), date));
    const weekend = [0, 5, 6].includes(parseDateKey(date).getDay());
    const prime = hour >= 18 && hour <= 21 ? 0.18 : hour < 12 ? -0.12 : 0;
    const buzz = Math.min(0.25, (movie.popularity ?? 0) / 600);
    const sold = Math.max(0.02, Math.min(0.97, 0.28 + prime + buzz + (weekend ? 0.15 : 0) - ahead * 0.06 + (r() - 0.5) * 0.35));
    classes = classes.map((c, i) => {
      const rr = rng(`cls|${id}|${i}`)();
      return { ...c, avail: Math.max(0, Math.round(c.total * (1 - Math.min(0.99, sold * (0.75 + rr * 0.5))))) };
    });
  }
  const total = classes.reduce((a, c) => a + c.total, 0);
  const avail = classes.reduce((a, c) => a + c.avail, 0);
  const prices = classes.map((c) => c.price);
  return {
    id,
    city: ix.city,
    movieId: movie.id,
    cinemaId: String(s[1]),
    date,
    time: s[3],
    screen: s[4],
    format: formatName(s[5]),
    language: s[6] || movie.languages[0],
    tag: s[7] || undefined,
    classes,
    occupancy: total ? 1 - avail / total : 1,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    listed,
  };
}

/** Sessions of a film on a date: as listed, or carried forward from its busiest listed day */
function sessionsOn(ix: ShowIndex, movie: Movie, date: string): { sessions: RawSession[]; listed: boolean } {
  const all = ix.byMovie.get(movie.did);
  const md = ix.movieDates.get(movie.did);
  if (!all || !md) return { sessions: [], listed: true };
  if (md.dates.includes(date)) return { sessions: all.filter((s) => s[2] === date), listed: true };
  if (movie.advance || date < md.dates[0]) return { sessions: [], listed: true };
  if (daysBetween(dateKey(new Date()), date) > 6) return { sessions: [], listed: true };
  return { sessions: all.filter((s) => s[2] === md.template), listed: false };
}

export function showsForMovieAtCinema(ix: ShowIndex, movie: Movie, cinema: Cinema, date: string): Show[] {
  const { sessions, listed } = sessionsOn(ix, movie, date);
  return sessions
    .filter((s) => String(s[1]) === cinema.id)
    .map((s) => toShow(ix, s, movie, date, listed))
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function showsForMovie(ix: ShowIndex, movie: Movie, cinemas: Cinema[], date: string) {
  const { sessions, listed } = sessionsOn(ix, movie, date);
  const byCinema = new Map<string, Show[]>();
  for (const s of sessions) {
    const sh = toShow(ix, s, movie, date, listed);
    byCinema.set(sh.cinemaId, [...(byCinema.get(sh.cinemaId) ?? []), sh]);
  }
  return cinemas
    .filter((c) => byCinema.has(c.id))
    .map((cinema) => ({ cinema, shows: byCinema.get(cinema.id)!.sort((a, b) => a.time.localeCompare(b.time)) }));
}

export function showsAtCinema(ix: ShowIndex, cinema: Cinema, movies: Movie[], date: string) {
  return movies
    .filter((m) => m.status === 'now_showing')
    .map((movie) => ({ movie, shows: showsForMovieAtCinema(ix, movie, cinema, date) }))
    .filter((g) => g.shows.length > 0);
}

export function parseShowId(showId: string) {
  const parts = showId.split('.');
  if (parts.length !== 6) return null;
  const [city, did, cid, ymd] = parts;
  if (ymd.length !== 8) return null;
  return { city, did: Number(did), cinemaId: cid, date: `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}` };
}

export function getShow(ix: ShowIndex, showId: string): { show: Show; movie: Movie; cinema: Cinema } | null {
  const p = parseShowId(showId);
  if (!p || p.city !== ix.city) return null;
  const movie = ix.movies.find((m) => m.did === p.did);
  const cinema = ix.cinemas.find((c) => c.id === p.cinemaId);
  if (!movie || !cinema) return null;
  const show = showsForMovieAtCinema(ix, movie, cinema, p.date).find((s) => s.id === showId);
  return show ? { show, movie, cinema } : null;
}

export function availability(occ: number): { label: string; tone: 'ok' | 'warn' | 'low' | 'full' } {
  if (occ >= 0.995) return { label: 'Sold out', tone: 'full' };
  if (occ >= 0.85) return { label: 'Almost full', tone: 'low' };
  if (occ >= 0.6) return { label: 'Filling fast', tone: 'warn' };
  return { label: 'Available', tone: 'ok' };
}

/* ---------- seat plan ---------- */
const ROW_LETTERS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'.split('');
const rowName = (i: number) => (i < ROW_LETTERS.length ? ROW_LETTERS[i] : ROW_LETTERS[Math.floor(i / ROW_LETTERS.length) - 1] + ROW_LETTERS[i % ROW_LETTERS.length]);

/** Splits a row into blocks separated by aisles */
function blocksFor(n: number, recliner: boolean): number[] {
  if (recliner) return n >= 10 ? [Math.ceil(n / 2), Math.floor(n / 2)] : [n];
  if (n >= 16) {
    const side = Math.round(n * 0.2);
    return [side, n - side * 2, side];
  }
  if (n >= 9) return [Math.ceil(n / 2), Math.floor(n / 2)];
  return [n];
}

/**
 * The auditorium plan for a show. Each seat class keeps its listed seat count and price; dearer classes sit
 * at the back. Exactly the listed number of seats per class show as sold, favouring the centre.
 */
export function seatLayout(show: Show, opts: { taken?: string[]; wheelchair?: boolean } = {}): SeatLayout {
  const taken = opts.taken ?? [];
  const classes = [...show.classes].sort((a, b) => b.price - a.price);
  const grand = classes.reduce((a, c) => a + c.total, 0);
  const width = Math.max(10, Math.min(30, Math.round(Math.sqrt(grand * 1.7))));

  type Plan = { tier: SeatTier; sizes: number[] };
  const plans: Plan[] = classes.map((c, i) => {
    const recliner = isReclinerClass(c.label) && c.total <= Math.max(140, grand * 0.5);
    const w = recliner ? Math.max(4, Math.round(width * 0.6)) : width;
    const nRows = Math.max(1, Math.ceil(c.total / w));
    const base = Math.floor(c.total / nRows);
    const extra = c.total % nRows;
    const sizes = Array.from({ length: nRows }, (_, r) => base + (r < extra ? 1 : 0));
    return {
      tier: { id: `${slugify(c.label) || 'class'}-${i}`, label: c.label, price: c.price, rows: [], recliner, total: c.total, avail: c.avail },
      sizes,
    };
  });

  const totalRows = plans.reduce((a, p) => a + p.sizes.length, 0);
  let rowCursor = totalRows - 1; // back row first; the row nearest the screen is A
  const rows: SeatLayout['rows'] = [];

  for (const { tier, sizes } of plans) {
    const seatsInClass: Seat[] = [];
    const classRows: { row: string; cells: (Seat | null)[] }[] = [];
    sizes.forEach((n, ri) => {
      const row = rowName(rowCursor--);
      tier.rows.push(row);
      const cells: (Seat | null)[] = [];
      let num = 1;
      blocksFor(n, tier.recliner).forEach((size, bi) => {
        if (bi > 0) cells.push(null);
        for (let k = 0; k < size; k++) {
          const seat: Seat = { id: `${row}${num}`, row, number: num, tierId: tier.id, status: 'available' };
          // Weight for being sold: centre seats and the middle rows of the class go first
          const centrality = 1 - Math.abs((num - 0.5 - n / 2) / (n / 2));
          const depth = sizes.length > 1 ? 1 - Math.abs(ri / (sizes.length - 1) - 0.4) : 1;
          (seat as Seat & { w: number }).w = 0.35 + centrality * 0.9 + depth * 0.35;
          cells.push(seat);
          seatsInClass.push(seat);
          num++;
        }
      });
      classRows.push({ row, cells });
    });

    // Mark exactly (total − free) seats as sold
    const soldCount = Math.max(0, tier.total - tier.avail);
    const r = rng(`seats|${show.id}|${tier.id}`);
    const ranked = seatsInClass
      .map((s) => ({ s, key: Math.pow(r(), 1 / (s as Seat & { w: number }).w) }))
      .sort((a, b) => b.key - a.key);
    ranked.slice(0, soldCount).forEach(({ s }) => (s.status = 'sold'));
    seatsInClass.forEach((s) => {
      delete (s as Partial<Seat & { w: number }>).w;
      if (taken.includes(s.id)) s.status = 'sold';
    });
    classRows.forEach((cr) => rows.push({ row: cr.row, tierId: tier.id, cells: cr.cells }));
  }

  // Wheelchair spaces: the aisle seats of the front row
  if (opts.wheelchair && rows.length) {
    const front = rows[rows.length - 1].cells.filter((c): c is Seat => !!c);
    [front[0], front[front.length - 1]].forEach((s) => s && s.status === 'available' && (s.wheelchair = true));
  }

  return { tiers: plans.map((p) => p.tier), rows };
}

export const BOOKING_HOLD_MS = 8 * 60 * 1000;
