import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const cinePrimeLayout: TicketXSeatLayout = {
  id: 'layout-cine-prime-cinema',
  theatreId: 'cine-prime-cinema',
  locationId: 'guntur',
  theatreName: 'Cine Prime Cinema, Srinivasarao Pet',
  screenPosition: 'bottom',
  capacity: 250,
  verifiedCapacity: 250,
  sections: [
    {
      id: 'sec-gold-class',
      name: 'Gold Class',
      price: 175,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('A', [
          createSeatGroup('A', 1, 5, 'sec-gold-class', [2]),
          createSeatGroup('A', 6, 10, 'sec-gold-class', [7, 8]),
          createSeatGroup('A', 16, 5, 'sec-gold-class'),
        ]),
        createRowFromGroups('B', [
          createSeatGroup('B', 1, 5, 'sec-gold-class'),
          createSeatGroup('B', 6, 10, 'sec-gold-class', [6, 9]),
          createSeatGroup('B', 16, 5, 'sec-gold-class', [17]),
        ]),
        createRowFromGroups('C', [
          createSeatGroup('C', 1, 5, 'sec-gold-class', [3]),
          createSeatGroup('C', 6, 10, 'sec-gold-class', [8, 10]),
          createSeatGroup('C', 16, 5, 'sec-gold-class'),
        ]),
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 5, 'sec-gold-class'),
          createSeatGroup('D', 6, 10, 'sec-gold-class'),
          createSeatGroup('D', 16, 5, 'sec-gold-class', [18]),
        ]),
        createRowFromGroups('E', [
          createSeatGroup('E', 1, 5, 'sec-gold-class', [1]),
          createSeatGroup('E', 6, 10, 'sec-gold-class', [7, 9]),
          createSeatGroup('E', 16, 5, 'sec-gold-class'),
        ]),
      ],
    },
  ],
};
