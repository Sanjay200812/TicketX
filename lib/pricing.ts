import { Seat } from '../types/seat';

export const BOOKING_FEE_BASE = 50;
export const BOOKING_FEE_IGST = 19;
export const TOTAL_BOOKING_FEE = 69; // Fixed total per booking (Requirement 2, 3)

export const calculateSubtotal = (selectedSeats: Seat[]): number => {
  return selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
};

export const calculateBookingFee = (): number => {
  return TOTAL_BOOKING_FEE;
};

export const calculateTaxableAmount = (selectedSeats: Seat[]): number => {
  return calculateSubtotal(selectedSeats);
};

export const calculateTax = (): number => {
  return BOOKING_FEE_IGST;
};

export const calculateTotal = (selectedSeats: Seat[]): number => {
  const subtotal = calculateSubtotal(selectedSeats);
  if (selectedSeats.length === 0) return 0;
  return subtotal + TOTAL_BOOKING_FEE;
};
