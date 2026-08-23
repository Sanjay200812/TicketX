import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const lakshmiNarasimhaLayout: TicketXSeatLayout = {
  id: 'layout-lakshmi-narasimha',
  theatreId: 'lakshmi-narasimha',
  locationId: 'nrt',
  theatreName: 'Lakshmi Narasimha Delux Theatre, Arundelpet',
  screenPosition: 'bottom',
  capacity: 200,
  verifiedCapacity: 200,
  sections: [
    {
      id: 'sec-deluxe',
      name: 'Deluxe',
      price: 100,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('A', [
          createSeatGroup('A', 1, 8, 'sec-deluxe', [2]),
          createSeatGroup('A', 9, 8, 'sec-deluxe', [12]),
        ]),
        createRowFromGroups('B', [
          createSeatGroup('B', 1, 8, 'sec-deluxe', [3]),
          createSeatGroup('B', 9, 8, 'sec-deluxe', [14]),
        ]),
      ],
    },
    {
      id: 'sec-first-class',
      name: 'First Class',
      price: 70,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('C', [
          createSeatGroup('C', 1, 8, 'sec-first-class'),
          createSeatGroup('C', 9, 8, 'sec-first-class', [11]),
        ]),
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 8, 'sec-first-class', [4]),
          createSeatGroup('D', 9, 8, 'sec-first-class'),
        ]),
      ],
    },
  ],
};
