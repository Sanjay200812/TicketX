import { calculateTotalBookingFee } from '@/lib/pricing';

export function calculateBookingTotal(params: {
  theatreId: string;
  showId: string;
  seatIds: string[];
  seatPrices?: { code: string; price: number }[];
}): {
  seatSubtotal: number;
  bookingFee: number;
  total: number;
} {
  const { seatIds, seatPrices } = params;
  let seatSubtotal = 0;

  if (seatPrices && Array.isArray(seatPrices) && seatPrices.length > 0) {
    seatSubtotal = seatPrices.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  } else {
    // Default price per seat estimate if specific seatPrices array is not passed
    seatSubtotal = seatIds.length * 150;
  }

  const bookingFee = calculateTotalBookingFee(seatIds.length);
  const total = Math.round((seatSubtotal + bookingFee) * 100) / 100;

  return {
    seatSubtotal,
    bookingFee,
    total,
  };
}
