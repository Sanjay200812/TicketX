import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const eswarMahalLayout: TicketXSeatLayout = {
  id: 'layout-eswar-mahal-deluxe',
  theatreId: 'eswar-mahal-deluxe',
  locationId: 'nrt',
  theatreName: 'Eswar Mahal Deluxe, Venkat Reddy Nagar',
  screenPosition: 'bottom',
  capacity: 240,
  verifiedCapacity: 240,
  sections: [
    {
      id: 'sec-balcony',
      name: 'Balcony',
      price: 110,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('A', [
          createSeatGroup('A', 1, 8, 'sec-balcony', [2]),
          createSeatGroup('A', 9, 8, 'sec-balcony', [12]),
        ]),
        createRowFromGroups('B', [
          createSeatGroup('B', 1, 8, 'sec-balcony', [3]),
          createSeatGroup('B', 9, 8, 'sec-balcony', [14]),
        ]),
      ],
    },
    {
      id: 'sec-first-class',
      name: 'First Class',
      price: 80,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('C', [
          createSeatGroup('C', 1, 9, 'sec-first-class'),
          createSeatGroup('C', 10, 9, 'sec-first-class', [11, 15]),
        ]),
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 9, 'sec-first-class', [5]),
          createSeatGroup('D', 10, 9, 'sec-first-class'),
        ]),
        createRowFromGroups('E', [
          createSeatGroup('E', 1, 9, 'sec-first-class', [1]),
          createSeatGroup('E', 10, 9, 'sec-first-class', [16]),
        ]),
      ],
    },
  ],
};
