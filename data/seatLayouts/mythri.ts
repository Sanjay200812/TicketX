import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const mythriLayout: TicketXSeatLayout = {
  id: 'layout-mythri-cinemas',
  theatreId: 'mythri-cinemas',
  locationId: 'guntur',
  theatreName: 'Mythri Cinemas, Mythri Mall',
  screenPosition: 'bottom',
  capacity: 380,
  verifiedCapacity: 380,
  sections: [
    {
      id: 'sec-gold',
      name: 'Gold',
      price: 150,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('A', [
          createSeatGroup('A', 1, 5, 'sec-gold', [2]),
          createSeatGroup('A', 6, 10, 'sec-gold', [8, 9]),
          createSeatGroup('A', 16, 5, 'sec-gold'),
        ]),
        createRowFromGroups('B', [
          createSeatGroup('B', 1, 5, 'sec-gold'),
          createSeatGroup('B', 6, 10, 'sec-gold', [7, 10]),
          createSeatGroup('B', 16, 5, 'sec-gold', [18]),
        ]),
        createRowFromGroups('C', [
          createSeatGroup('C', 1, 5, 'sec-gold', [3]),
          createSeatGroup('C', 6, 10, 'sec-gold', [9, 11]),
          createSeatGroup('C', 16, 5, 'sec-gold'),
        ]),
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 5, 'sec-gold'),
          createSeatGroup('D', 6, 10, 'sec-gold'),
          createSeatGroup('D', 16, 5, 'sec-gold', [19]),
        ]),
      ],
    },
    {
      id: 'sec-silver',
      name: 'Silver',
      price: 150,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('E', [
          createSeatGroup('E', 1, 6, 'sec-silver', [2]),
          createSeatGroup('E', 7, 12, 'sec-silver', [10, 11]),
          createSeatGroup('E', 19, 6, 'sec-silver'),
        ]),
        createRowFromGroups('F', [
          createSeatGroup('F', 1, 6, 'sec-silver'),
          createSeatGroup('F', 7, 12, 'sec-silver', [9, 13]),
          createSeatGroup('F', 19, 6, 'sec-silver', [22]),
        ]),
        createRowFromGroups('G', [
          createSeatGroup('G', 1, 6, 'sec-silver', [3]),
          createSeatGroup('G', 7, 12, 'sec-silver', [11, 14]),
          createSeatGroup('G', 19, 6, 'sec-silver'),
        ]),
        createRowFromGroups('H', [
          createSeatGroup('H', 1, 6, 'sec-silver'),
          createSeatGroup('H', 7, 12, 'sec-silver'),
          createSeatGroup('H', 19, 6, 'sec-silver', [23]),
        ]),
      ],
    },
  ],
};
