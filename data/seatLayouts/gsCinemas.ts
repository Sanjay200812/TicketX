import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const gsCinemasLayout: TicketXSeatLayout = {
  id: 'layout-gs-cinemas',
  theatreId: 'gs-cinemas',
  locationId: 'guntur',
  theatreName: 'GS Cinemas, Near Lilatha Hospital',
  screenPosition: 'bottom',
  capacity: 220,
  verifiedCapacity: 220,
  sections: [
    {
      id: 'sec-gold',
      name: 'Gold',
      price: 140,
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
        createRowFromGroups('C', [
          createSeatGroup('C', 1, 8, 'sec-gold'),
          createSeatGroup('C', 9, 8, 'sec-gold', [11, 15]),
        ]),
      ],
    },
    {
      id: 'sec-silver',
      name: 'Silver',
      price: 100,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 8, 'sec-silver', [4]),
          createSeatGroup('D', 9, 8, 'sec-silver'),
        ]),
        createRowFromGroups('E', [
          createSeatGroup('E', 1, 8, 'sec-silver', [1]),
          createSeatGroup('E', 9, 8, 'sec-silver', [16]),
        ]),
      ],
    },
  ],
};
