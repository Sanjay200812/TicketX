export interface TicketXShow {
  id: string;

  locationId: string;
  theatreId: string;
  movieId: string;

  date: string;
  time: string;

  screenId?: string;
  screenName?: string;
  screen?: string;

  seatLayoutId?: string;
  format?: string;
  priceStarting?: number;
  source?: string;

  priceOverrides?: {
    premium?: number;
    gold?: number;
    onLand?: number;
  };
}

export type Show = TicketXShow;
