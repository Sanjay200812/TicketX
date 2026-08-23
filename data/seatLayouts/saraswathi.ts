import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const saraswathiLayout: TicketXSeatLayout = {
  id: 'layout-sri-saraswathi-picture-palace',
  theatreId: 'sri-saraswathi-picture-palace',
  locationId: 'guntur',
  theatreName: 'Sri Saraswathi Picture Palace',
  screenPosition: 'bottom',
  capacity: 220,
  verifiedCapacity: 220,
  sections: [
    {
      id: 'sec-gold',
      name: 'Gold',
      price: 105,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('A', [
          createSeatGroup('A', 1, 9, 'sec-gold', [3, 4]),
          createSeatGroup('A', 10, 9, 'sec-gold', [12, 13]),
        ]),
        createRowFromGroups('B', [
          createSeatGroup('B', 1, 9, 'sec-gold', [2]),
          createSeatGroup('B', 10, 9, 'sec-gold', [14]),
        ]),
        createRowFromGroups('C', [
          createSeatGroup('C', 1, 9, 'sec-gold'),
          createSeatGroup('C', 10, 9, 'sec-gold', [11, 15]),
        ]),
      ],
    },
    {
      id: 'sec-elite',
      name: 'Elite',
      price: 105,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 10, 'sec-elite', [4]),
          createSeatGroup('D', 11, 10, 'sec-elite', [13, 14]),
        ]),
        createRowFromGroups('E', [
          createSeatGroup('E', 1, 10, 'sec-elite', [2, 3]),
          createSeatGroup('E', 11, 10, 'sec-elite', [15]),
        ]),
        createRowFromGroups('F', [
          createSeatGroup('F', 1, 10, 'sec-elite'),
          createSeatGroup('F', 11, 10, 'sec-elite', [12, 16]),
        ]),
      ],
    },
  ],
};
