import { locations } from '../data/locations';
import { movies } from '../data/movies';
import { theatres } from '../data/theatres';
import { shows } from '../data/shows';
import { seatLayouts } from '../data/seatLayouts';
import { TicketXSeatLayout } from '../types/seatLayouts';

export function calculateUsableCapacity(layout: TicketXSeatLayout): number {
  return layout.sections.reduce((total, section) => {
    return (
      total +
      section.rows.reduce((rowTotal, rowGroup) => {
        const leftCount = (rowGroup.leftSeats || []).filter((s) => s.status !== 'blocked').length;
        const centerCount = (rowGroup.centerSeats || []).filter((s) => s.status !== 'blocked').length;
        const rightCount = (rowGroup.rightSeats || []).filter((s) => s.status !== 'blocked').length;
        const normalCount = (rowGroup.seats || []).filter((s) => s.status !== 'blocked').length;
        return rowTotal + leftCount + centerCount + rightCount + normalCount;
      }, 0)
    );
  }, 0);
}

export function validateTicketXData(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const locationIds = new Set(locations.map((l) => l.id));
  const movieIds = new Set<string>();
  const theatreIds = new Set<string>();
  const showIds = new Set<string>();

  // Check unique movie IDs
  movies.forEach((m) => {
    if (movieIds.has(m.id)) {
      errors.push(`Duplicate movie ID found: ${m.id}`);
    }
    movieIds.add(m.id);
  });

  // Check unique theatre IDs and locationId validity
  theatres.forEach((t) => {
    if (theatreIds.has(t.id)) {
      errors.push(`Duplicate theatre ID found: ${t.id}`);
    }
    theatreIds.add(t.id);

    if (!locationIds.has(t.locationId)) {
      errors.push(`Theatre ${t.id} references invalid locationId: ${t.locationId}`);
    }
  });

  // Check show validity
  shows.forEach((s) => {
    if (showIds.has(s.id)) {
      errors.push(`Duplicate show ID found: ${s.id}`);
    }
    showIds.add(s.id);

    if (!movieIds.has(s.movieId)) {
      errors.push(`Show ${s.id} references invalid movieId: ${s.movieId}`);
    }
    if (!theatreIds.has(s.theatreId)) {
      errors.push(`Show ${s.id} references invalid theatreId: ${s.theatreId}`);
    }
    if (!locationIds.has(s.locationId)) {
      errors.push(`Show ${s.id} references invalid locationId: ${s.locationId}`);
    }
  });

  // Check seatLayouts validity & capacity matching
  seatLayouts.forEach((sl) => {
    if (!theatreIds.has(sl.theatreId)) {
      errors.push(`SeatLayout ${sl.id} references invalid theatreId: ${sl.theatreId}`);
    }
    if (sl.locationId && !locationIds.has(sl.locationId)) {
      errors.push(`SeatLayout ${sl.id} references invalid locationId: ${sl.locationId}`);
    }

    const calculatedCapacity = calculateUsableCapacity(sl);
    if (calculatedCapacity !== sl.verifiedCapacity) {
      errors.push(
        `Capacity Mismatch for ${sl.theatreName} (${sl.id}): Expected verified capacity ${sl.verifiedCapacity}, but rendered usable capacity is ${calculatedCapacity}`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
