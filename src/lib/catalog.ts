import type { Amenity, Area, Cinema, Offer, Screen, Snack } from './types';

/**
 * Real Hyderabad cinemas. Names, localities and the premium formats noted in `highlight`
 * come from public listings (2025–26). Screen counts, seat counts and coordinates are
 * approximations, since chains don't publish exact auditorium plans.
 */
export const CITY = { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana' };

export const AREAS: Area[] = [
  { id: 'gachibowli', name: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
  { id: 'hitech-city', name: 'HITEC City / Madhapur', lat: 17.4474, lng: 78.3762 },
  { id: 'kondapur', name: 'Kondapur', lat: 17.4691, lng: 78.3637 },
  { id: 'kokapet', name: 'Kokapet / Narsingi', lat: 17.3964, lng: 78.3392 },
  { id: 'kukatpally', name: 'Kukatpally', lat: 17.4849, lng: 78.4138 },
  { id: 'miyapur', name: 'Miyapur', lat: 17.4968, lng: 78.3614 },
  { id: 'ameerpet', name: 'Ameerpet', lat: 17.4375, lng: 78.4482 },
  { id: 'banjara-hills', name: 'Banjara / Jubilee Hills', lat: 17.4156, lng: 78.4347 },
  { id: 'secunderabad', name: 'Secunderabad', lat: 17.4399, lng: 78.4983 },
  { id: 'abids', name: 'Abids / Koti', lat: 17.392, lng: 78.476 },
  { id: 'uppal', name: 'Uppal', lat: 17.4058, lng: 78.5591 },
  { id: 'lb-nagar', name: 'LB Nagar / Vanasthalipuram', lat: 17.3457, lng: 78.5522 },
  { id: 'old-city', name: 'Charminar / Old City', lat: 17.3616, lng: 78.4747 },
];
export const DEFAULT_AREA = AREAS[0];

const MULTIPLEX: Amenity[] = ['Dolby Atmos', 'Food & Beverages', 'Parking', 'Wheelchair Access', 'M-Ticket', 'Cancellation'];
const PREMIUM: Amenity[] = ['Recliners', 'Dolby Atmos', '4K Laser', 'Food & Beverages', 'Parking', 'Wheelchair Access', 'M-Ticket', 'Cancellation'];
const SINGLE: Amenity[] = ['Dolby Atmos', 'Food & Beverages', 'Parking', 'M-Ticket'];

const std = (n: number, from = 1): Screen[] =>
  Array.from({ length: n }, (_, i) => ({ name: `Audi ${i + from}`, formats: ['2D', '3D'], kind: 'standard' as const }));

const RAW: Omit<Cinema, 'distanceKm' | 'city'>[] = [
  {
    id: 'amb-cinemas-gachibowli',
    name: 'AMB Cinemas: Gachibowli',
    chain: 'AMB Cinemas',
    area: 'Gachibowli',
    address: 'Sarath City Capital Mall, Kondapur, Gachibowli',
    lat: 17.4569,
    lng: 78.3637,
    amenities: PREMIUM,
    screens: [
      { name: 'Screen 1 · Big Screen', formats: ['2D', '3D', 'Dolby Cinema'], kind: 'large' },
      { name: 'Screen 2 · Recliner', formats: ['2D'], kind: 'premium' },
      ...std(5, 3),
    ],
    priceTier: 3,
    cancellable: true,
    highlight: 'Known for a 108-ft laser-projection screen and recliner seating.',
  },
  {
    id: 'prasads-multiplex-necklace-road',
    name: 'Prasads Multiplex: Necklace Road',
    chain: 'Prasads',
    area: 'Khairatabad',
    address: 'NTR Marg, Necklace Road, Khairatabad',
    lat: 17.4126,
    lng: 78.4669,
    amenities: ['Dolby Atmos', '4K Laser', 'Food & Beverages', 'Parking', 'Wheelchair Access', 'M-Ticket', 'Cancellation'],
    screens: [{ name: 'PCX · Large Format', formats: ['PCX', '2D', '3D'], kind: 'large' }, ...std(5, 2)],
    priceTier: 2,
    cancellable: true,
    highlight: "Hyderabad's first multiplex. PCX screen: 101-ft, dual 4K laser, Dolby Atmos.",
  },
  {
    id: 'allu-cinemas-kokapet',
    name: 'Allu Cinemas: Kokapet',
    chain: 'Allu Cinemas',
    area: 'Kokapet',
    address: 'Kokapet, Narsingi',
    lat: 17.399,
    lng: 78.336,
    amenities: PREMIUM,
    screens: [
      { name: 'Dolby Cinema', formats: ['Dolby Cinema', '2D'], kind: 'large' },
      { name: 'Screen 2 · Recliner', formats: ['2D', '3D'], kind: 'premium' },
      ...std(2, 3),
    ],
    priceTier: 3,
    cancellable: true,
    highlight: 'Four-screen multiplex built around a large Dolby Cinema auditorium.',
  },
  {
    id: 'pvr-inorbit-cyberabad',
    name: 'PVR: Inorbit Mall, Cyberabad',
    chain: 'PVR INOX',
    area: 'Madhapur',
    address: 'Inorbit Mall, Mindspace, Madhapur',
    lat: 17.4344,
    lng: 78.3866,
    amenities: PREMIUM,
    screens: [
      { name: 'IMAX', formats: ['IMAX 2D', 'IMAX 3D'], kind: 'large' },
      { name: 'Playhouse · Recliner', formats: ['2D'], kind: 'premium' },
      ...std(5, 3),
    ],
    priceTier: 3,
    cancellable: true,
    highlight: 'Superplex with an IMAX auditorium.',
  },
  {
    id: 'inox-gvk-one-banjara-hills',
    name: 'INOX: GVK One, Banjara Hills',
    chain: 'PVR INOX',
    area: 'Banjara Hills',
    address: 'GVK One Mall, Road No. 1, Banjara Hills',
    lat: 17.4196,
    lng: 78.4487,
    amenities: PREMIUM,
    screens: [{ name: 'INSIGNIA · Recliner', formats: ['2D', '3D'], kind: 'premium' }, ...std(5, 2)],
    priceTier: 3,
    cancellable: true,
    highlight: 'INSIGNIA luxury screens with recliners and a club lounge.',
  },
  {
    id: 'pvr-central-panjagutta',
    name: 'PVR: Central Mall, Panjagutta',
    chain: 'PVR INOX',
    area: 'Panjagutta',
    address: 'Hyderabad Central Mall, Panjagutta',
    lat: 17.4255,
    lng: 78.4513,
    amenities: PREMIUM,
    screens: [{ name: 'Audi 1 · Recliner', formats: ['2D'], kind: 'premium' }, ...std(4, 2)],
    priceTier: 2,
    cancellable: true,
    highlight: 'Recliner seating and Dolby Atmos.',
  },
  {
    id: 'aaa-cinemas-ameerpet',
    name: 'AAA Cinemas: Ameerpet',
    chain: 'AAA Cinemas',
    area: 'Ameerpet',
    address: 'Ameerpet Main Road, Ameerpet',
    lat: 17.4375,
    lng: 78.4482,
    amenities: MULTIPLEX,
    screens: [{ name: 'Screen 1 · Large', formats: ['2D', '3D'], kind: 'large' }, ...std(4, 2)],
    priceTier: 2,
    cancellable: true,
    highlight: 'Multiplex with push-back seating.',
  },
  {
    id: 'pvr-next-galleria-musarambagh',
    name: 'PVR: Next Galleria, Musarambagh',
    chain: 'PVR INOX',
    area: 'Musarambagh',
    address: 'Next Galleria Mall, Musarambagh, Malakpet',
    lat: 17.373,
    lng: 78.511,
    amenities: MULTIPLEX,
    screens: std(5),
    priceTier: 2,
    cancellable: true,
  },
  {
    id: 'inox-maheshwari-parameshwari-kachiguda',
    name: 'INOX: Maheshwari Parameshwari, Kachiguda',
    chain: 'PVR INOX',
    area: 'Kachiguda',
    address: 'Maheshwari Parameshwari Mall, Kachiguda',
    lat: 17.385,
    lng: 78.497,
    amenities: MULTIPLEX,
    screens: std(4),
    priceTier: 2,
    cancellable: true,
  },
  {
    id: 'cinepolis-sudha-mall-old-city',
    name: 'Cinépolis: Sudha Mall, Old City',
    chain: 'Cinépolis',
    area: 'Lal Darwaza',
    address: 'Sudha Mall, Hari Bowli, Lal Darwaza',
    lat: 17.356,
    lng: 78.478,
    amenities: MULTIPLEX,
    screens: std(4),
    priceTier: 1,
    cancellable: true,
  },
  {
    id: 'art-cinemas-vanasthalipuram',
    name: 'ART Cinemas: Vanasthalipuram',
    chain: 'ART Cinemas',
    area: 'Vanasthalipuram',
    address: 'Vanasthalipuram, LB Nagar',
    lat: 17.327,
    lng: 78.553,
    amenities: MULTIPLEX,
    screens: [{ name: 'Screen 1 · Large', formats: ['2D', '3D'], kind: 'large' }, ...std(3, 2)],
    priceTier: 2,
    cancellable: true,
    highlight: 'Dolby Atmos multiplex in east Hyderabad.',
  },
  {
    id: 'asian-cinesquare-uppal',
    name: 'Asian CineSquare: Uppal',
    chain: 'Asian Cinemas',
    area: 'Uppal',
    address: 'Uppal Main Road, Uppal',
    lat: 17.4,
    lng: 78.559,
    amenities: MULTIPLEX,
    screens: std(4),
    priceTier: 1,
    cancellable: true,
    highlight: 'Known for affordable tickets.',
  },
  {
    id: 'mythri-vimal-70mm-balanagar',
    name: 'Mythri Vimal 70MM: Balanagar',
    chain: 'Mythri Vimal',
    area: 'Balanagar',
    address: 'Balanagar Main Road, Balanagar',
    lat: 17.472,
    lng: 78.448,
    amenities: SINGLE,
    screens: [{ name: '70MM', formats: ['2D'], kind: 'single' }],
    priceTier: 1,
    cancellable: false,
    highlight: 'Single screen with a huge screen and Dolby Atmos.',
  },
  {
    id: 'devi-70mm-rtc-x-roads',
    name: 'Devi 70MM: RTC X Roads',
    chain: 'Devi',
    area: 'RTC X Roads',
    address: 'RTC X Roads, Chikkadpally',
    lat: 17.404,
    lng: 78.497,
    amenities: SINGLE,
    screens: [{ name: '70MM', formats: ['2D'], kind: 'single' }],
    priceTier: 1,
    cancellable: false,
    highlight: 'Landmark single screen at RTC X Roads.',
  },
  {
    id: 'sudarshan-35mm-rtc-x-roads',
    name: 'Sudarshan 35MM: RTC X Roads',
    chain: 'Sudarshan',
    area: 'RTC X Roads',
    address: 'RTC X Roads, Chikkadpally',
    lat: 17.4052,
    lng: 78.4982,
    amenities: SINGLE,
    screens: [{ name: '35MM', formats: ['2D'], kind: 'single' }],
    priceTier: 1,
    cancellable: false,
    highlight: 'Classic single screen at RTC X Roads.',
  },
];

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  // straight-line distance × 1.3 approximates road distance in the city
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 1.3 * 10) / 10;
}

export function cinemasNear(ref: { lat: number; lng: number }): Cinema[] {
  return RAW.map((c) => ({ ...c, city: CITY.id, distanceKm: distanceKm(ref, c) })).sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Cinemas with distances from the default area; on the client use `useCinemas()` for the user's area. */
export const CINEMAS: Cinema[] = cinemasNear(DEFAULT_AREA);
export const getCinema = (id: string) => CINEMAS.find((c) => c.id === id);

export const SNACKS: Snack[] = [
  { id: 'combo-duo', name: 'Duo Combo', description: 'Large salted popcorn + 2 cola (500 ml)', price: 540, category: 'Combos', veg: true, kcal: 1240 },
  { id: 'combo-family', name: 'Family Combo', description: '2 large popcorn (salted + caramel), 4 cola (500 ml), nachos', price: 1090, category: 'Combos', veg: true, kcal: 2860 },
  { id: 'combo-solo', name: 'Solo Combo', description: 'Regular salted popcorn + cola (360 ml)', price: 320, category: 'Combos', veg: true, kcal: 640 },
  { id: 'pop-salted-l', name: 'Salted Popcorn · Large', description: '150 g, freshly popped', price: 340, category: 'Popcorn', veg: true, kcal: 720 },
  { id: 'pop-caramel-l', name: 'Caramel Popcorn · Large', description: '150 g, butter caramel', price: 390, category: 'Popcorn', veg: true, kcal: 860 },
  { id: 'pop-cheese-r', name: 'Cheese Popcorn · Regular', description: '90 g, cheddar seasoning', price: 290, category: 'Popcorn', veg: true, kcal: 520 },
  { id: 'nachos', name: 'Nachos with Salsa & Cheese', description: 'Corn tortilla chips, jalapeños', price: 280, category: 'Snacks', veg: true, kcal: 610 },
  { id: 'samosa', name: 'Punjabi Samosa (2 pcs)', description: 'With mint and tamarind chutney', price: 140, category: 'Snacks', veg: true, kcal: 380 },
  { id: 'chicken-burger', name: 'Crispy Chicken Burger', description: 'Fried chicken patty, slaw, chipotle mayo', price: 260, category: 'Snacks', veg: false, kcal: 590 },
  { id: 'cola-500', name: 'Cola · 500 ml', description: 'Fountain, with ice', price: 190, category: 'Beverages', veg: true, kcal: 210 },
  { id: 'cold-coffee', name: 'Cold Coffee', description: '350 ml, with vanilla ice cream', price: 220, category: 'Beverages', veg: true, kcal: 340 },
  { id: 'water', name: 'Packaged Water · 500 ml', description: 'Sealed bottle', price: 40, category: 'Beverages', veg: true, kcal: 0 },
];
export const getSnack = (id: string) => SNACKS.find((s) => s.id === id);

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
    code: 'SNACK50',
    title: '₹50 off food & beverages',
    description: 'Add snacks worth ₹250 or more to your booking.',
    terms: 'Applies to F&B value only.',
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
