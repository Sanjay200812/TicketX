import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const platenoLayout: TicketXSeatLayout = {
  id: 'layout-plateno-cinemas',
  theatreId: 'plateno-cinemas',
  locationId: 'guntur',
  theatreName: 'Plateno Cinemas Dolby Atmos 4K Barco Projection',
  screenPosition: 'bottom',
  capacity: 320,
  verifiedCapacity: 320,
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
      price: 177,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('C', [
          createSeatGroup('C', 1, 6, 'sec-elite', [2]),
          createSeatGroup('C', 7, 10, 'sec-elite', [9, 10]),
          createSeatGroup('C', 17, 6, 'sec-elite'),
        ]),
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 6, 'sec-elite'),
          createSeatGroup('D', 7, 10, 'sec-elite', [8, 11]),
          createSeatGroup('D', 17, 6, 'sec-elite', [19]),
        ]),
        createRowFromGroups('E', [
          createSeatGroup('E', 1, 6, 'sec-elite', [4]),
          createSeatGroup('E', 7, 10, 'sec-elite', [10, 12]),
          createSeatGroup('E', 17, 6, 'sec-elite'),
        ]),
        createRowFromGroups('F', [
          createSeatGroup('F', 1, 6, 'sec-elite'),
          createSeatGroup('F', 7, 11, 'sec-elite', [9, 13]),
          createSeatGroup('F', 18, 6, 'sec-elite'),
        ]),
        createRowFromGroups('G', [
          createSeatGroup('G', 1, 6, 'sec-elite', [1]),
          createSeatGroup('G', 7, 11, 'sec-elite', [11, 12]),
          createSeatGroup('G', 18, 6, 'sec-elite'),
        ]),
      ],
    },
  ],
};
