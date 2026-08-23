export type SeatStatus = 'available' | 'selected' | 'booked' | 'blocked' | 'disabled';
export type SeatCategory = 'executive' | 'premium' | 'recliner' | string;

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
  category: SeatCategory;
  price: number;
}
