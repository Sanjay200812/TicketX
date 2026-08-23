import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const cineSquareLayout: TicketXSeatLayout = {
  id: 'layout-cine-square',
  theatreId: 'cine-square',
  locationId: 'guntur',
  theatreName: 'Cine Square Dolby Atmos A/C, Gorantla',
  screenPosition: 'bottom',
  capacity: 210,
  verifiedCapacity: 210,
  sections: [
    {
      id: 'sec-recliner',
      name: 'Recliner',
      price: 250,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('A', [
          createSeatGroup('A', 1, 8, 'sec-recliner', [3]),
          createSeatGroup('A', 9, 8, 'sec-recliner', [12, 13]),
        ]),
        createRowFromGroups('B', [
          createSeatGroup('B', 1, 8, 'sec-recliner', [2, 4]),
          createSeatGroup('B', 9, 8, 'sec-recliner', [14]),
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
          createSeatGroup('C', 1, 8, 'sec-gold'),
          createSeatGroup('C', 9, 8, 'sec-gold', [11, 15]),
        ]),
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 8, 'sec-gold', [5]),
          createSeatGroup('D', 9, 8, 'sec-gold'),
        ]),
        createRowFromGroups('E', [
          createSeatGroup('E', 1, 8, 'sec-gold', [1]),
          createSeatGroup('E', 9, 8, 'sec-gold', [16]),
        ]),
      ],
    },
  ],
};
