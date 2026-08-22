export interface TicketXMovie {
  id: string;
  title: string;
  posterUrl?: string;
  backdropUrl?: string;
  overview?: string;
  rating?: number;
  language?: string;
  genres: string[];
  runtime?: number;
  releaseDate?: string;
  status?: 'now-playing' | 'upcoming';
  trailerUrl?: string;
  source: 'live' | 'fallback';
}

export interface TicketXTheatre {
  id: string;
  name: string;
  address?: string;
  area?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  rating?: number;
  source: 'live' | 'fallback';
}

export interface TicketXShowtime {
  id: string;
  movieId: string;
  theatreId: string;
  date: string;
  time: string;
  language?: string;
  format?: string;
  priceFrom?: number;
  source: 'live' | 'demo';
}
