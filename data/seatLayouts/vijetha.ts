import { TicketXSeatLayout, TicketXSeatSection, TicketXSeat } from '@/types/seatLayouts';
import { createCustomSeat, createSpacerSeat, createCustomSeatGroup, createRowFromGroups } from './builder';

// Exact Seat Map for Vijetha Deluxe, Narasaraopet (Reference Image 4)
// Structure: Screen at bottom, 2-Tier: Gold (₹150) & Silver (₹150)
// Preserves exact 3-column layout (Left 6, Center 8, Right 6), entrance-side right-flank cutout, and exact active/booked seats

function buildVijethaGoldRows(): any[] {
  const sec = 'sec-gold';

  // Rows A to D (Rows 1-4): Left 6 booked, Center 8 booked, Right 6 booked
  const rowsAToD = ['A', 'B', 'C', 'D'].map((r) =>
    createRowFromGroups(r, [
      createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat(r, i + 1, sec, 'booked'))),
      createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat(r, i + 7, sec, 'booked'))),
      createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat(r, i + 15, sec, 'booked')))
    ])
  );

  // Row E (Row 5): Left (E1 avail, E2-E5 booked, E6 avail), Center (8 booked), Right (4 booked, E18-E21 avail)
  const rowE = createRowFromGroups('E', [
    createCustomSeatGroup([
      createCustomSeat('E', 1, sec, 'available'),
      ...Array.from({ length: 4 }, (_, i) => createCustomSeat('E', i + 2, sec, 'booked')),
      createCustomSeat('E', 6, sec, 'available')
    ]),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('E', i + 7, sec, 'booked'))),
    createCustomSeatGroup([
      createCustomSeat('E', 15, sec, 'booked'),
      createCustomSeat('E', 16, sec, 'booked'),
      createCustomSeat('E', 17, sec, 'booked'),
      createCustomSeat('E', 18, sec, 'available'),
      createCustomSeat('E', 19, sec, 'available'),
      createCustomSeat('E', 20, sec, 'available'),
      createCustomSeat('E', 21, sec, 'available')
    ])
  ]);

  // Row F (Row 6): Left 6 booked, Center 8 booked, Right (F16, F17 avail, others booked/spacers)
  const rowF = createRowFromGroups('F', [
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('F', i + 1, sec, 'booked'))),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('F', i + 7, sec, 'booked'))),
    createCustomSeatGroup([
      createCustomSeat('F', 15, sec, 'booked'),
      createCustomSeat('F', 16, sec, 'available'),
      createCustomSeat('F', 17, sec, 'available'),
      createCustomSeat('F', 18, sec, 'booked'),
      createCustomSeat('F', 19, sec, 'booked'),
      createCustomSeat('F', 20, sec, 'booked'),
      createCustomSeat('F', 21, sec, 'booked')
    ])
  ]);

  // Row G (Row 7): Left 6 booked, Center (G10, G12 avail), Right ENTRANCE CUTOUT (spacers)
  const rowG = createRowFromGroups('G', [
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('G', i + 1, sec, 'booked'))),
    createCustomSeatGroup([
      createCustomSeat('G', 7, sec, 'booked'),
      createCustomSeat('G', 8, sec, 'booked'),
      createCustomSeat('G', 9, sec, 'booked'),
      createCustomSeat('G', 10, sec, 'available'),
      createCustomSeat('G', 11, sec, 'booked'),
      createCustomSeat('G', 12, sec, 'available'),
      createCustomSeat('G', 13, sec, 'booked'),
      createCustomSeat('G', 14, sec, 'booked')
    ]),
    createCustomSeatGroup([
      createCustomSeat('G', 15, sec, 'booked'),
      createCustomSeat('G', 16, sec, 'booked'),
      createSpacerSeat('G', sec),
      createSpacerSeat('G', sec),
      createSpacerSeat('G', sec),
      createSpacerSeat('G', sec)
    ])
  ]);

  // Row H (Row 8): Left (H1 avail, H2-H6 booked), Center 8 booked, Right ENTRANCE CUTOUT
  const rowH = createRowFromGroups('H', [
    createCustomSeatGroup([
      createCustomSeat('H', 1, sec, 'available'),
      ...Array.from({ length: 5 }, (_, i) => createCustomSeat('H', i + 2, sec, 'booked'))
    ]),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('H', i + 7, sec, 'booked'))),
    createCustomSeatGroup([
      createCustomSeat('H', 15, sec, 'booked'),
      createCustomSeat('H', 16, sec, 'booked'),
      createSpacerSeat('H', sec),
      createSpacerSeat('H', sec),
      createSpacerSeat('H', sec),
      createSpacerSeat('H', sec)
    ])
  ]);

  // Row I (Row 9): Left 6 booked, Center (I13, I14 avail), Right ENTRANCE CUTOUT
  const rowI = createRowFromGroups('I', [
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('I', i + 1, sec, 'booked'))),
    createCustomSeatGroup([
      ...Array.from({ length: 6 }, (_, i) => createCustomSeat('I', i + 7, sec, 'booked')),
      createCustomSeat('I', 13, sec, 'available'),
      createCustomSeat('I', 14, sec, 'available')
    ]),
    createCustomSeatGroup([
      createCustomSeat('I', 15, sec, 'booked'),
      createCustomSeat('I', 16, sec, 'booked'),
      createSpacerSeat('I', sec),
      createSpacerSeat('I', sec),
      createSpacerSeat('I', sec),
      createSpacerSeat('I', sec)
    ])
  ]);

  // Row J (Row 10): Left (J1..J6 ALL AVAIL), Center 8 booked, Right ENTRANCE CUTOUT
  const rowJ = createRowFromGroups('J', [
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('J', i + 1, sec, 'available'))),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('J', i + 7, sec, 'booked'))),
    createCustomSeatGroup([
      createCustomSeat('J', 15, sec, 'booked'),
      createCustomSeat('J', 16, sec, 'booked'),
      createSpacerSeat('J', sec),
      createSpacerSeat('J', sec),
      createSpacerSeat('J', sec),
      createSpacerSeat('J', sec)
    ])
  ]);

  // Row K (Row 11): Left (K1..K6 ALL AVAIL), Center (K11 avail), Right (K20, K21 avail)
  const rowK = createRowFromGroups('K', [
    createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat('K', i + 1, sec, 'available'))),
    createCustomSeatGroup([
      ...Array.from({ length: 4 }, (_, i) => createCustomSeat('K', i + 7, sec, 'booked')),
      createCustomSeat('K', 11, sec, 'available'),
      ...Array.from({ length: 3 }, (_, i) => createCustomSeat('K', i + 12, sec, 'booked'))
    ]),
    createCustomSeatGroup([
      createSpacerSeat('K', sec),
      createSpacerSeat('K', sec),
      createSpacerSeat('K', sec),
      createSpacerSeat('K', sec),
      createCustomSeat('K', 20, sec, 'available'),
      createCustomSeat('K', 21, sec, 'available')
    ])
  ]);

  // Rows L to O (Rows 12-15): Left (L1..L6 avail), Center (booked), Right (L16..L21 avail)
  const rowsLToO = ['L', 'M', 'N', 'O'].map((r) =>
    createRowFromGroups(r, [
      createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat(r, i + 1, sec, 'available'))),
      createCustomSeatGroup(
        r === 'O'
          ? [
              createCustomSeat('O', 7, sec, 'available'),
              ...Array.from({ length: 7 }, (_, i) => createCustomSeat('O', i + 8, sec, 'booked'))
            ]
          : Array.from({ length: 8 }, (_, i) => createCustomSeat(r, i + 7, sec, 'booked'))
      ),
      createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat(r, i + 16, sec, 'available')))
    ])
  );

  // Row P (Row 16): Left (2 spacers, P3..P6 avail), Center (P6..P13 avail), Right (P14..P17 avail, 2 spacers)
  const rowP = createRowFromGroups('P', [
    createCustomSeatGroup([
      createSpacerSeat('P', sec),
      createSpacerSeat('P', sec),
      createCustomSeat('P', 3, sec, 'available'),
      createCustomSeat('P', 4, sec, 'available'),
      createCustomSeat('P', 5, sec, 'available'),
      createCustomSeat('P', 6, sec, 'available'),
    ]),
    createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat('P', i + 6, sec, 'available'))),
    createCustomSeatGroup([
      createCustomSeat('P', 14, sec, 'available'),
      createCustomSeat('P', 15, sec, 'available'),
      createCustomSeat('P', 16, sec, 'available'),
      createCustomSeat('P', 17, sec, 'available'),
      createSpacerSeat('P', sec),
      createSpacerSeat('P', sec)
    ])
  ]);

  // Rows Q and R (Rows 17-18): Left 6 avail, Center 8 avail, Right 6 avail
  const rowsQAndR = ['Q', 'R'].map((r) =>
    createRowFromGroups(r, [
      createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat(r, i + 1, sec, 'available'))),
      createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat(r, i + 7, sec, 'available'))),
      createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat(r, i + 15, sec, 'available')))
    ])
  );

  return [...rowsAToD, rowE, rowF, rowG, rowH, rowI, rowJ, rowK, ...rowsLToO, rowP, ...rowsQAndR];
}

function buildVijethaSilverRows(): any[] {
  const sec = 'sec-silver';

  // Rows S, T, U (3 Rows): Left 6 avail, Center 8 avail, Right 6 avail
  const silverRows = ['S', 'T', 'U'].map((r) =>
    createRowFromGroups(r, [
      createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat(r, i + 1, sec, 'available'))),
      createCustomSeatGroup(Array.from({ length: 8 }, (_, i) => createCustomSeat(r, i + 7, sec, 'available'))),
      createCustomSeatGroup(Array.from({ length: 6 }, (_, i) => createCustomSeat(r, i + 16, sec, 'available')))
    ])
  );

  return silverRows;
}

const goldRows = buildVijethaGoldRows();
const silverRows = buildVijethaSilverRows();

const allNonSpacerSeats = [...goldRows, ...silverRows].flatMap((r) =>
  r.groups.flatMap((g: any) => g.seats.filter((s: TicketXSeat) => s.status !== 'blocked'))
);

export const vijethaLayout: TicketXSeatLayout = {
  id: 'layout-vijetha-deluxe',
  theatreId: 'vijetha-deluxe',
  locationId: 'nrt',
  theatreName: 'Vijetha Deluxe, Narasaraopet',
  screenPosition: 'bottom',
  capacity: allNonSpacerSeats.length,
  verifiedCapacity: allNonSpacerSeats.length,
  sections: [
    {
      id: 'sec-gold',
      name: 'GOLD',
      categoryKey: 'gold',
      price: 150,
      priceStatus: 'confirmed',
      rows: goldRows,
    },
    {
      id: 'sec-silver',
      name: 'SILVER',
      categoryKey: 'silver',
      price: 150,
      priceStatus: 'confirmed',
      rows: silverRows,
    },
  ],
};
