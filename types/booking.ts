export interface Booking {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  movieLanguage?: string;
  theatre: string;
  screen: string;
  date: string;
  time: string;
  seats: string[];
  ticketCount: number;
  subtotal: number;
  convenienceFee: number;
  total: number;
  status: 'upcoming' | 'past' | 'removed';
  bookingDate: string;
}
