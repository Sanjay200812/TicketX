export interface Booking {
  id: string;
  userId?: string;
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  movieLanguage?: string;
  locationId?: string;
  theatreId?: string;
  theatre: string;
  screen: string;
  date: string;
  time: string;
  seats: string[];
  seatDetails?: { seatId: string; label: string; category?: string; price?: number }[];
  ticketCount: number;
  subtotal: number;
  convenienceFee: number;
  total: number;
  archived?: boolean;
  status: 'upcoming' | 'past' | 'archived' | 'removed';
  bookingDate: string;
  createdAt?: string;
}
