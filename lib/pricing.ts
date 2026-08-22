import { Seat } from '../types/seat';

export const BOOKING_FEE_PER_TICKET = 69;
export const TAX_RATE = 0.18;

export const calculateSubtotal = (selectedSeats: Seat[]): number => {
  return selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
};

export const calculateBookingFee = (selectedSeats: Seat[]): number => {
  return selectedSeats.length * BOOKING_FEE_PER_TICKET;
};

export const calculateTaxableAmount = (selectedSeats: Seat[]): number => {
  return calculateSubtotal(selectedSeats) + calculateBookingFee(selectedSeats);
};

export const calculateTax = (selectedSeats: Seat[]): number => {
  const taxable = calculateTaxableAmount(selectedSeats);
  return Math.round(taxable * TAX_RATE * 100) / 100;
};

export const calculateTotal = (selectedSeats: Seat[]): number => {
  const taxable = calculateTaxableAmount(selectedSeats);
  const tax = calculateTax(selectedSeats);
  return Math.round((taxable + tax) * 100) / 100;
};
