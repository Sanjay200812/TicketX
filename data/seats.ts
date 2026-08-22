import { Seat } from '../types/seat';

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export const generateSeats = (showId: string = 'sh-1'): Seat[] => {
  const seats: Seat[] = [];

  // Executive Rows (A, B, C) - ₹150
  ['A', 'B', 'C'].forEach((row) => {
    for (let i = 1; i <= 10; i++) {
      const seatId = `${row}${i}`;
      const hashVal = hashString(`${showId}-${seatId}`);
      seats.push({
        id: seatId,
        row,
        number: i,
        status: (hashVal % 100) > 78 ? 'booked' : 'available',
        category: 'executive',
        price: 150,
      });
    }
  });

  // Premium Rows (D, E, F) - ₹220
  ['D', 'E', 'F'].forEach((row) => {
    for (let i = 1; i <= 12; i++) {
      const seatId = `${row}${i}`;
      const hashVal = hashString(`${showId}-${seatId}`);
      seats.push({
        id: seatId,
        row,
        number: i,
        status: (hashVal % 100) > 82 ? 'booked' : 'available',
        category: 'premium',
        price: 220,
      });
    }
  });

  // Recliner Rows (G, H) - ₹350
  ['G', 'H'].forEach((row) => {
    for (let i = 1; i <= 8; i++) {
      const seatId = `${row}${i}`;
      const hashVal = hashString(`${showId}-${seatId}`);
      seats.push({
        id: seatId,
        row,
        number: i,
        status: (hashVal % 100) > 85 ? 'booked' : 'available',
        category: 'recliner',
        price: 350,
      });
    }
  });

  return seats;
};
