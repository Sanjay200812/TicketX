export interface TicketXMovie {
  id: string;
  title: string;

  poster?: string;
  backdrop?: string;

  language?: string;
  genres?: string[];
  duration?: string;
  rating?: number;
  certificate?: string;
  releaseDate?: string;
  description?: string;

  cast?: (string | { name: string; role?: string })[];
  status?: string;
  format?: string[];
  cinemaCount?: number;
}

export type Movie = TicketXMovie;
