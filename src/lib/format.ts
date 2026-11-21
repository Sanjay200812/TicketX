import { CONVENIENCE_FEE_PER_TICKET, GST_RATE } from './catalog';
import { parseDateKey } from './shows';
import type { Show } from './types';

export const inr = (n: number, decimals = 0) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const runtime = (min: number) => (min > 0 ? `${Math.floor(min / 60)}h ${min % 60}m` : 'Runtime TBA');

export const compact = (n: number) =>
  n >= 100000 ? `${(n / 100000).toFixed(n >= 1000000 ? 0 : 1)}L` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

export function time12(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function dayParts(key: string) {
  const d = parseDateKey(key);
  return { dow: DAYS[d.getDay()], day: d.getDate(), month: MONTHS[d.getMonth()], year: d.getFullYear() };
}

export function longDate(key: string) {
  const p = dayParts(key);
  return `${p.dow}, ${p.day} ${p.month} ${p.year}`;
}

export function shortDate(key: string) {
  const p = dayParts(key);
  return `${p.dow}, ${p.day} ${p.month}`;
}

export function releaseLabel(iso: string) {
  if (!iso) return 'date TBA';
  const p = dayParts(iso);
  return `${p.day} ${p.month} ${p.year}`;
}

export function timeBand(t: string): 'Morning' | 'Afternoon' | 'Evening' | 'Night' {
  const h = Number(t.slice(0, 2));
  if (h < 12) return 'Morning';
  if (h < 16) return 'Afternoon';
  if (h < 20) return 'Evening';
  return 'Night';
}

export type PriceInput = {
  show: Show;
  seats: { id: string; price: number }[];
  promo?: string | null;
  firstBooking: boolean;
};

export type PriceResult = {
  ticketTotal: number;
  convenienceFee: number;
  gstOnFee: number;
  discount: number;
  total: number;
  promoError?: string;
  promoApplied?: string;
};

const isPremium = (format: string) => /imax|4dx|mx4d/i.test(format);

export function priceBooking({ show, seats, promo, firstBooking }: PriceInput): PriceResult {
  const ticketTotal = seats.reduce((a, s) => a + s.price, 0);
  const convenienceFee = seats.length * CONVENIENCE_FEE_PER_TICKET;
  const gstOnFee = Math.round(convenienceFee * GST_RATE * 100) / 100;
  let discount = 0;
  let promoError: string | undefined;
  let promoApplied: string | undefined;

  if (promo) {
    const code = promo.trim().toUpperCase();
    const dow = parseDateKey(show.date).getDay();
    const hour = Number(show.time.slice(0, 2));
    switch (code) {
      case 'FIRSTSHOW':
        if (!firstBooking) promoError = 'This code is only for your first booking.';
        else discount = Math.min(150, Math.round(ticketTotal * 0.2));
        break;
      case 'WEEKDAY100':
        if (dow < 1 || dow > 4) promoError = 'Valid only for Monday to Thursday shows.';
        else if (seats.length < 2) promoError = 'Book at least 2 tickets to use this code.';
        else discount = 100;
        break;
      case 'MORNING':
        if (hour >= 12) promoError = 'Valid only for shows starting before 12:00 PM.';
        else if (isPremium(show.format)) promoError = 'Not valid on IMAX or 4DX shows.';
        else if (seats.length < 2) promoError = 'Book at least 2 tickets to use this code.';
        else discount = 60;
        break;
      default:
        promoError = 'That code is not valid.';
    }
    if (!promoError) promoApplied = code;
  }

  const total = Math.round((ticketTotal + convenienceFee + gstOnFee - discount) * 100) / 100;
  return { ticketTotal, convenienceFee, gstOnFee, discount, total, promoError, promoApplied };
}
