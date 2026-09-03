import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logAdminAction } from './audit.service';

export interface AdminBooking {
  id: string;
  bookingRef: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  movieId: string;
  movieTitle: string;
  theatreId: string;
  theatreName: string;
  screenName: string;
  showDate: string;
  showTime: string;
  seats: string[]; // e.g. ['A01', 'A02']
  seatCategory?: string;
  totalAmount: number;
  paymentId?: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  status: 'confirmed' | 'cancelled' | 'refunded' | 'expired';
  createdAt: string;
  updatedAt?: string;
}

export async function getAllBookings(filters?: {
  status?: string;
  date?: string;
  movieId?: string;
}): Promise<AdminBooking[]> {
  try {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      let results: AdminBooking[] = [];
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as AdminBooking));

      if (filters?.status) results = results.filter((b) => b.status === filters.status);
      if (filters?.date) results = results.filter((b) => b.showDate === filters.date);
      if (filters?.movieId) results = results.filter((b) => b.movieId === filters.movieId);

      return results;
    }
  } catch (err) {
    console.warn('Firestore bookings lookup fallback to sample records:', err);
  }

  // Fallback sample bookings for demonstration
  return [
    {
      id: 'BK_2026_09101',
      bookingRef: 'TX-94821',
      customerName: 'Sanjay Kumar',
      customerEmail: 'sanjay@example.com',
      customerPhone: '9876543210',
      movieId: 'debba-debba',
      movieTitle: 'Debba Debba',
      theatreId: 'plateno-cinemas',
      theatreName: 'Plateno Cinemas Dolby Atmos',
      screenName: 'Screen 1',
      showDate: '2026-09-10',
      showTime: '06:30 PM',
      seats: ['D08', 'D09'],
      seatCategory: 'Gold Class',
      totalAmount: 436,
      paymentId: 'pay_rzp_test_849201',
      paymentStatus: 'paid',
      status: 'confirmed',
      createdAt: '2026-09-03T10:15:00Z',
    },
    {
      id: 'BK_2026_09102',
      bookingRef: 'TX-94822',
      customerName: 'Priya Sharma',
      customerEmail: 'priya@example.com',
      customerPhone: '9848022338',
      movieId: 'irumudi',
      movieTitle: 'Irumudi',
      theatreId: 'pvr-guntur',
      theatreName: 'PVR Cinemas Guntur',
      screenName: 'Screen 2',
      showDate: '2026-09-10',
      showTime: '02:30 PM',
      seats: ['C04', 'C05', 'C06'],
      seatCategory: 'Silver Class',
      totalAmount: 495,
      paymentId: 'pay_rzp_test_849202',
      paymentStatus: 'paid',
      status: 'confirmed',
      createdAt: '2026-09-03T11:45:00Z',
    },
    {
      id: 'BK_2026_09103',
      bookingRef: 'TX-94823',
      customerName: 'Ramesh Babu',
      customerEmail: 'ramesh@example.com',
      customerPhone: '9440112233',
      movieId: 'og',
      movieTitle: 'OG',
      theatreId: 'cinepolis-vijayawada',
      theatreName: 'Cinepolis Cinemas',
      screenName: 'Audi 1',
      showDate: '2026-09-11',
      showTime: '10:00 PM',
      seats: ['A01', 'A02'],
      seatCategory: 'Recliner Luxury',
      totalAmount: 640,
      paymentId: 'pay_rzp_test_849203',
      paymentStatus: 'refunded',
      status: 'refunded',
      createdAt: '2026-09-02T16:20:00Z',
    },
  ];
}

export async function updateBookingStatus(
  id: string,
  status: AdminBooking['status'],
  adminUser?: { uid: string; name: string }
): Promise<void> {
  const docRef = doc(db, 'bookings', id);
  await updateDoc(docRef, {
    status,
    updatedAt: new Date().toISOString(),
  });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'booking.status_updated',
      entityType: 'booking',
      entityId: id,
      summary: `${adminUser.name} changed booking ${id} status to ${status}.`,
      newData: { status },
    });
  }
}
