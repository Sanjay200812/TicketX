import { TicketXSeatLayout } from '@/types/seatLayouts';
import { platenoLayout } from './plateno';
import { pallaviKeerthanaLayout } from './pallaviKeerthana';
import { saraswathiLayout } from './saraswathi';
import { mythriLayout } from './mythri';
import { cinePrimeLayout } from './cinePrime';
import { bhaskarLayout } from './bhaskar';
import { cineSquareLayout } from './cineSquare';
import { studio81Layout } from './studio81';
import { jleLayout } from './jle';
import { gsCinemasLayout } from './gsCinemas';
import { geethaMultiplexLayout } from './geethaMultiplex';
import { eswarMahalLayout } from './eswarMahal';
import { vijethaLayout } from './vijetha';
import { lakshmiNarasimhaLayout } from './lakshmiNarasimha';
import { saradambhaLayout, sharadambaLayout } from './saradambha';
import { createSeatGroup, createRowFromGroups } from './builder';

export const seatLayoutsList: TicketXSeatLayout[] = [
  platenoLayout,
  pallaviKeerthanaLayout,
  saraswathiLayout,
  mythriLayout,
  cinePrimeLayout,
  bhaskarLayout,
  cineSquareLayout,
  studio81Layout,
  jleLayout,
  gsCinemasLayout,
  geethaMultiplexLayout,
  eswarMahalLayout,
  vijethaLayout,
  lakshmiNarasimhaLayout,
  saradambhaLayout,
];

export const seatLayoutsMap: Record<string, TicketXSeatLayout> = {
  [platenoLayout.theatreId]: platenoLayout,
  [pallaviKeerthanaLayout.theatreId]: pallaviKeerthanaLayout,
  [saraswathiLayout.theatreId]: saraswathiLayout,
  [mythriLayout.theatreId]: mythriLayout,
  [cinePrimeLayout.theatreId]: cinePrimeLayout,
  [bhaskarLayout.theatreId]: bhaskarLayout,
  [cineSquareLayout.theatreId]: cineSquareLayout,
  [studio81Layout.theatreId]: studio81Layout,
  [jleLayout.theatreId]: jleLayout,
  [gsCinemasLayout.theatreId]: gsCinemasLayout,
  [geethaMultiplexLayout.theatreId]: geethaMultiplexLayout,
  'geetha-multiplex-nrt': geethaMultiplexLayout,
  [eswarMahalLayout.theatreId]: eswarMahalLayout,
  'eswar-mahal-nrt': eswarMahalLayout,
  [vijethaLayout.theatreId]: vijethaLayout,
  'vijetha-deluxe-nrt': vijethaLayout,
  [lakshmiNarasimhaLayout.theatreId]: lakshmiNarasimhaLayout,
  [saradambhaLayout.theatreId]: saradambhaLayout,
  'saradamba-theatre': saradambhaLayout,
  'saradamba-nrt': saradambhaLayout,
  [sharadambaLayout.theatreId]: sharadambaLayout,
  'sharadamba-nrt': sharadambaLayout,
};

export function getSeatLayoutForTheatre(theatreId: string): TicketXSeatLayout {
  if (seatLayoutsMap[theatreId]) {
    return seatLayoutsMap[theatreId];
  }

  // Uniform 160-seat compliant 2-class layout (Gold ₹295, Silver ₹150)
  return {
    id: `layout-${theatreId}`,
    theatreId,
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
}
