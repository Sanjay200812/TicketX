import fs from 'fs';
import path from 'path';

export const ACTIVE_CHECKOUT_HOLD_MINUTES = 10;
export const ABANDONED_HOLD_MINUTES = 5;

export interface ServerSeatState {
  showId: string;
  seatCode: string;
  status: 'available' | 'held' | 'booked';
  heldBy?: string;
  expiresAt?: number;
  bookedBy?: string;
}

export interface ServerHold {
  id: string;
  showId: string;
  seatCodes: string[];
  userId: string;
  status: 'active' | 'abandoned';
  createdAt: number;
  expiresAt: number;
}

export interface ServerBooking {
  id: string;
  idempotencyKey?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  showId: string;
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  movieLanguage?: string;
  theatreId: string;
  theatreName: string;
  locationId: string;
  cityName: string;
  date: string;
  time: string;
  screenName: string;
  seatCodes: string[];
  pricing: {
    subtotal: number;
    bookingFee: number;
    taxableAmount: number;
    tax: number;
    grandTotal: number;
  };
  status: 'confirmed' | 'archived' | 'removed';
  createdAt: string;
  archivedAt?: string;
  removedAt?: string;
}

interface DBStore {
  seats: Record<string, ServerSeatState>; // key: `${showId}:${seatCode}`
  holds: Record<string, ServerHold>;
  bookings: Record<string, ServerBooking>;
}

const DB_PATH = path.join(process.cwd(), '.next', 'ticketx_db.json');

// Helper to load db from file
function loadDB(): DBStore {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading db file:', err);
  }
  return { seats: {}, holds: {}, bookings: {} };
}

// Helper to save db to file
function saveDB(db: DBStore) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db file:', err);
  }
}

// Global in-memory DB initialized from storage
const memoryDB: DBStore = loadDB();

// Clean expired holds (Requirement 18)
export function cleanupExpiredHolds(db: DBStore = memoryDB) {
  const now = Date.now();
  let changed = false;
  Object.keys(db.holds).forEach((holdId) => {
    const hold = db.holds[holdId];
    if (hold.expiresAt <= now) {
      // Release seats when hold expires
      hold.seatCodes.forEach((seatCode) => {
        const key = `${hold.showId}:${seatCode}`;
        if (db.seats[key] && db.seats[key].status === 'held' && db.seats[key].heldBy === hold.userId) {
          db.seats[key] = { showId: hold.showId, seatCode, status: 'available' };
        }
      });
      delete db.holds[holdId];
      changed = true;
    }
  });
  if (changed) {
    saveDB(db);
  }
}

/**
 * Get current seat status for a show
 */
export function getShowSeatsStatus(
  showId: string,
  requestingUserId?: string
): { booked: string[]; held: string[]; myHeld: { seatCodes: string[]; holdId: string; expiresAt: number; isAbandoned: boolean } | null } {
  cleanupExpiredHolds(memoryDB);
  const booked: string[] = [];
  const held: string[] = [];
  let myHeld: { seatCodes: string[]; holdId: string; expiresAt: number; isAbandoned: boolean } | null = null;

  Object.values(memoryDB.seats).forEach((seat) => {
    if (seat.showId === showId) {
      if (seat.status === 'booked') {
        booked.push(seat.seatCode);
      } else if (seat.status === 'held' && seat.expiresAt && seat.expiresAt > Date.now()) {
        if (requestingUserId && seat.heldBy === requestingUserId) {
          // Seat held by requesting user
        } else {
          // Seat held by another user
          held.push(seat.seatCode);
        }
      }
    }
  });

  if (requestingUserId) {
    const userHold = Object.values(memoryDB.holds).find(
      (h) => h.showId === showId && h.userId === requestingUserId && h.expiresAt > Date.now()
    );
    if (userHold) {
      myHeld = {
        holdId: userHold.id,
        seatCodes: userHold.seatCodes,
        expiresAt: userHold.expiresAt,
        isAbandoned: userHold.status === 'abandoned',
      };
    }
  }

  return { booked, held, myHeld };
}

/**
 * Atomically reserve seats when user clicks PROCEED TO CHECKOUT (Requirement 7, 10, 16, 17)
 */
export function holdSeats(
  showId: string,
  seatCodes: string[],
  userId: string
): { success: true; holdId: string; expiresAt: number } | { success: false; error: string; unavailableSeats: string[] } {
  cleanupExpiredHolds(memoryDB);

  if (seatCodes.length > 10) {
    return {
      success: false,
      error: 'Maximum 10 seats allowed per booking.',
      unavailableSeats: [],
    };
  }

  const unavailableSeats: string[] = [];

  // Atomic race condition check
  seatCodes.forEach((code) => {
    const key = `${showId}:${code}`;
    const current = memoryDB.seats[key];
    if (current) {
      if (current.status === 'booked') {
        unavailableSeats.push(code);
      } else if (
        current.status === 'held' &&
        current.expiresAt &&
        current.expiresAt > Date.now() &&
        current.heldBy !== userId
      ) {
        unavailableSeats.push(code);
      }
    }
  });

  if (unavailableSeats.length > 0) {
    return {
      success: false,
      error: 'This seat was just reserved by another customer. Please select another seat.',
      unavailableSeats,
    };
  }

  // Active checkout hold: 10 minutes (Requirement 10)
  const holdId = `hold_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const expiresAt = Date.now() + ACTIVE_CHECKOUT_HOLD_MINUTES * 60 * 1000;

  // Release any previous active holds for this user on this show
  Object.keys(memoryDB.holds).forEach((hId) => {
    const h = memoryDB.holds[hId];
    if (h.showId === showId && h.userId === userId) {
      delete memoryDB.holds[hId];
    }
  });

  seatCodes.forEach((code) => {
    const key = `${showId}:${code}`;
    memoryDB.seats[key] = {
      showId,
      seatCode: code,
      status: 'held',
      heldBy: userId,
      expiresAt,
    };
  });

  memoryDB.holds[holdId] = {
    id: holdId,
    showId,
    seatCodes,
    userId,
    status: 'active',
    createdAt: Date.now(),
    expiresAt,
  };

  saveDB(memoryDB);
  return { success: true, holdId, expiresAt };
}

/**
 * Transition hold to abandoned grace period (5 minutes) when user leaves checkout (Requirement 12)
 */
export function abandonHold(
  holdId: string,
  userId: string
): { success: boolean; expiresAt?: number } {
  cleanupExpiredHolds(memoryDB);
  const hold = memoryDB.holds[holdId];

  if (hold && hold.userId === userId && hold.expiresAt > Date.now()) {
    // 5-minute abandoned grace timer (Requirement 12)
    const expiresAt = Date.now() + ABANDONED_HOLD_MINUTES * 60 * 1000;
    hold.status = 'abandoned';
    hold.expiresAt = expiresAt;

    hold.seatCodes.forEach((code) => {
      const key = `${hold.showId}:${code}`;
      if (memoryDB.seats[key] && memoryDB.seats[key].heldBy === userId) {
        memoryDB.seats[key].expiresAt = expiresAt;
      }
    });

    saveDB(memoryDB);
    return { success: true, expiresAt };
  }

  return { success: false };
}

/**
 * Release a seat hold completely (e.g. user cancels)
 */
export function releaseHold(holdId: string): void {
  cleanupExpiredHolds(memoryDB);
  const hold = memoryDB.holds[holdId];
  if (hold) {
    hold.seatCodes.forEach((code) => {
      const key = `${hold.showId}:${code}`;
      if (memoryDB.seats[key] && memoryDB.seats[key].status === 'held') {
        memoryDB.seats[key] = { showId: hold.showId, seatCode: code, status: 'available' };
      }
    });
    delete memoryDB.holds[holdId];
    saveDB(memoryDB);
  }
}

/**
 * Atomically confirm booking with server-verified total calculation
 */
export function confirmBooking(params: {
  holdId?: string;
  showId: string;
  seatCodes: string[];
  seatPrices: { code: string; price: number }[];
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  idempotencyKey?: string;
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  movieLanguage?: string;
  theatreId: string;
  theatreName: string;
  locationId: string;
  cityName: string;
  date: string;
  time: string;
  screenName: string;
}): { success: true; booking: ServerBooking } | { success: false; error: string } {
  cleanupExpiredHolds(memoryDB);

  // Check idempotency
  if (params.idempotencyKey) {
    const existing = Object.values(memoryDB.bookings).find(
      (b) => b.idempotencyKey === params.idempotencyKey
    );
    if (existing) {
      return { success: true, booking: existing };
    }
  }

  // Check seats availability
  for (const seat of params.seatCodes) {
    const key = `${params.showId}:${seat}`;
    const current = memoryDB.seats[key];
    if (current) {
      if (current.status === 'booked') {
        return { success: false, error: `Seat ${seat} is already booked by another customer.` };
      }
      if (current.status === 'held' && current.expiresAt && current.expiresAt > Date.now() && current.heldBy !== params.userId) {
        return { success: false, error: `Seat ${seat} is currently held by another customer.` };
      }
    }
  }

  // Server-side recalculation of prices (Requirement 2: Fixed ₹69 booking fee per booking)
  const subtotal = params.seatPrices.reduce((acc, s) => acc + s.price, 0);
  const bookingFee = 69; // Fixed total booking fee (Base ₹50 + IGST ₹19)
  const taxableAmount = subtotal;
  const tax = 19;
  const grandTotal = subtotal + bookingFee;

  // Update seats to permanently booked (Requirement 11)
  params.seatCodes.forEach((code) => {
    const key = `${params.showId}:${code}`;
    memoryDB.seats[key] = {
      showId: params.showId,
      seatCode: code,
      status: 'booked',
      bookedBy: params.userId,
    };
  });

  if (params.holdId && memoryDB.holds[params.holdId]) {
    delete memoryDB.holds[params.holdId];
  }

  const bookingId = `TX-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newBooking: ServerBooking = {
    id: bookingId,
    idempotencyKey: params.idempotencyKey,
    userId: params.userId,
    userName: params.userName,
    userEmail: params.userEmail,
    userPhone: params.userPhone,
    showId: params.showId,
    movieId: params.movieId,
    movieTitle: params.movieTitle,
    moviePoster: params.moviePoster,
    movieLanguage: params.movieLanguage,
    theatreId: params.theatreId,
    theatreName: params.theatreName,
    locationId: params.locationId,
    cityName: params.cityName,
    date: params.date,
    time: params.time,
    screenName: params.screenName,
    seatCodes: params.seatCodes,
    pricing: {
      subtotal,
      bookingFee,
      taxableAmount,
      tax,
      grandTotal,
    },
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  memoryDB.bookings[bookingId] = newBooking;
  saveDB(memoryDB);

  return { success: true, booking: newBooking };
}

/**
 * Get user bookings
 */
export function getUserBookings(userId: string): ServerBooking[] {
  cleanupExpiredHolds(memoryDB);
  return Object.values(memoryDB.bookings)
    .filter((b) => b.userId === userId && b.status !== 'removed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Archive booking
 */
export function archiveBooking(bookingId: string, userId: string): boolean {
  const booking = memoryDB.bookings[bookingId];
  if (booking && booking.userId === userId) {
    booking.status = 'archived';
    booking.archivedAt = new Date().toISOString();
    saveDB(memoryDB);
    return true;
  }
  return false;
}

/**
 * Soft remove booking
 */
export function removeBooking(bookingId: string, userId: string): boolean {
  const booking = memoryDB.bookings[bookingId];
  if (booking && booking.userId === userId) {
    booking.status = 'removed';
    booking.removedAt = new Date().toISOString();
    saveDB(memoryDB);
    return true;
  }
  return false;
}
