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
  [eswarMahalLayout.theatreId]: eswarMahalLayout,
  [vijethaLayout.theatreId]: vijethaLayout,
  [lakshmiNarasimhaLayout.theatreId]: lakshmiNarasimhaLayout,
};

export function getSeatLayoutForTheatre(theatreId: string): TicketXSeatLayout {
  if (seatLayoutsMap[theatreId]) {
    return seatLayoutsMap[theatreId];
  }
  // Fallback default layout with theatre-specific metadata
  return {
    id: `layout-${theatreId}`,
    theatreId,
    screenPosition: 'bottom',
    capacity: 250,
    sections: [
      {
        id: 'sec-gold',
        name: 'Gold Class',
        price: 150,
        priceStatus: 'confirmed',
        rows: [
          {
            row: 'A',
            groups: [{
              seats: Array.from({ length: 12 }, (_, i) => ({
                id: `A${(i + 1).toString().padStart(2, '0')}`,
                label: `A${(i + 1).toString().padStart(2, '0')}`,
                row: 'A',
                number: i + 1,
                status: 'available',
                sectionId: 'sec-gold',
              })),
            }],
          },
        ],
      },
    ],
  };
}
