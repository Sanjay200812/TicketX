import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const studio81Layout: TicketXSeatLayout = {
  id: 'layout-studio-81-cinemas',
  theatreId: 'studio-81-cinemas',
  locationId: 'guntur',
  theatreName: 'Studio 81 Cinemas, KSP Prime Mall',
  screenPosition: 'bottom',
  capacity: 420,
  verifiedCapacity: 420,
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
      id: 'sec-elite',
      name: 'Elite',
      price: 180,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('C', [
          createSeatGroup('C', 1, 5, 'sec-elite', [3]),
          createSeatGroup('C', 6, 10, 'sec-elite', [9, 11]),
          createSeatGroup('C', 16, 5, 'sec-elite'),
        ]),
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 5, 'sec-elite'),
          createSeatGroup('D', 6, 10, 'sec-elite'),
          createSeatGroup('D', 16, 5, 'sec-elite', [19]),
        ]),
        createRowFromGroups('E', [
          createSeatGroup('E', 1, 5, 'sec-elite', [1]),
          createSeatGroup('E', 6, 10, 'sec-elite', [6, 12]),
          createSeatGroup('E', 16, 5, 'sec-elite'),
        ]),
        createRowFromGroups('F', [
          createSeatGroup('F', 1, 5, 'sec-elite'),
          createSeatGroup('F', 6, 10, 'sec-elite', [8, 10]),
          createSeatGroup('F', 16, 5, 'sec-elite', [17]),
        ]),
      ],
    },
  ],
};
