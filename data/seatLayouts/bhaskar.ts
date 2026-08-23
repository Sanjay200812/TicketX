import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const bhaskarLayout: TicketXSeatLayout = {
  id: 'layout-bhaskar-cinemas',
  theatreId: 'bhaskar-cinemas',
  locationId: 'guntur',
  theatreName: 'Bhaskar Cinemas',
  screenPosition: 'bottom',
  capacity: 230,
  verifiedCapacity: 230,
  sections: [
    {
      id: 'sec-platinum',
      name: 'Platinum',
      price: 295,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('A', [
          createSeatGroup('A', 1, 9, 'sec-platinum', [3, 4]),
          createSeatGroup('A', 10, 9, 'sec-platinum', [13, 14]),
        ]),
        createRowFromGroups('B', [
          createSeatGroup('B', 1, 9, 'sec-platinum', [2]),
          createSeatGroup('B', 10, 9, 'sec-platinum', [15]),
        ]),
      ],
    },
    {
      id: 'sec-gold',
      name: 'Gold',
      price: 150,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('C', [
          createSeatGroup('C', 1, 9, 'sec-gold'),
          createSeatGroup('C', 10, 9, 'sec-gold', [12, 16]),
        ]),
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 9, 'sec-gold', [5]),
          createSeatGroup('D', 10, 9, 'sec-gold'),
        ]),
      ],
    },
    {
      id: 'sec-silver',
      name: 'Silver',
      price: 100,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('E', [
          createSeatGroup('E', 1, 8, 'sec-silver', [1]),
          createSeatGroup('E', 9, 8, 'sec-silver', [14]),
        ]),
        createRowFromGroups('F', [
          createSeatGroup('F', 1, 11, 'sec-silver', [4]),
          createSeatGroup('F', 12, 11, 'sec-silver', [16, 17]),
        ]),
      ],
    },
  ],
};
