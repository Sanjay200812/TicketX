import {
  TicketXSeatLayout,
  TicketXSeatSection,
  TicketXSeatRow,
  TicketXSeatGroup,
  TicketXSeat,
  SeatStatus,
} from '@/types/seatLayouts';

export function createSeatGroup(
  row: string,
  startNum: number,
  count: number,
  sectionId: string,
  bookedNums: number[] = [],
  disabledNums: number[] = []
): TicketXSeatGroup {
  const seats: TicketXSeat[] = Array.from({ length: count }, (_, i) => {
    const num = startNum + i;
    const numStr = num.toString().padStart(2, '0');
    const id = `${row}${numStr}`;
    let status: SeatStatus = 'available';
    if (bookedNums.includes(num)) {
      status = 'booked';
    } else if (disabledNums.includes(num)) {
      status = 'disabled';
    }

    return {
      id,
      label: id,
      row,
      number: num,
      status,
      sectionId,
    };
  });

  return { seats };
}

export function createCustomSeat(
  row: string,
  number: number,
  sectionId: string,
  status: SeatStatus = 'available',
  customId?: string
): TicketXSeat {
  const numStr = number.toString().padStart(2, '0');
  return {
    id: customId || `${row}${numStr}`,
    label: customId || `${row}${numStr}`,
    row,
    number,
    status,
    sectionId,
  };
}

export function createSpacerSeat(row: string, sectionId: string): TicketXSeat {
  return {
    id: `spacer-${row}-${Math.random().toString(36).substring(2, 8)}`,
    label: '',
    row,
    status: 'blocked',
    sectionId,
  };
}

export function createCustomSeatGroup(seats: TicketXSeat[]): TicketXSeatGroup {
  return { seats };
}

export function createRowFromGroups(row: string, groups: TicketXSeatGroup[]): TicketXSeatRow {
  // Legacy backward compatibility arrays for existing renderers
  const allSeats = groups.flatMap((g) => g.seats);
  return {
    row,
    groups,
    seats: allSeats
      .filter((s) => s.status !== 'blocked')
      .map((s) => ({ number: s.number || 0, status: s.status })),
  };
}
