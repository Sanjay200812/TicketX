export interface EventSeatRow {
  rowLabel: string;
  leftSeats: { number: number; seatCode: string }[];
  centerSeats: { number: number; seatCode: string }[];
  rightSeats: { number: number; seatCode: string }[];
}

export interface EventSeatSection {
  id: string;
  categoryKey: 'premium' | 'gold' | 'silver';
  name: string;
  price: number;
  description: string;
  totalSeats: number;
  rows: EventSeatRow[];
}

export interface EventLayout {
  eventId: string;
  eventName: string;
  totalCapacity: 1000;
  sections: EventSeatSection[];
}

// Convert row index (0, 1, 2, ... 25, 26) to letter label (A, B, C ... Z, AA, AB ...)
export function getEventRowLabel(index: number): string {
  let label = '';
  let idx = index;
  while (idx >= 0) {
    label = String.fromCharCode((idx % 26) + 65) + label;
    idx = Math.floor(idx / 26) - 1;
  }
  return label;
}

/**
 * Generates exact 1000-seat layout for events (Requirement 5, 21, 34):
 * TOP / BACK OF HALL
 * 1. SILVER: 500 seats (Rows A to T — 20 rows x 25 seats)
 * 2. GOLD (BALCONY): 300 seats (Rows U to AI — 15 rows x 20 seats)
 * 3. PREMIUM: 200 seats (Rows AJ to AS — 10 rows x 20 seats)
 * STAGE (BOTTOM / FRONT)
 * TOTAL = 500 + 300 + 200 = 1000 SEATS
 */
export function generate1000SeatEventLayout(
  eventId: string,
  eventName: string,
  pricing: { silver: number; gold: number; premium: number }
): EventLayout {
  let currentRowIndex = 0;

  // 1. SILVER SECTION (Top / Back of hall) - 500 seats (20 rows x 25 seats: Rows A to T)
  const silverRows: EventSeatRow[] = [];
  for (let r = 0; r < 20; r++) {
    const rowLabel = getEventRowLabel(currentRowIndex++);
    const leftSeats: { number: number; seatCode: string }[] = [];
    const centerSeats: { number: number; seatCode: string }[] = [];
    const rightSeats: { number: number; seatCode: string }[] = [];

    // 6 left, 13 center, 6 right = 25 per row
    let num = 1;
    for (let i = 0; i < 6; i++) {
      leftSeats.push({ number: num, seatCode: `${rowLabel}${num}` });
      num++;
    }
    for (let i = 0; i < 13; i++) {
      centerSeats.push({ number: num, seatCode: `${rowLabel}${num}` });
      num++;
    }
    for (let i = 0; i < 6; i++) {
      rightSeats.push({ number: num, seatCode: `${rowLabel}${num}` });
      num++;
    }

    silverRows.push({ rowLabel, leftSeats, centerSeats, rightSeats });
  }

  // 2. GOLD (BALCONY) SECTION (Middle) - 300 seats (15 rows x 20 seats: Rows U to AI)
  const goldRows: EventSeatRow[] = [];
  for (let r = 0; r < 15; r++) {
    const rowLabel = getEventRowLabel(currentRowIndex++);
    const leftSeats: { number: number; seatCode: string }[] = [];
    const centerSeats: { number: number; seatCode: string }[] = [];
    const rightSeats: { number: number; seatCode: string }[] = [];

    let num = 1;
    for (let i = 0; i < 5; i++) {
      leftSeats.push({ number: num, seatCode: `${rowLabel}${num}` });
      num++;
    }
    for (let i = 0; i < 10; i++) {
      centerSeats.push({ number: num, seatCode: `${rowLabel}${num}` });
      num++;
    }
    for (let i = 0; i < 5; i++) {
      rightSeats.push({ number: num, seatCode: `${rowLabel}${num}` });
      num++;
    }

    goldRows.push({ rowLabel, leftSeats, centerSeats, rightSeats });
  }

  // 3. PREMIUM SECTION (Closest to stage / Front) - 200 seats (10 rows x 20 seats: Rows AJ to AS)
  const premiumRows: EventSeatRow[] = [];
  for (let r = 0; r < 10; r++) {
    const rowLabel = getEventRowLabel(currentRowIndex++);
    const leftSeats: { number: number; seatCode: string }[] = [];
    const centerSeats: { number: number; seatCode: string }[] = [];
    const rightSeats: { number: number; seatCode: string }[] = [];

    // 5 left, 10 center, 5 right = 20 per row
    let num = 1;
    for (let i = 0; i < 5; i++) {
      leftSeats.push({ number: num, seatCode: `${rowLabel}${num}` });
      num++;
    }
    for (let i = 0; i < 10; i++) {
      centerSeats.push({ number: num, seatCode: `${rowLabel}${num}` });
      num++;
    }
    for (let i = 0; i < 5; i++) {
      rightSeats.push({ number: num, seatCode: `${rowLabel}${num}` });
      num++;
    }

    premiumRows.push({ rowLabel, leftSeats, centerSeats, rightSeats });
  }

  const sections: EventSeatSection[] = [
    {
      id: `${eventId}-silver`,
      categoryKey: 'silver',
      name: 'SILVER',
      price: pricing.silver,
      description: 'Standard event seating located in the rear auditorium hall',
      totalSeats: 500,
      rows: silverRows,
    },
    {
      id: `${eventId}-gold`,
      categoryKey: 'gold',
      name: 'GOLD (BALCONY)',
      price: pricing.gold,
      description: 'Prime balcony auditorium seating with excellent acoustic & stage visibility',
      totalSeats: 300,
      rows: goldRows,
    },
    {
      id: `${eventId}-premium`,
      categoryKey: 'premium',
      name: 'PREMIUM',
      price: pricing.premium,
      description: 'Front row seats right next to the stage with maximum legroom & best view',
      totalSeats: 200,
      rows: premiumRows,
    },
  ];

  return {
    eventId,
    eventName,
    totalCapacity: 1000,
    sections,
  };
}
