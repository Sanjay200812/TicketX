import { Seat } from '../types/seat';

// Requirements 14, 15, 16, 60: District-style per-ticket booking charge engine
export const BOOKING_CHARGE_PER_TICKET = 20;
export const BOOKING_CHARGE_IGST_RATE = 0.18; // 18% IGST on booking charge

export const calculateSubtotal = (selectedSeats: Seat[]): number => {
  return selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
};

export const calculateBaseBookingCharge = (ticketCount: number): number => {
  return ticketCount * BOOKING_CHARGE_PER_TICKET;
};

export const calculateBookingIGST = (ticketCount: number): number => {
  const base = calculateBaseBookingCharge(ticketCount);
  return Math.round(base * BOOKING_CHARGE_IGST_RATE * 100) / 100;
};

export const calculateTotalBookingFee = (ticketCount: number): number => {
  const base = calculateBaseBookingCharge(ticketCount);
  const igst = calculateBookingIGST(ticketCount);
  return Math.round((base + igst) * 100) / 100;
};

export const calculateTaxableAmount = (selectedSeats: Seat[]): number => {
  return calculateSubtotal(selectedSeats);
};

export const calculateTax = (ticketCount: number): number => {
  return calculateBookingIGST(ticketCount);
};

export const calculateTotal = (selectedSeats: Seat[]): number => {
  const subtotal = calculateSubtotal(selectedSeats);
  if (selectedSeats.length === 0) return 0;
  const bookingCharges = calculateTotalBookingFee(selectedSeats.length);
  return Math.round((subtotal + bookingCharges) * 100) / 100;
};
