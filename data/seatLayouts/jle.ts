import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const jleLayout: TicketXSeatLayout = {
  id: 'layout-jle-cinemas',
  theatreId: 'jle-cinemas',
  locationId: 'guntur',
  theatreName: 'JLE Cinemas',
  screenPosition: 'bottom',
  capacity: 370,
  verifiedCapacity: 370,
  sections: [
    {
      id: 'sec-recliner',
      name: 'Recliner',
      price: 295,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('A', [
          createSeatGroup('A', 1, 5, 'sec-recliner', [2]),
          createSeatGroup('A', 6, 10, 'sec-recliner', [8, 9]),
          createSeatGroup('A', 16, 5, 'sec-recliner'),
        ]),
        createRowFromGroups('B', [
          createSeatGroup('B', 1, 5, 'sec-recliner'),
          createSeatGroup('B', 6, 10, 'sec-recliner', [7, 10]),
          createSeatGroup('B', 16, 5, 'sec-recliner', [18]),
        ]),
      ],
    },
    {
      id: 'sec-gold',
      name: 'Gold',
      price: 160,
      priceStatus: 'confirmed',
      rows: [
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
        createRowFromGroups('E', [
          createSeatGroup('E', 1, 5, 'sec-gold', [1]),
          createSeatGroup('E', 6, 10, 'sec-gold', [6, 12]),
          createSeatGroup('E', 16, 5, 'sec-gold'),
        ]),
        createRowFromGroups('F', [
          createSeatGroup('F', 1, 5, 'sec-gold'),
          createSeatGroup('F', 6, 10, 'sec-gold', [8, 10]),
          createSeatGroup('F', 16, 5, 'sec-gold', [17]),
        ]),
      ],
    },
  ],
};
