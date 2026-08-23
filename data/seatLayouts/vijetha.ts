import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const vijethaLayout: TicketXSeatLayout = {
  id: 'layout-vijetha-deluxe',
  theatreId: 'vijetha-deluxe',
  locationId: 'nrt',
  theatreName: 'Vijetha Deluxe',
  screenPosition: 'bottom',
  capacity: 210,
  verifiedCapacity: 210,
  sections: [
    {
      id: 'sec-gold',
      name: 'Gold',
      price: 120,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('A', [
          createSeatGroup('A', 1, 8, 'sec-gold', [2]),
          createSeatGroup('A', 9, 8, 'sec-gold', [12, 13]),
        ]),
        createRowFromGroups('B', [
          createSeatGroup('B', 1, 8, 'sec-gold', [3]),
          createSeatGroup('B', 9, 8, 'sec-gold', [14]),
        ]),
      ],
    },
    {
      id: 'sec-silver',
      name: 'Silver',
      price: 80,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('C', [
          createSeatGroup('C', 1, 8, 'sec-silver'),
          createSeatGroup('C', 9, 8, 'sec-silver', [11, 15]),
        ]),
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 8, 'sec-silver', [5]),
          createSeatGroup('D', 9, 8, 'sec-silver'),
        ]),
      ],
    },
  ],
};
