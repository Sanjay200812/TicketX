import { TicketXSeatLayout, TicketXSeatSection, TicketXSeat } from '@/types/seatLayouts';
import { createCustomSeat, createSpacerSeat, createCustomSeatGroup, createRowFromGroups } from './builder';

// Exact Seat Map for Eswar Mahal Deluxe, Narasaraopet (Reference Image 1 / 2)
// Structure: Screen at bottom, 2-Tier: Premium (₹200) & Non-Premium (₹200)
// Preserves entrance-side gap, exact seat positions, and open hall spaces

function buildEswarPremiumRows(): any[] {
  const sec = 'sec-premium';
  
  // Row A (Top): Left 12 booked, Right 11 booked + 2 available (25, 26)
  const rowA = createRowFromGroups('A', [
    createCustomSeatGroup(Array.from({ length: 12 }, (_, i) => createCustomSeat('A', i + 1, sec, 'booked'))),
    createCustomSeatGroup([
      ...Array.from({ length: 11 }, (_, i) => createCustomSeat('A', i + 13, sec, 'booked')),
      createCustomSeat('A', 25, sec, 'available'),
      createCustomSeat('A', 26, sec, 'available')
    ])
  ]);

  // Row B: Left (1,2 avail, 3-12 booked), Right (13-23 booked, 26 avail)
  const rowB = createRowFromGroups('B', [
    createCustomSeatGroup([
      createCustomSeat('B', 1, sec, 'available'),
      createCustomSeat('B', 2, sec, 'available'),
      ...Array.from({ length: 10 }, (_, i) => createCustomSeat('B', i + 3, sec, 'booked'))
    ]),
    createCustomSeatGroup([
      ...Array.from({ length: 11 }, (_, i) => createCustomSeat('B', i + 13, sec, 'booked')),
      createCustomSeat('B', 26, sec, 'available')
    ])
  ]);

  // Row C: Left (1,2 avail, 3-12 booked), Right (13-23 booked, 26 avail)
  const rowC = createRowFromGroups('C', [
    createCustomSeatGroup([
      createCustomSeat('C', 1, sec, 'available'),
      createCustomSeat('C', 2, sec, 'available'),
      ...Array.from({ length: 10 }, (_, i) => createCustomSeat('C', i + 3, sec, 'booked'))
    ]),
    createCustomSeatGroup([
      ...Array.from({ length: 11 }, (_, i) => createCustomSeat('C', i + 13, sec, 'booked')),
      createCustomSeat('C', 26, sec, 'available')
    ])
  ]);

  // Row D: Left 12 booked, Right 12 booked
  const rowD = createRowFromGroups('D', [
    createCustomSeatGroup(Array.from({ length: 12 }, (_, i) => createCustomSeat('D', i + 1, sec, 'booked'))),
    createCustomSeatGroup(Array.from({ length: 12 }, (_, i) => createCustomSeat('D', i + 13, sec, 'booked')))
  ]);

  // Row E: Left 10 booked + 2 spacers, Right 11 booked + 1 spacer
  const rowE = createRowFromGroups('E', [
    createCustomSeatGroup([
      ...Array.from({ length: 10 }, (_, i) => createCustomSeat('E', i + 1, sec, 'booked')),
      createSpacerSeat('E', sec),
      createSpacerSeat('E', sec)
    ]),
    createCustomSeatGroup([
      ...Array.from({ length: 11 }, (_, i) => createCustomSeat('E', i + 13, sec, 'booked')),
      createSpacerSeat('E', sec)
    ])
  ]);

  // Row F: Left 9 booked + 3 spacers, Right (2 spacers on aisle, 8 booked, 2 avail: 17,18)
  const rowF = createRowFromGroups('F', [
    createCustomSeatGroup([
      ...Array.from({ length: 9 }, (_, i) => createCustomSeat('F', i + 1, sec, 'booked')),
      createSpacerSeat('F', sec),
      createSpacerSeat('F', sec),
      createSpacerSeat('F', sec)
    ]),
    createCustomSeatGroup([
      createSpacerSeat('F', sec),
      createSpacerSeat('F', sec),
      ...Array.from({ length: 8 }, (_, i) => createCustomSeat('F', i + 9, sec, 'booked')),
      createCustomSeat('F', 17, sec, 'available'),
      createCustomSeat('F', 18, sec, 'available')
    ])
  ]);

  // Row G: Left (1 spacer, 1 avail [2], 8 booked, 2 spacers), Right (2 spacers, 8 booked, 2 avail: 17,18)
  const rowG = createRowFromGroups('G', [
    createCustomSeatGroup([
      createSpacerSeat('G', sec),
      createCustomSeat('G', 2, sec, 'available'),
      ...Array.from({ length: 8 }, (_, i) => createCustomSeat('G', i + 3, sec, 'booked')),
      createSpacerSeat('G', sec),
      createSpacerSeat('G', sec)
    ]),
    createCustomSeatGroup([
      createSpacerSeat('G', sec),
      createSpacerSeat('G', sec),
      ...Array.from({ length: 8 }, (_, i) => createCustomSeat('G', i + 9, sec, 'booked')),
      createCustomSeat('G', 17, sec, 'available'),
      createCustomSeat('G', 18, sec, 'available')
    ])
  ]);

  // Row H: Left (1,2 avail, 7 booked, 3 spacers), Right (2 spacers, 8 booked, 1 avail: 18, 1 spacer)
  const rowH = createRowFromGroups('H', [
    createCustomSeatGroup([
      createCustomSeat('H', 1, sec, 'available'),
      createCustomSeat('H', 2, sec, 'available'),
      ...Array.from({ length: 7 }, (_, i) => createCustomSeat('H', i + 3, sec, 'booked')),
      createSpacerSeat('H', sec),
      createSpacerSeat('H', sec),
      createSpacerSeat('H', sec)
    ]),
    createCustomSeatGroup([
      createSpacerSeat('H', sec),
      createSpacerSeat('H', sec),
      ...Array.from({ length: 8 }, (_, i) => createCustomSeat('H', i + 9, sec, 'booked')),
      createCustomSeat('H', 18, sec, 'available'),
      createSpacerSeat('H', sec)
    ])
  ]);

  // Row I: Left (1 spacer, 2,3 avail, 6 booked, 3 spacers), Right (2 spacers, 7 booked, 17,18 avail, 1 spacer)
  const rowI = createRowFromGroups('I', [
    createCustomSeatGroup([
      createSpacerSeat('I', sec),
      createCustomSeat('I', 2, sec, 'available'),
      createCustomSeat('I', 3, sec, 'available'),
      ...Array.from({ length: 6 }, (_, i) => createCustomSeat('I', i + 4, sec, 'booked')),
      createSpacerSeat('I', sec),
      createSpacerSeat('I', sec),
      createSpacerSeat('I', sec)
    ]),
    createCustomSeatGroup([
      createSpacerSeat('I', sec),
      createSpacerSeat('I', sec),
      ...Array.from({ length: 7 }, (_, i) => createCustomSeat('I', i + 9, sec, 'booked')),
      createCustomSeat('I', 17, sec, 'available'),
      createCustomSeat('I', 18, sec, 'available'),
      createSpacerSeat('I', sec)
    ])
  ]);

  // Row J: Left (10 booked, 2 spacers), Right (1 spacer, 6 booked, 20,21,22 avail)
  const rowJ = createRowFromGroups('J', [
    createCustomSeatGroup([
      ...Array.from({ length: 10 }, (_, i) => createCustomSeat('J', i + 1, sec, 'booked')),
      createSpacerSeat('J', sec),
      createSpacerSeat('J', sec)
    ]),
    createCustomSeatGroup([
      createSpacerSeat('J', sec),
      ...Array.from({ length: 6 }, (_, i) => createCustomSeat('J', i + 14, sec, 'booked')),
      createCustomSeat('J', 20, sec, 'available'),
      createCustomSeat('J', 21, sec, 'available'),
      createCustomSeat('J', 22, sec, 'available'),
      createSpacerSeat('J', sec),
      createSpacerSeat('J', sec)
    ])
  ]);

  // Row K: Left (1,2,3,4 avail, 7 booked, 1 spacer), Right (7 booked, 21,22,23,24 avail)
  const rowK = createRowFromGroups('K', [
    createCustomSeatGroup([
      createCustomSeat('K', 1, sec, 'available'),
      createCustomSeat('K', 2, sec, 'available'),
      createCustomSeat('K', 3, sec, 'available'),
      createCustomSeat('K', 4, sec, 'available'),
      ...Array.from({ length: 7 }, (_, i) => createCustomSeat('K', i + 5, sec, 'booked')),
      createSpacerSeat('K', sec)
    ]),
    createCustomSeatGroup([
      ...Array.from({ length: 7 }, (_, i) => createCustomSeat('K', i + 14, sec, 'booked')),
      createCustomSeat('K', 21, sec, 'available'),
      createCustomSeat('K', 22, sec, 'available'),
      createCustomSeat('K', 23, sec, 'available'),
      createCustomSeat('K', 24, sec, 'available')
    ])
  ]);

  // Row L: Left (1..6 avail, 6 booked), Right (6 booked, 20..24 avail)
  const rowL = createRowFromGroups('L', [
    createCustomSeatGroup([
      ...Array.from({ length: 6 }, (_, i) => createCustomSeat('L', i + 1, sec, 'available')),
      ...Array.from({ length: 6 }, (_, i) => createCustomSeat('L', i + 7, sec, 'booked'))
    ]),
    createCustomSeatGroup([
      createSpacerSeat('L', sec),
      ...Array.from({ length: 6 }, (_, i) => createCustomSeat('L', i + 14, sec, 'booked')),
      ...Array.from({ length: 5 }, (_, i) => createCustomSeat('L', i + 20, sec, 'available'))
    ])
  ]);

  // Row M: Left (1..5 avail, 7 booked), Right (4 booked, 18..24 avail)
  const rowM = createRowFromGroups('M', [
    createCustomSeatGroup([
      ...Array.from({ length: 5 }, (_, i) => createCustomSeat('M', i + 1, sec, 'available')),
      ...Array.from({ length: 7 }, (_, i) => createCustomSeat('M', i + 6, sec, 'booked'))
    ]),
    createCustomSeatGroup([
      createSpacerSeat('M', sec),
      ...Array.from({ length: 4 }, (_, i) => createCustomSeat('M', i + 14, sec, 'booked')),
      ...Array.from({ length: 7 }, (_, i) => createCustomSeat('M', i + 18, sec, 'available'))
    ])
  ]);

  // Row N: Left (1..7 avail, 5 booked), Right (5 booked, 19,20 avail, 4 booked)
  const rowN = createRowFromGroups('N', [
    createCustomSeatGroup([
      ...Array.from({ length: 7 }, (_, i) => createCustomSeat('N', i + 1, sec, 'available')),
      ...Array.from({ length: 5 }, (_, i) => createCustomSeat('N', i + 8, sec, 'booked'))
    ]),
    createCustomSeatGroup([
      createSpacerSeat('N', sec),
      ...Array.from({ length: 5 }, (_, i) => createCustomSeat('N', i + 14, sec, 'booked')),
      createCustomSeat('N', 19, sec, 'available'),
      createCustomSeat('N', 20, sec, 'available'),
      ...Array.from({ length: 4 }, (_, i) => createCustomSeat('N', i + 21, sec, 'booked'))
    ])
  ]);

  // Row O: Left (1..11 avail, 1 booked), Right (7 booked, 22,23,24 avail, 2 spacers)
  const rowO = createRowFromGroups('O', [
    createCustomSeatGroup([
      ...Array.from({ length: 11 }, (_, i) => createCustomSeat('O', i + 1, sec, 'available')),
      createCustomSeat('O', 12, sec, 'booked')
    ]),
    createCustomSeatGroup([
      createSpacerSeat('O', sec),
      createSpacerSeat('O', sec),
      ...Array.from({ length: 7 }, (_, i) => createCustomSeat('O', i + 15, sec, 'booked')),
      createCustomSeat('O', 22, sec, 'available'),
      createCustomSeat('O', 23, sec, 'available'),
      createCustomSeat('O', 24, sec, 'available')
    ])
  ]);

  return [rowA, rowB, rowC, rowD, rowE, rowF, rowG, rowH, rowI, rowJ, rowK, rowL, rowM, rowN, rowO];
}

function buildEswarNonPremiumRows(): any[] {
  const sec = 'sec-non-premium';

  // Row P: Left (1..13 avail), Right (1 spacer, 14..24 avail)
  const rowP = createRowFromGroups('P', [
    createCustomSeatGroup(Array.from({ length: 13 }, (_, i) => createCustomSeat('P', i + 1, sec, 'available'))),
    createCustomSeatGroup([
      createSpacerSeat('P', sec),
      ...Array.from({ length: 11 }, (_, i) => createCustomSeat('P', i + 14, sec, 'available'))
    ])
  ]);

  // Row Q: Left (1..11 avail, 2 spacers), Right (1 spacer, 12..22 avail)
  const rowQ = createRowFromGroups('Q', [
    createCustomSeatGroup([
      ...Array.from({ length: 11 }, (_, i) => createCustomSeat('Q', i + 1, sec, 'available')),
      createSpacerSeat('Q', sec),
      createSpacerSeat('Q', sec)
    ]),
    createCustomSeatGroup([
      createSpacerSeat('Q', sec),
      ...Array.from({ length: 11 }, (_, i) => createCustomSeat('Q', i + 12, sec, 'available'))
    ])
  ]);

  // Row R: Left (1..12 avail), Right (13..24 avail)
  const rowR = createRowFromGroups('R', [
    createCustomSeatGroup(Array.from({ length: 12 }, (_, i) => createCustomSeat('R', i + 1, sec, 'available'))),
    createCustomSeatGroup(Array.from({ length: 12 }, (_, i) => createCustomSeat('R', i + 13, sec, 'available')))
  ]);

  // Row S: Left (1..12 avail), Right (13..24 avail)
  const rowS = createRowFromGroups('S', [
    createCustomSeatGroup(Array.from({ length: 12 }, (_, i) => createCustomSeat('S', i + 1, sec, 'available'))),
    createCustomSeatGroup(Array.from({ length: 12 }, (_, i) => createCustomSeat('S', i + 13, sec, 'available')))
  ]);

  // Row T: Left (1..12 avail), Right (13..24 avail)
  const rowT = createRowFromGroups('T', [
    createCustomSeatGroup(Array.from({ length: 12 }, (_, i) => createCustomSeat('T', i + 1, sec, 'available'))),
    createCustomSeatGroup(Array.from({ length: 12 }, (_, i) => createCustomSeat('T', i + 13, sec, 'available')))
  ]);

  return [rowP, rowQ, rowR, rowS, rowT];
}

const premiumRows = buildEswarPremiumRows();
const nonPremiumRows = buildEswarNonPremiumRows();

const allNonSpacerSeats = [...premiumRows, ...nonPremiumRows].flatMap((r) =>
  r.groups.flatMap((g: any) => g.seats.filter((s: TicketXSeat) => s.status !== 'blocked'))
);

export const eswarMahalLayout: TicketXSeatLayout = {
  id: 'layout-eswar-mahal-deluxe',
  theatreId: 'eswar-mahal-deluxe',
  locationId: 'nrt',
  theatreName: 'Eswar Mahal Deluxe, Narasaraopet',
  screenPosition: 'bottom',
  capacity: allNonSpacerSeats.length,
  verifiedCapacity: allNonSpacerSeats.length,
  sections: [
    {
      id: 'sec-premium',
      name: 'PREMIUM',
      categoryKey: 'premium',
      price: 200,
      priceStatus: 'confirmed',
      rows: premiumRows,
    },
    {
      id: 'sec-non-premium',
      name: 'NON PREMIUM',
      categoryKey: 'non-premium',
      price: 200,
      priceStatus: 'confirmed',
      rows: nonPremiumRows,
    },
  ],
};
