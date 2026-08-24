import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

// 2-Class Seating: Gold ₹295, Silver ₹150 (Total: 160 seats)
// New shows start 100% available with no fake preoccupied seats
export const jleLayout: TicketXSeatLayout = {
  id: 'layout-jle-cinemas',
  theatreId: 'jle-cinemas',
  locationId: 'guntur',
  theatreName: 'JLE Cinemas',
  screenPosition: 'bottom',
  capacity: 160,
  verifiedCapacity: 160,
  sections: [
    {
      id: 'sec-gold',
      name: 'Gold',
      categoryKey: 'gold',
      price: 295,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('A', [
          createSeatGroup('A', 1, 5, 'sec-gold'),
          createSeatGroup('A', 6, 10, 'sec-gold'),
          createSeatGroup('A', 16, 5, 'sec-gold'),
        ]),
        createRowFromGroups('B', [
          createSeatGroup('B', 1, 5, 'sec-gold'),
          createSeatGroup('B', 6, 10, 'sec-gold'),
          createSeatGroup('B', 16, 5, 'sec-gold'),
        ]),
        createRowFromGroups('C', [
          createSeatGroup('C', 1, 5, 'sec-gold'),
          createSeatGroup('C', 6, 10, 'sec-gold'),
          createSeatGroup('C', 16, 5, 'sec-gold'),
        ]),
      ],
    },
    {
      id: 'sec-silver',
      name: 'Silver',
      categoryKey: 'silver',
      price: 150,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 5, 'sec-silver'),
          createSeatGroup('D', 6, 10, 'sec-silver'),
          createSeatGroup('D', 16, 5, 'sec-silver'),
        ]),
        createRowFromGroups('E', [
          createSeatGroup('E', 1, 5, 'sec-silver'),
          createSeatGroup('E', 6, 10, 'sec-silver'),
          createSeatGroup('E', 16, 5, 'sec-silver'),
        ]),
        createRowFromGroups('F', [
          createSeatGroup('F', 1, 5, 'sec-silver'),
          createSeatGroup('F', 6, 10, 'sec-silver'),
          createSeatGroup('F', 16, 5, 'sec-silver'),
        ]),
        createRowFromGroups('G', [
          createSeatGroup('G', 1, 5, 'sec-silver'),
          createSeatGroup('G', 6, 10, 'sec-silver'),
          createSeatGroup('G', 16, 5, 'sec-silver'),
        ]),
        createRowFromGroups('H', [
          createSeatGroup('H', 1, 5, 'sec-silver'),
          createSeatGroup('H', 6, 10, 'sec-silver'),
          createSeatGroup('H', 16, 5, 'sec-silver'),
        ]),
      ],
    },
  ],
};
