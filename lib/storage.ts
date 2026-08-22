import { Booking } from '../types/booking';

const STORAGE_KEY = 'ticketx_bookings';

export const saveBooking = (booking: Booking): void => {
  if (typeof window !== 'undefined') {
    const existing = getBookings();
    existing.push(booking);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }
};

export const getBookings = (): Booking[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  return [];
};
