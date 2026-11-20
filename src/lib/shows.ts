import { CINEMAS } from './catalog';
import type { Cinema, Format, Language, Movie, Screen, ScreenKind, Seat, SeatLayout, SeatTier, Show } from './types';

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
  for (let i = 0; i < count; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    out.push(dateKey(d));
  }
  return out;
}

export function showDateTime(date: string, time: string): Date {
  const d = parseDateKey(date);
  const [h, m] = time.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

/* ---------- showtimes ---------- */
const SLOTS = ['08:45', '09:30', '10:15', '11:20', '12:40', '13:30', '14:45', '15:50', '16:30', '17:45', '18:50', '19:30', '20:40', '21:45', '22:30', '23:15'];

const FORMAT_MULT: Record<Format, number> = {
  '2D': 1,
  '3D': 1.25,
  'IMAX 2D': 1.75,
  'IMAX 3D': 1.95,
  '4DX': 1.9,
  'Dolby Cinema': 1.6,
  PCX: 1.45,
};

const TIER_BASE = { 1: 140, 2: 210, 3: 280 } as const;

function round10(n: number) {
  return Math.round(n / 10) * 10;
}

function isWeekend(date: string) {
  const day = parseDateKey(date).getDay();
  return day === 0 || day === 5 || day === 6;
}

export function screenOf(cinema: Cinema, name: string): Screen {
  return cinema.screens.find((s) => s.name === name) ?? cinema.screens[0];
}

export function seatTiers(cinema: Cinema, kind: ScreenKind, format: Format, date: string, time: string): SeatTier[] {
  const hour = Number(time.slice(0, 2));
  let base = TIER_BASE[cinema.priceTier] * FORMAT_MULT[format];
  if (isWeekend(date)) base *= 1.12;
  if (hour >= 18) base *= 1.08;
  if (hour < 12) base *= 0.85;
  const classic = round10(base);
  if (kind === 'premium') {
    return [
      { id: 'recliner', label: 'Recliner', price: round10(classic * 2.4), rows: [] },
      { id: 'luxe', label: 'Luxe', price: round10(classic * 1.9), rows: [] },
    ];
  }
  if (kind === 'single') {
    return [
      { id: 'balcony', label: 'Balcony', price: round10(classic * 1.4), rows: [] },
      { id: 'first', label: 'First Class', price: classic, rows: [] },
      { id: 'second', label: 'Second Class', price: round10(classic * 0.6), rows: [] },
    ];
  }
  const tiers: SeatTier[] = [];
  if (cinema.amenities.includes('Recliners')) tiers.push({ id: 'recliner', label: 'Recliner', price: round10(classic * 2.2), rows: [] });
  tiers.push({ id: 'prime', label: 'Prime', price: round10(classic * 1.3), rows: [] });
  tiers.push({ id: 'classic', label: 'Classic', price: classic, rows: [] });
  return tiers;
}

function screensFor(cinema: Cinema, movie: Movie) {
  return cinema.screens
    .map((s, idx) => ({ ...s, idx, formats: s.formats.filter((f) => movie.formats.includes(f)) }))
    .filter((s) => s.formats.length > 0);
}

/** All shows of a movie in a cinema on a date. Deterministic. */
export function showsForMovieAtCinema(movie: Movie, cinema: Cinema, date: string): Show[] {
  if (movie.status !== 'now_showing') return [];
  if (date < movie.releaseDate) return [];
  const r = rng(`${movie.id}|${cinema.id}|${date}`);
  // Not every cinema plays every film: big releases are everywhere, single screens run one or two films
  const big = movie.formats.some((f) => f !== '2D' && f !== '3D');
  const single = cinema.screens.length === 1;
  const playChance = single ? (big ? 0.6 : 0.18) : big ? 0.95 : 0.45 + (movie.rating ?? 6.5) / 30;
  if (rng(`${movie.id}|${cinema.id}`)() > playChance) return [];

  const screens = screensFor(cinema, movie);
  if (screens.length === 0) return [];

  // Hyderabad cinemas favour Telugu prints, then the film's original language
  const langs = [...movie.languages].sort((a, b) => {
    const score = (l: Language) => (l === 'Telugu' ? 2 : l === movie.languages[0] ? 1 : 0);
    return score(b) - score(a);
  });

  const shows: Show[] = [];
  const used = new Set<string>();
  const count = single ? 3 + Math.floor(r() * 2) : 2 + Math.floor(r() * (big ? 5 : 3));
  for (let i = 0; i < count; i++) {
    const screen = screens[Math.floor(r() * screens.length)];
    const format = screen.formats[Math.floor(r() * screen.formats.length)];
    const language = r() < 0.7 ? langs[0] : langs[Math.floor(r() * langs.length)];
    const slot = SLOTS[Math.floor(r() * SLOTS.length)];
    const key = `${screen.idx}-${slot}`;
    if (used.has(slot) || used.has(key)) continue;
    used.add(slot);
    const hour = Number(slot.slice(0, 2));
    const popularity = Math.min(1, ((movie.rating ?? 7) - 6) / 3.2);
    const daysAhead = Math.max(0, (parseDateKey(date).getTime() - parseDateKey(dateKeyToday()).getTime()) / 86400000);
    let occ = 0.15 + popularity * 0.45 + (hour >= 18 && hour <= 21 ? 0.2 : 0) + (isWeekend(date) ? 0.15 : 0) - daysAhead * 0.07 + (r() - 0.5) * 0.3;
    occ = Math.max(0.04, Math.min(0.99, occ));
    const tiers = seatTiers(cinema, screen.kind, format, date, slot);
    shows.push({
      id: `${movie.id}.${cinema.id}.${date.replace(/-/g, '')}.${slot.replace(':', '')}`,
      movieId: movie.id,
      cinemaId: cinema.id,
      date,
      time: slot,
      screen: screen.name,
      format,
      language,
      occupancy: occ,
      minPrice: Math.min(...tiers.map((t) => t.price)),
      maxPrice: Math.max(...tiers.map((t) => t.price)),
    });
  }
  return shows.sort((a, b) => a.time.localeCompare(b.time));
}

function dateKeyToday() {
  return dateKey(new Date());
}

export function showsForMovie(movie: Movie, cinemas: Cinema[], date: string) {
  return cinemas
    .map((cinema) => ({ cinema, shows: showsForMovieAtCinema(movie, cinema, date) }))
    .filter((g) => g.shows.length > 0);
}

export function showsAtCinema(cinema: Cinema, movies: Movie[], date: string) {
  return movies.map((movie) => ({ movie, shows: showsForMovieAtCinema(movie, cinema, date) })).filter((g) => g.shows.length > 0);
}

export function getShow(showId: string, movies: Movie[]): { show: Show; movie: Movie; cinema: Cinema } | null {
  const parts = showId.split('.');
  if (parts.length !== 4) return null;
  const [movieId, cinemaId, ymd, hhmm] = parts;
  const movie = movies.find((m) => m.id === movieId);
  const cinema = CINEMAS.find((c) => c.id === cinemaId);
  if (!movie || !cinema || ymd.length !== 8) return null;
  const date = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
  const time = `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}`;
  const show = showsForMovieAtCinema(movie, cinema, date).find((s) => s.time === time);
  if (!show) return null;
  return { show, movie, cinema };
}

export function availability(occ: number): { label: string; tone: 'ok' | 'warn' | 'low' | 'full' } {
  if (occ >= 0.985) return { label: 'Sold out', tone: 'full' };
  if (occ >= 0.85) return { label: 'Almost full', tone: 'low' };
  if (occ >= 0.6) return { label: 'Filling fast', tone: 'warn' };
  return { label: 'Available', tone: 'ok' };
}

/* ---------- seat map ---------- */
export function seatLayout(show: Show, cinema: Cinema, takenByUser: string[] = []): SeatLayout {
  const kind = screenOf(cinema, show.screen).kind;
  const tiers = seatTiers(cinema, kind, show.format, show.date, show.time);
  const shape = SHAPES[kind];
  const rowCount = shape.rows;
  const letters = 'ABCDEFGHJKLMNOPQRSTU'.split('').slice(0, rowCount).reverse(); // A is nearest the screen, listed last

  // Assign rows to tiers from the back
  const rowsByTier: Record<string, string[]> = {};
  let cursor = 0;
  tiers.forEach((t, i) => {
    let n: number;
    if (t.id === 'recliner') n = kind === 'premium' ? 3 : 2;
    else if (t.id === 'balcony') n = 5;
    else if (i === tiers.length - 1) n = rowCount - cursor;
    else n = Math.round((rowCount - cursor) * 0.62);
    rowsByTier[t.id] = letters.slice(cursor, cursor + n);
    cursor += n;
  });
  tiers.forEach((t) => (t.rows = rowsByTier[t.id]));

  const r = rng(`seats|${show.id}`);
  const rows: SeatLayout['rows'] = [];
  for (const tier of tiers) {
    for (const row of tier.rows) {
      const recliner = tier.id === 'recliner' || tier.id === 'luxe';
      // aisles split the row into blocks
      const blocks = recliner ? shape.reclinerBlocks : shape.blocks;
      const seatsInRow = blocks.reduce((a, b) => a + b, 0);
      const front = row === letters[letters.length - 1] || row === letters[letters.length - 2];
      const cells: (Seat | null)[] = [];
      let num = 1;
      blocks.forEach((size, bi) => {
        if (bi > 0) cells.push(null);
        for (let k = 0; k < size; k++) {
          const id = `${row}${num}`;
          // Occupancy favours middle-back seats and is lower in the front two rows
          const centrality = 1 - Math.abs((num - seatsInRow / 2) / (seatsInRow / 2));
          let p = show.occupancy * (0.7 + centrality * 0.6) * (front ? 0.45 : 1);
          p = Math.min(0.995, p);
          const sold = r() < p || takenByUser.includes(id);
          const blocked = !sold && r() < 0.012;
          cells.push({
            id,
            row,
            number: num,
            tierId: tier.id,
            status: sold ? 'sold' : blocked ? 'blocked' : 'available',
          });
          num++;
        }
      });
      rows.push({ row, tierId: tier.id, cells });
    }
  }
  // Wheelchair spaces: two aisle seats in the last row of the lowest tier
  const lastRow = rows[rows.length - 1];
  if (cinema.amenities.includes('Wheelchair Access') && lastRow) {
    const firstSeat = lastRow.cells.find((c) => c) as Seat | undefined;
    if (firstSeat) firstSeat.wheelchair = true;
  }
  return { tiers, rows };
}

/** Auditorium shapes (approximate; chains don't publish exact plans) */
const SHAPES: Record<ScreenKind, { rows: number; blocks: number[]; reclinerBlocks: number[] }> = {
  standard: { rows: 12, blocks: [4, 12, 4], reclinerBlocks: [6, 6] },
  large: { rows: 16, blocks: [6, 18, 6], reclinerBlocks: [8, 8] },
  premium: { rows: 6, blocks: [4, 6, 4], reclinerBlocks: [4, 6, 4] },
  single: { rows: 18, blocks: [7, 16, 7], reclinerBlocks: [7, 16, 7] },
};

export const BOOKING_HOLD_MS = 8 * 60 * 1000;
