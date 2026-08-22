export type SeatStatus = 'available' | 'booked' | 'selected' | 'blocked';
export type SeatCategoryKey = 'premium' | 'gold' | 'onLand' | 'silver';

export interface TicketXSeatItem {
  number: number;
  status: SeatStatus;
  aisleAfter?: boolean;
}

export interface TicketXSeatRow {
  row: string;
  leftSeats?: TicketXSeatItem[];
  centerSeats?: TicketXSeatItem[];
  rightSeats?: TicketXSeatItem[];
  seats?: TicketXSeatItem[];
}

export interface TicketXSeatSection {
  id: string;
  categoryKey: SeatCategoryKey;
  name: string; // e.g. "Silver Class", "Gold Class", "On Land Luxury Recliner"
  price: number;
  description?: string;
  rows: TicketXSeatRow[];
}

export type SeatSection = TicketXSeatSection;

export interface TicketXSeatLayout {
  id: string;
  locationId: string;
  theatreId: string;
  theatreName: string;
  verifiedCapacity: number;
  layoutFamily: 'Group A' | 'Group B';
  screenPosition: 'bottom';
  sections: TicketXSeatSection[];
}
