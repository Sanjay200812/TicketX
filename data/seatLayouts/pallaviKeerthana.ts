import { TicketXSeatLayout } from '@/types/seatLayouts';
import { createSeatGroup, createRowFromGroups } from './builder';

export const pallaviKeerthanaLayout: TicketXSeatLayout = {
  id: 'layout-pallavi-keerthana-complex',
  theatreId: 'pallavi-keerthana-complex',
  locationId: 'guntur',
  theatreName: 'Pallavi Keerthana Complex, Sambasiva Pet',
  screenPosition: 'bottom',
  capacity: 270,
  verifiedCapacity: 270,
  sections: [
    {
      id: 'sec-recliner',
      name: 'Recliner',
      price: 200,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('A', [
          createSeatGroup('A', 1, 8, 'sec-recliner', [3, 4]),
          createSeatGroup('A', 9, 8, 'sec-recliner', [12, 13]),
        ]),
      ],
    },
    {
      id: 'sec-sofa',
      name: 'Sofa',
      price: 150,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('B', [
          createSeatGroup('B', 1, 9, 'sec-sofa', [2]),
          createSeatGroup('B', 10, 9, 'sec-sofa', [14]),
        ]),
        createRowFromGroups('C', [
          createSeatGroup('C', 1, 9, 'sec-sofa'),
          createSeatGroup('C', 10, 9, 'sec-sofa', [11, 15]),
        ]),
      ],
    },
    {
      id: 'sec-lower-balcony',
      name: 'Lower Balcony',
      price: 100,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('D', [
          createSeatGroup('D', 1, 10, 'sec-lower-balcony', [5]),
          createSeatGroup('D', 11, 10, 'sec-lower-balcony', [18]),
        ]),
        createRowFromGroups('E', [
          createSeatGroup('E', 1, 10, 'sec-lower-balcony', [1]),
          createSeatGroup('E', 11, 10, 'sec-lower-balcony', [19]),
        ]),
      ],
    },
    {
      id: 'sec-first-class',
      name: 'First Class',
      price: 100,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('F', [
          createSeatGroup('F', 1, 11, 'sec-first-class', [4]),
          createSeatGroup('F', 12, 11, 'sec-first-class', [16, 17]),
        ]),
        createRowFromGroups('G', [
          createSeatGroup('G', 1, 11, 'sec-first-class', [2, 3]),
          createSeatGroup('G', 12, 11, 'sec-first-class', [18]),
        ]),
      ],
    },
    {
      id: 'sec-second-class',
      name: 'Second Class',
      price: 100,
      priceStatus: 'confirmed',
      rows: [
        createRowFromGroups('H', [
          createSeatGroup('H', 1, 11, 'sec-second-class'),
          createSeatGroup('H', 12, 11, 'sec-second-class', [15, 19]),
        ]),
      ],
    },
  ],
};
