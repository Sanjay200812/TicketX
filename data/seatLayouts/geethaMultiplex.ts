import { TicketXSeatLayout, TicketXSeatSection, TicketXSeat } from '@/types/seatLayouts';
import { createCustomSeat, createSpacerSeat, createCustomSeatGroup, createRowFromGroups } from './builder';

// Exact Seat Map for Geetha Multiplex, Kasu Central Mall, Narasaraopet (Reference Image 2 / 3)
// Structure: Screen at bottom, 3-Tier: Recliner (₹290), Premium (₹200), Non-Premium (₹200)
// Preserves entrance-side gap (4-seat cut-out in rows G-K right block), exact seat counts and 3-column layout

function buildGeethaReclinerRows(): any[] {
  const sec = 'sec-recliner';
  // Row A: Centered 17 seats
  const rowA = createRowFromGroups('A', [
    createCustomSeatGroup([
      createSpacerSeat('A', sec),
      createSpacerSeat('A', sec),
    ]),
    createCustomSeatGroup(
      Array.from({ length: 17 }, (_, i) => createCustomSeat('A', i + 1, sec, 'booked'))
    ),
    createCustomSeatGroup([
      createSpacerSeat('A', sec),
      createSpacerSeat('A', sec),
    ])
  ]);
  return [rowA];
}

function buildGeethaPremiumRows(): any[] {
  const sec = 'sec-premium';

  // Rows B to F (Rows 1-5): Left 6 booked, Center 8 booked, Right 6 booked
  const upperRows = ['B', 'C', 'D', 'E', 'F'].map((r) =>
    createRowFromGroups(r, [
      createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat(r, i + 1, sec, 'booked'))),
      createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat(r, i + 7, sec, 'booked'))),
      createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat(r, i + 15, sec, 'booked')))
    ])
  );

  // Rows G to K (Rows 6-10): THE ENTRANCE CUTOUT!
  // Left 6 booked, Center 8 booked, Right: 2 booked + 4 SPACER SEATS (open hall entrance)
  const cutoutRows = ['G', 'H', 'I', 'J', 'K'].map((r) =>
    createRowFromGroups(r, [
      createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat(r, i + 1, sec, 'booked'))),
      createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat(r, i + 7, sec, 'booked'))),
      createCustomSeatGroup([
        createCustomSeat(r, 15, sec, 'booked'),
        createCustomSeat(r, 16, sec, 'booked'),
        createSpacerSeat(r, sec),
        createSpacerSeat(r, sec),
        createSpacerSeat(r, sec),
        createSpacerSeat(r, sec),
      ])
    ])
  );

  // Row L (Row 11): Left (1,2 avail, 3-6 booked), Center (8 booked), Right (4 booked, 20,21 avail)
  const rowL = createRowFromGroups('L', [
    createCustomSeatGroup([
      createCustomSeat('L', 1, sec, 'available'),
      createCustomSeat('L', 2, sec, 'available'),
      ...Array.from({ length: 4 }, (_, i) => createCustomSeat('L', i + 3, sec, 'booked'))
    ]),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('L', i + 7, sec, 'booked'))),
    createCustomSeatGroup([
      ...Array.from({ length: 4 }, (_, i) => createCustomSeat('L', i + 15, sec, 'booked')),
      createCustomSeat('L', 20, sec, 'available'),
      createCustomSeat('L', 21, sec, 'available')
    ])
  ]);

  // Row M (Row 12): Left (1,2 avail, 3-6 booked), Center (8 booked), Right (3 booked, 19,20,21 avail)
  const rowM = createRowFromGroups('M', [
    createCustomSeatGroup([
      createCustomSeat('M', 1, sec, 'available'),
      createCustomSeat('M', 2, sec, 'available'),
      ...Array.from({ length: 4 }, (_, i) => createCustomSeat('M', i + 3, sec, 'booked'))
    ]),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('M', i + 7, sec, 'booked'))),
    createCustomSeatGroup([
      ...Array.from({ length: 3 }, (_, i) => createCustomSeat('M', i + 15, sec, 'booked')),
      createCustomSeat('M', 19, sec, 'available'),
      createCustomSeat('M', 20, sec, 'available'),
      createCustomSeat('M', 21, sec, 'available')
    ])
  ]);

  // Row N (Row 13): Left (1..4 avail, 5-6 booked), Center (8 booked), Right (2 booked, 18..21 avail)
  const rowN = createRowFromGroups('N', [
    createCustomSeatGroup([
      ...Array.from({ length: 4 }, (_, i) => createCustomSeat('N', i + 1, sec, 'available')),
      createCustomSeat('N', 5, sec, 'booked'),
      createCustomSeat('N', 6, sec, 'booked')
    ]),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('N', i + 7, sec, 'booked'))),
    createCustomSeatGroup([
      createCustomSeat('N', 15, sec, 'booked'),
      createCustomSeat('N', 16, sec, 'booked'),
      ...Array.from({ length: 4 }, (_, i) => createCustomSeat('N', i + 18, sec, 'available'))
    ])
  ]);

  // Row O (Row 14): Left (1..4 avail, 5-6 booked), Center (8 booked), Right (1 booked, 17..21 avail)
  const rowO = createRowFromGroups('O', [
    createCustomSeatGroup([
      ...Array.from({ length: 4 }, (_, i) => createCustomSeat('O', i + 1, sec, 'available')),
      createCustomSeat('O', 5, sec, 'booked'),
      createCustomSeat('O', 6, sec, 'booked')
    ]),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('O', i + 7, sec, 'booked'))),
    createCustomSeatGroup([
      createCustomSeat('O', 15, sec, 'booked'),
      ...Array.from({ length: 5 }, (_, i) => createCustomSeat('O', i + 17, sec, 'available'))
    ])
  ]);

  // Row P (Row 15): Left (1..6 avail), Center (8 booked), Right (16..21 avail)
  const rowP = createRowFromGroups('P', [
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('P', i + 1, sec, 'available'))),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('P', i + 7, sec, 'booked'))),
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('P', i + 16, sec, 'available')))
  ]);

  return [...upperRows, ...cutoutRows, rowL, rowM, rowN, rowO, rowP];
}

function buildGeethaNonPremiumRows(): any[] {
  const sec = 'sec-non-premium';

  // Row Q: Left 6 avail, Center (2 avail, 3 spacers, 4 avail), Right 6 avail
  const rowQ = createRowFromGroups('Q', [
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('Q', i + 1, sec, 'available'))),
    createCustomSeatGroup([
      createCustomSeat('Q', 7, sec, 'available'),
      createCustomSeat('Q', 8, sec, 'available'),
      createSpacerSeat('Q', sec),
      createSpacerSeat('Q', sec),
      createSpacerSeat('Q', sec),
      createCustomSeat('Q', 12, sec, 'available'),
      createCustomSeat('Q', 13, sec, 'available'),
      createCustomSeat('Q', 14, sec, 'available'),
      createCustomSeat('Q', 15, sec, 'available'),
    ]),
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('Q', i + 16, sec, 'available')))
  ]);

  // Row R: Left 6 avail, Center 8 avail, Right 6 avail
  const rowR = createRowFromGroups('R', [
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('R', i + 1, sec, 'available'))),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('R', i + 7, sec, 'available'))),
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('R', i + 16, sec, 'available')))
  ]);

  // Row S: Left (1 spacer, 5 avail: 2..6), Center 8 avail, Right (5 avail: 16..20, 1 spacer)
  const rowS = createRowFromGroups('S', [
    createCustomSeatGroup([
      createSpacerSeat('S', sec),
      ...Array.from({ length: 5 }, (_, i) => createCustomSeat('S', i + 2, sec, 'available'))
    ]),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('S', i + 7, sec, 'available'))),
    createCustomSeatGroup([
      ...Array.from({ length: 5 }, (_, i) => createCustomSeat('S', i + 16, sec, 'available')),
      createSpacerSeat('S', sec)
    ])
  ]);

  // Row T: Left 6 avail, Center 8 avail, Right 6 avail
  const rowT = createRowFromGroups('T', [
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('T', i + 1, sec, 'available'))),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('T', i + 7, sec, 'available'))),
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('T', i + 16, sec, 'available')))
  ]);

  // Row U (closest to screen): Left 6 avail, Center 8 avail, Right 6 avail
  const rowU = createRowFromGroups('U', [
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('U', i + 1, sec, 'available'))),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('U', i + 7, sec, 'available'))),
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('U', i + 16, sec, 'available')))
  ]);

  return [rowQ, rowR, rowS, rowT, rowU];
}

const reclinerRows = buildGeethaReclinerRows();
const premiumRows = buildGeethaPremiumRows();
const nonPremiumRows = buildGeethaNonPremiumRows();

const allNonSpacerSeats = [...reclinerRows, ...premiumRows, ...nonPremiumRows].flatMap((r) =>
  r.groups.flatMap((g: any) => g.seats.filter((s: TicketXSeat) => s.status !== 'blocked'))
);

export const geethaMultiplexLayout: TicketXSeatLayout = {
  id: 'layout-geetha-multiplex',
  theatreId: 'geetha-multiplex',
  locationId: 'nrt',
  theatreName: 'Geetha Multiplex, Kasu Central Mall, Narasaraopet',
  screenPosition: 'bottom',
  capacity: allNonSpacerSeats.length,
  verifiedCapacity: allNonSpacerSeats.length,
  sections: [
    {
      id: 'sec-recliner',
      name: 'RECLINER',
      categoryKey: 'recliner',
      price: 290,
      priceStatus: 'confirmed',
      rows: reclinerRows,
    },
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
