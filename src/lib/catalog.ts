import type { Area, Cinema, Offer, Screen } from './types';

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  // straight-line distance × 1.3 approximates road distance in the city
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 1.3 * 10) / 10;
}

export function sortByDistance(cinemas: Cinema[], ref: Area | { lat: number; lng: number }): Cinema[] {
  return cinemas.map((c) => ({ ...c, distanceKm: distanceKm(ref, c) })).sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Facilities as District names them, keyed by District's amenity id */
export const AMENITY_NAMES: Record<number, string> = {
  1: 'M-Ticket',
  2: 'Parking',
  3: 'Food & Beverages',
  4: 'Wheelchair Access',
  5: 'Recliners',
  6: 'Digital Payments',
  7: 'RGB Laser',
  8: 'Dolby Atmos',
  10: '4K',
  18: 'Dolby 7.1',
  19: 'Air Conditioning',
  20: 'Metro Nearby',
  21: 'Sofa Seating',
  24: 'Silver Screen',
};

const CHAINS: [RegExp, string][] = [
  [/^PVR\b/i, 'PVR'],
  [/^INOX\b/i, 'INOX'],
  [/^Cin[eé]polis/i, 'Cinépolis'],
  [/^Miraj/i, 'Miraj Cinemas'],
  [/^Asian\b/i, 'Asian Cinemas'],
  [/^Mythri/i, 'Mythri Cinemas'],
  [/^Allu\b/i, 'Allu Cinemas'],
  [/^AAA\b/i, 'AAA Cinemas'],
  [/^Prasads?/i, 'Prasads'],
  [/^Movietime|^MovieTime/i, 'MovieTime'],
  [/^Carnival/i, 'Carnival Cinemas'],
  [/^Rajhans/i, 'Rajhans Cinemas'],
  [/^Wave/i, 'Wave Cinemas'],
  [/^Gold Digital/i, 'Gold Digital'],
  [/^Sathyam|^SPI/i, 'SPI Cinemas'],
  [/^AGS\b/i, 'AGS Cinemas'],
  [/^Cinemax/i, 'Cinemax'],
];

export type RawCinema = {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  amenities: number[];
  cancellable: boolean;
  logo: string;
};

/** Turns District's cinema record into a display-ready Cinema */
export function toCinema(c: RawCinema, cityId: string, cityName: string, screens: Screen[]): Cinema {
  // "PVR Irrum Manzil, Khairatabad, Hyderabad" → name "PVR Irrum Manzil, Khairatabad"
  const parts = c.name.split(',').map((p) => p.trim()).filter(Boolean);
  const cityWords = [cityName.toLowerCase(), cityId.replace('-', ' '), 'hyderabad', 'secunderabad', 'bengaluru', 'bangalore', 'mumbai', 'chennai', 'kolkata', 'pune', 'delhi', 'kochi'];
  while (parts.length > 1 && cityWords.includes(parts[parts.length - 1].toLowerCase())) parts.pop();
  const name = parts.join(', ');
  const chain = CHAINS.find(([re]) => re.test(c.name))?.[1] ?? parts[0].split(/\s+/).slice(0, 2).join(' ');
  const area = parts.length > 1 ? parts[parts.length - 1].replace(/\(.*?\)/g, '').trim() : addressArea(c.address);
  return {
    id: String(c.id),
    name,
    chain,
    city: cityId,
    area,
    address: c.address,
    lat: c.lat,
    lng: c.lng,
    distanceKm: 0,
    amenities: c.amenities.map((id) => AMENITY_NAMES[id]).filter(Boolean),
    screens,
    cancellable: c.cancellable,
    logo: c.logo || undefined,
  };
}

function addressArea(address: string) {
  const parts = address.split(',').map((p) => p.trim()).filter((p) => p && !/\d{6}|India|Telangana|Karnataka|Maharashtra|Tamil Nadu|Kerala|Andhra Pradesh|West Bengal|Delhi/i.test(p));
  return parts[parts.length - 1] ?? '';
}

export const OFFERS: Offer[] = [
  {
    code: 'FIRSTSHOW',
    title: '20% off your first booking',
    description: 'Up to ₹150 off on tickets for new TicketX users.',
    terms: 'Valid on ticket value only. One use per account.',
  },
  {
    code: 'WEEKDAY100',
    title: '₹100 off Mon–Thu shows',
    description: 'Book 2 or more tickets for any weekday show.',
    terms: 'Show date must be Monday to Thursday. Minimum 2 tickets.',
  },
  {
    code: 'MORNING',
    title: 'Flat ₹60 off morning shows',
    description: 'For any show starting before 12:00 noon.',
    terms: 'Minimum 2 tickets. Not valid on IMAX or 4DX.',
  },
];

export const CONVENIENCE_FEE_PER_TICKET = 28;
export const GST_RATE = 0.18;
/** Most tickets a single booking can hold */
export const MAX_SEATS = 10;
