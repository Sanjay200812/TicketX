import { SeatStatus } from './seat';
export type { SeatStatus };

export interface TicketXSeat {
  id: string;
  label: string;
  row: string;
  number?: number;
  status: SeatStatus;
  sectionId: string;
}

export interface TicketXSeatGroup {
  seats: TicketXSeat[];
}

export interface TicketXSeatRow {
  row: string;
  groups: TicketXSeatGroup[];
  // Backwards compatibility helpers
  leftSeats?: { number: number; status: SeatStatus }[];
  centerSeats?: { number: number; status: SeatStatus }[];
  rightSeats?: { number: number; status: SeatStatus }[];
  seats?: { number: number; status: SeatStatus }[];
}

export interface TicketXSeatSection {
  id: string;
  name: string;
  price: number | null;
  priceStatus?: 'unknown' | 'confirmed';
  description?: string;
  categoryKey?: string;
  rows: TicketXSeatRow[];
}

export type SeatSection = TicketXSeatSection;

export interface TicketXSeatLayout {
  id: string;
  theatreId: string;
  screenId?: string;
  locationId?: string;
  theatreName?: string;
  screenPosition: 'bottom';
  sections: TicketXSeatSection[];
  capacity: number;
  verifiedCapacity?: number;
  layoutFamily?: string;
}
