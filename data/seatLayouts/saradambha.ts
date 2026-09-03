import { TicketXSeatLayout, TicketXSeatSection, TicketXSeat } from '@/types/seatLayouts';
import { createCustomSeat, createSpacerSeat, createCustomSeatGroup, createRowFromGroups } from './builder';

// Exact Seat Map for Saradambha / Sharadamba Theatre, Narasaraopet (Reference Image 3 / 4)
// Structure: Screen at bottom, 2-Tier: Platinum (₹395) & Gold (₹250)
// Preserves exact seat counts, left (4/6) & right (11/9) split, and exact seat number arrangement

function buildSaradambhaPlatinumRows(): any[] {
  const sec = 'sec-platinum';

  // Row A: Left 2 seats (with 2 spacers to align), Right 6 seats (with 5 spacers)
  const rowA = createRowFromGroups('A', [
    createCustomSeatGroup([
      createSpacerSeat('A', sec),
      createSpacerSeat('A', sec),
      createCustomSeat('A', 1, sec, 'booked'),
      createCustomSeat('A', 2, sec, 'booked'),
    ]),
    createCustomSeatGroup([
      createCustomSeat('A', 3, sec, 'booked'),
      createCustomSeat('A', 4, sec, 'booked'),
      createCustomSeat('A', 5, sec, 'booked'),
      createCustomSeat('A', 6, sec, 'booked'),
      createCustomSeat('A', 7, sec, 'booked'),
      createCustomSeat('A', 8, sec, 'booked'),
      createSpacerSeat('A', sec),
      createSpacerSeat('A', sec),
      createSpacerSeat('A', sec),
      createSpacerSeat('A', sec),
      createSpacerSeat('A', sec),
    ])
  ]);

  return [rowA];
}

function buildSaradambhaGoldRows(): any[] {
  const sec = 'sec-gold';

  // Rows B to I (8 rows): Left 4 booked, Right 11 booked
  const upperTierRows = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map((r) =>
    createRowFromGroups(r, [
      createCustomSeatGroup([
        createCustomSeat(r, 12, sec, 'booked'),
        createCustomSeat(r, 13, sec, 'booked'),
        createCustomSeat(r, 14, sec, 'booked'),
        createCustomSeat(r, 15, sec, 'booked'),
      ]),
      createCustomSeatGroup([
        createCustomSeat(r, 1, sec, 'booked'),
        createCustomSeat(r, 2, sec, 'booked'),
        createCustomSeat(r, 3, sec, 'booked'),
        createCustomSeat(r, 4, sec, 'booked'),
        createCustomSeat(r, 5, sec, 'booked'),
        createCustomSeat(r, 6, sec, 'booked'),
        createCustomSeat(r, 7, sec, 'booked'),
        createCustomSeat(r, 8, sec, 'booked'),
        createCustomSeat(r, 9, sec, 'booked'),
        createCustomSeat(r, 10, sec, 'booked'),
        createCustomSeat(r, 11, sec, 'booked'),
      ])
    ])
  );

  // Row J: Left (14 avail, others booked), Right (9 booked)
  const rowJ = createRowFromGroups('J', [
    createCustomSeatGroup([
      createCustomSeat('J', 15, sec, 'booked'),
      createCustomSeat('J', 14, sec, 'available'),
      createCustomSeat('J', 13, sec, 'booked'),
      createCustomSeat('J', 12, sec, 'booked'),
      createCustomSeat('J', 11, sec, 'booked'),
      createCustomSeat('J', 10, sec, 'booked'),
    ]),
    createCustomSeatGroup(
      [9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => createCustomSeat('J', num, sec, 'booked'))
    )
  ]);

  // Row K: Left (15, 14, 13, 12 avail, 11, 10 booked), Right (9 booked)
  const rowK = createRowFromGroups('K', [
    createCustomSeatGroup([
      createCustomSeat('K', 15, sec, 'available'),
      createCustomSeat('K', 14, sec, 'available'),
      createCustomSeat('K', 13, sec, 'available'),
      createCustomSeat('K', 12, sec, 'available'),
      createCustomSeat('K', 11, sec, 'booked'),
      createCustomSeat('K', 10, sec, 'booked'),
    ]),
    createCustomSeatGroup(
      [9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => createCustomSeat('K', num, sec, 'booked'))
    )
  ]);

  // Row L: Left (11 avail, others booked), Right (9-4 booked, 3, 2, 1 avail)
  const rowL = createRowFromGroups('L', [
    createCustomSeatGroup([
      createCustomSeat('L', 15, sec, 'booked'),
      createCustomSeat('L', 14, sec, 'booked'),
      createCustomSeat('L', 13, sec, 'booked'),
      createCustomSeat('L', 12, sec, 'booked'),
      createCustomSeat('L', 11, sec, 'available'),
      createCustomSeat('L', 10, sec, 'booked'),
    ]),
    createCustomSeatGroup([
      createCustomSeat('L', 9, sec, 'booked'),
      createCustomSeat('L', 8, sec, 'booked'),
      createCustomSeat('L', 7, sec, 'booked'),
      createCustomSeat('L', 6, sec, 'booked'),
      createCustomSeat('L', 5, sec, 'booked'),
      createCustomSeat('L', 4, sec, 'booked'),
      createCustomSeat('L', 3, sec, 'available'),
      createCustomSeat('L', 2, sec, 'available'),
      createCustomSeat('L', 1, sec, 'available'),
    ])
  ]);

  // Row M: Left (15..10 all avail), Right (9..1 all avail)
  const rowM = createRowFromGroups('M', [
    createCustomSeatGroup(
      [15, 14, 13, 12, 11, 10].map((num) => createCustomSeat('M', num, sec, 'available'))
    ),
    createCustomSeatGroup(
      [9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => createCustomSeat('M', num, sec, 'available'))
    )
  ]);

  // Row N: Left (15..10 all avail), Right (9..1 all avail)
  const rowN = createRowFromGroups('N', [
    createCustomSeatGroup(
      [15, 14, 13, 12, 11, 10].map((num) => createCustomSeat('N', num, sec, 'available'))
    ),
    createCustomSeatGroup(
      [9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => createCustomSeat('N', num, sec, 'available'))
    )
  ]);

  // Row O (closest to screen): Left (15..10 all avail), Right (9..1 all avail)
  const rowO = createRowFromGroups('O', [
    createCustomSeatGroup(
      [15, 14, 13, 12, 11, 10].map((num) => createCustomSeat('O', num, sec, 'available'))
    ),
    createCustomSeatGroup(
      [9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => createCustomSeat('O', num, sec, 'available'))
    )
  ]);

  return [...upperTierRows, rowJ, rowK, rowL, rowM, rowN, rowO];
}

const platinumRows = buildSaradambhaPlatinumRows();
const goldRows = buildSaradambhaGoldRows();

const allNonSpacerSeats = [...platinumRows, ...goldRows].flatMap((r) =>
  r.groups.flatMap((g: any) => g.seats.filter((s: TicketXSeat) => s.status !== 'blocked'))
);

export const saradambhaLayout: TicketXSeatLayout = {
  id: 'layout-saradambha-theatre',
  theatreId: 'saradambha-theatre',
  locationId: 'nrt',
  theatreName: 'Saradambha / Sharadamba Theatre, Narasaraopet',
  screenPosition: 'bottom',
  capacity: allNonSpacerSeats.length,
  verifiedCapacity: allNonSpacerSeats.length,
  sections: [
    {
      id: 'sec-platinum',
      name: 'PLATINUM',
      categoryKey: 'platinum',
      price: 395,
      priceStatus: 'confirmed',
      rows: platinumRows,
    },
    {
      id: 'sec-gold',
      name: 'GOLD',
      categoryKey: 'gold',
      price: 250,
      priceStatus: 'confirmed',
      rows: goldRows,
    },
  ],
};

export const sharadambaLayout = {
  ...saradambhaLayout,
  id: 'layout-sharadamba-theatre',
  theatreId: 'sharadamba-theatre',
};
