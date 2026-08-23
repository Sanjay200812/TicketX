import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const geethaMultiplexLayout: TicketXSeatLayout = {
  id: 'layout-geetha-multiplex',
  theatreId: 'geetha-multiplex',
  locationId: 'nrt',
  theatreName: 'Geetha Multiplex, Kasu Central Mall',
  screenPosition: 'bottom',
  capacity: 280,
  verifiedCapacity: 280,
  sections: [
    {
      id: 'sec-recliner',
      name: 'Recliner',
      price: 295,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('A', [
          createSeatGroup('A', 1, 6, 'sec-recliner', [2]),
          createSeatGroup('A', 7, 6, 'sec-recliner', [9, 10]),
        ]),
      ],
    },
    {
      id: 'sec-elite',
      name: 'Elite',
      price: 177,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('B', [
          createSeatGroup('B', 1, 8, 'sec-elite', [3]),
          createSeatGroup('B', 9, 8, 'sec-elite', [12]),
        ]),
        createRowFromGroups('C', [
          createSeatGroup('C', 1, 8, 'sec-elite'),
          createSeatGroup('C', 9, 8, 'sec-elite', [11, 14]),
        ]),
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 8, 'sec-elite', [4]),
          createSeatGroup('D', 9, 8, 'sec-elite'),
        ]),
        createRowFromGroups('E', [
          createSeatGroup('E', 1, 8, 'sec-elite', [1]),
          createSeatGroup('E', 9, 8, 'sec-elite', [15]),
        ]),
      ],
    },
  ],
};
