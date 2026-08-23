import { Booking } from '../types/booking';
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, query, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { removeUndefined } from '@/context/AuthContext';

// Account-scoped cache keys (Requirements 6, 7, 27, 30)
function getCacheKey(accountKey: string): string {
  if (!accountKey) return 'ticketx:guest:bookings';
  if (accountKey.startsWith('phone:')) {
    return `ticketx:${accountKey}:bookings`;
  }
  if (accountKey.startsWith('firebase:')) {
    return `ticketx:${accountKey}:bookings`;
  }
  return `ticketx:firebase:${accountKey}:bookings`;
}

function getFirestoreUid(accountKey: string): string | null {
  if (!accountKey || accountKey.startsWith('phone:')) return null;
  if (accountKey.startsWith('firebase:')) return accountKey.replace('firebase:', '');
  return accountKey;
}

export const saveBookingForUser = async (accountKey: string, booking: Booking): Promise<void> => {
  if (!accountKey) return;

  const uid = getFirestoreUid(accountKey);

  if (uid) {
    const userBookingDoc = doc(db, 'users', uid, 'bookings', booking.id);
    const dataToSave = removeUndefined({
      ...booking,
      userId: accountKey,
      archived: booking.archived || false,
      createdAt: booking.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    try {
      await setDoc(userBookingDoc, dataToSave, { merge: true });
    } catch (err) {
      console.error('Firestore save booking error:', err);
    }
  }

  // Update account-scoped local cache
  if (typeof window !== 'undefined') {
    const cacheKey = getCacheKey(accountKey);
    const existing = getUserBookingsLocal(accountKey);
    const filtered = existing.filter((b) => b.id !== booking.id);
    filtered.unshift(booking);
    localStorage.setItem(cacheKey, JSON.stringify(filtered));
  }
};

export const getUserBookingsLocal = (accountKey: string): Booking[] => {
  if (typeof window !== 'undefined' && accountKey) {
    const stored = localStorage.getItem(getCacheKey(accountKey));
    return stored ? JSON.parse(stored) : [];
  }
  return [];
};

export const subscribeUserBookings = (
  accountKey: string,
  onUpdate: (bookings: Booking[]) => void
): Unsubscribe | null => {
  if (!accountKey) {
    onUpdate([]);
    return null;
  }

  const uid = getFirestoreUid(accountKey);

  if (!uid) {
    // Demo phone user: Return local account-scoped bookings
    onUpdate(getUserBookingsLocal(accountKey));
    return null;
  }

  try {
    const bookingsRef = collection(db, 'users', uid, 'bookings');
    const q = query(bookingsRef);

    return onSnapshot(
      q,
      (snapshot) => {
        const bookings: Booking[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: d.id || docSnap.id,
            userId: accountKey,
            movieId: d.movieId,
            movieTitle: d.movieTitle,
            moviePoster: d.moviePoster,
            movieLanguage: d.movieLanguage,
            locationId: d.locationId,
            theatreId: d.theatreId,
            theatre: d.theatre || d.theatreName,
            screen: d.screen || d.screenName,
            date: d.date,
            time: d.time,
            seats: d.seats || [],
            seatDetails: d.seatDetails,
            ticketCount: d.ticketCount || (d.seats ? d.seats.length : 0),
            subtotal: d.subtotal || 0,
            convenienceFee: d.convenienceFee || 0,
            total: d.total || 0,
            archived: Boolean(d.archived),
            status: d.status || (d.archived ? 'past' : 'upcoming'),
            bookingDate: d.bookingDate || d.createdAt || new Date().toISOString(),
          };
        });

        // Sort latest first
        bookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

        // Update local cache
        if (typeof window !== 'undefined') {
          localStorage.setItem(getCacheKey(accountKey), JSON.stringify(bookings));
        }

        onUpdate(bookings);
      },
      (error) => {
        console.error('Error listening to user bookings:', error);
        onUpdate(getUserBookingsLocal(accountKey));
      }
    );
  } catch (err) {
    console.error('Failed to setup Firestore listener:', err);
    onUpdate(getUserBookingsLocal(accountKey));
    return null;
  }
};

export const archiveUserBooking = async (accountKey: string, bookingId: string, archiveStatus: boolean): Promise<void> => {
  if (!accountKey || !bookingId) return;

  const uid = getFirestoreUid(accountKey);

  if (uid) {
    try {
      const bookingDoc = doc(db, 'users', uid, 'bookings', bookingId);
      await setDoc(
        bookingDoc,
        removeUndefined({
          archived: archiveStatus,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
    } catch (err) {
      console.error('Error updating archive status in Firestore:', err);
    }
  }

  // Update account-scoped local cache
  if (typeof window !== 'undefined') {
    const cacheKey = getCacheKey(accountKey);
    const cached = getUserBookingsLocal(accountKey);
    const updated = cached.map((b) => (b.id === bookingId ? { ...b, archived: archiveStatus } : b));
    localStorage.setItem(cacheKey, JSON.stringify(updated));
  }
};

export const deleteUserBooking = async (accountKey: string, bookingId: string): Promise<void> => {
  if (!accountKey || !bookingId) return;

  const uid = getFirestoreUid(accountKey);

  if (uid) {
    try {
      const bookingDoc = doc(db, 'users', uid, 'bookings', bookingId);
      await deleteDoc(bookingDoc);
    } catch (err) {
      console.error('Error deleting booking in Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const cacheKey = getCacheKey(accountKey);
    const cached = getUserBookingsLocal(accountKey);
    const updated = cached.filter((b) => b.id !== bookingId);
    localStorage.setItem(cacheKey, JSON.stringify(updated));
  }
};

export const saveBooking = (booking: Booking): void => {
  if (booking.userId) {
    saveBookingForUser(booking.userId, booking);
  }
};

export const getBookings = (): Booking[] => {
  return [];
};
