export interface TicketXCastMember {
  id: string;
  name: string;
  character?: string;
  image?: string;
}

export interface TicketXCrewMember {
  id: string;
  name: string;
  role:
    | 'Director'
    | 'Producer'
    | 'Writer'
    | 'Music'
    | 'Cinematography'
    | 'Editor'
    | string;
  image?: string;
}

export interface TicketXMovie {
  id: string;
  title: string;

  poster?: string;
  backdrop?: string;

  language?: string;
  languages?: string[];
  genres?: string[];
  duration?: string;
  rating?: number;
  certificate?: string;
  releaseDate?: string;
  description?: string;

  cast?: TicketXCastMember[];
  crew?: TicketXCrewMember[];

  status?: string;
  format?: string[];
  cinemaCount?: number;
}

export type Movie = TicketXMovie;
