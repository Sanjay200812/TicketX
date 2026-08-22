export interface TicketXEvent {
  id: string;
  name: string;
  title: string;
  cityId: string;
  cityName: string;
  venue: string;
  date: string;
  time: string;
  eventType: string;
  poster: string;
  image?: string;
  capacity: number;
  startingPrice: number;
  priceFrom?: number;
  pricing: {
    silver: number;
    gold: number;
    premium: number;
  };
  bookingEnabled: boolean;
  description: string;
  organizer?: string;
}

export interface EventTicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
}
