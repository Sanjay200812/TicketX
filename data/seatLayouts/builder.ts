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

export function createRowFromGroups(row: string, groups: TicketXSeatGroup[]): TicketXSeatRow {
  // Legacy backward compatibility arrays for existing renderers
  const allSeats = groups.flatMap((g) => g.seats);
  return {
    row,
    groups,
    seats: allSeats.map((s) => ({ number: s.number || 0, status: s.status })),
  };
}
