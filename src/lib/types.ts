export type Language = 'Telugu' | 'Tamil' | 'Hindi' | 'English' | 'Malayalam' | 'Kannada' | 'Japanese' | 'Marathi';
export type Format = '2D' | '3D' | 'IMAX 2D' | 'IMAX 3D' | '4DX' | 'Dolby Cinema' | 'PCX';
/** CBFC certificate, e.g. U, UA, UA 13+, A */
export type Certificate = string;

export interface PosterArt {
  /** Visual layout of the poster artwork */
  layout: 'sun' | 'bands' | 'ridge' | 'stack' | 'frame' | 'split' | 'rings' | 'grid';
  bg: string;
  bg2: string;
  ink: string;
  accent: string;
  font: 'anton' | 'serif' | 'grotesk' | 'condensed' | 'slab';
}

export interface CastMember {
  name: string;
  role: string;
  photo?: string;
}

export interface Review {
  author: string;
  outlet?: string;
  score: number; // out of 10
  date: string;
  body: string;
}

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  tagline: string;
  synopsis: string;
  status: 'now_showing' | 'coming_soon';
  releaseDate: string; // ISO date
  runtime: number; // minutes
  certificate: Certificate;
  genres: string[];
  languages: Language[];
  formats: Format[];
  rating?: number; // score out of 10
  /** Published critic scores, when the rating is a critics' average */
  critics?: { outlet: string; score: number; base: number }[];
  votes?: number;
  interested?: number;
  director: string;
  writers: string[];
  music: string;
  cinematography: string;
  cast: CastMember[];
  reviews: Review[];
  /** CSS artwork used when no real poster image is available */
  poster: PosterArt;
  posterUrl?: string;
  backdropUrl?: string;
  /** YouTube video key for the official trailer */
  trailerKey?: string;
  tmdbId?: number;
  popularity?: number;
}

export type Amenity =
  | 'Recliners'
  | 'Dolby Atmos'
  | '4K Laser'
  | 'Food & Beverages'
  | 'Parking'
  | 'Wheelchair Access'
  | 'M-Ticket'
  | 'Cancellation';

/** Auditorium shape, which drives the seat layout and the 3D model */
export type ScreenKind = 'standard' | 'premium' | 'large' | 'single';

export interface Screen {
  name: string;
  formats: Format[];
  kind: ScreenKind;
}

export interface Cinema {
  id: string;
  name: string;
  chain: string;
  city: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
  /** Distance from the user's chosen area; filled in on the client */
  distanceKm: number;
  amenities: Amenity[];
  screens: Screen[];
  priceTier: 1 | 2 | 3;
  cancellable: boolean;
  /** Short factual note shown on the cinema page */
  highlight?: string;
}

export interface Area {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface City {
  id: string;
  name: string;
  state: string;
}

export interface Show {
  id: string;
  movieId: string;
  cinemaId: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  screen: string;
  format: Format;
  language: Language;
  /** 0..1 share of seats sold */
  occupancy: number;
  minPrice: number;
  maxPrice: number;
}

export interface SeatTier {
  id: string;
  label: string;
  price: number;
  rows: string[];
}

export interface Seat {
  id: string; // e.g. "F12"
  row: string;
  number: number;
  tierId: string;
  status: 'available' | 'sold' | 'blocked';
  wheelchair?: boolean;
}

export interface SeatLayout {
  tiers: SeatTier[];
  /** Each row is an array of seats or null (aisle gap) */
  rows: { row: string; tierId: string; cells: (Seat | null)[] }[];
}

export interface Snack {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Combos' | 'Popcorn' | 'Beverages' | 'Snacks';
  veg: boolean;
  kcal: number;
}

export interface Offer {
  code: string;
  title: string;
  description: string;
  terms: string;
}

export interface BookingLine {
  label: string;
  amount: number;
}

export interface Booking {
  id: string;
  showId: string;
  movieId: string;
  cinemaId: string;
  date: string;
  time: string;
  screen: string;
  format: Format;
  language: Language;
  seats: { id: string; tierId: string; price: number }[];
  snacks: { id: string; qty: number; price: number }[];
  ticketTotal: number;
  snackTotal: number;
  convenienceFee: number;
  gstOnFee: number;
  discount: number;
  promo?: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  status: 'confirmed' | 'cancelled';
  refund?: number;
  contact: { name: string; phone: string; email: string };
  /** Snapshot of the film at booking time, so tickets still render after it leaves cinemas */
  movie?: Movie;
}

export interface User {
  name: string;
  phone: string;
  email: string;
}
