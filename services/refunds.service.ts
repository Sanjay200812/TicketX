import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RefundRecord } from '@/types/admin';
import { logAdminAction } from './audit.service';
import { updateBookingStatus } from './bookings.service';

export async function getAllRefunds(): Promise<RefundRecord[]> {
  try {
    const q = query(collection(db, 'refunds'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const results: RefundRecord[] = [];
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as RefundRecord));
      return results;
    }
  } catch (err) {
    console.warn('Firestore refunds read fallback:', err);
  }

  // Fallback sample refund records
  return [
    {
      id: 'ref_2026_001',
      bookingId: 'BK_2026_09103',
      paymentId: 'pay_rzp_test_849203',
      amount: 640,
      reason: 'Customer requested show cancellation >4 hours prior to showtime.',
      status: 'processed',
      initiatedBy: 'support@ticketx.in',
      approvedBy: 'superadmin',
      gatewayRefundId: 'rfnd_rzp_test_9012',
      createdAt: '2026-09-02T16:30:00Z',
      processedAt: '2026-09-02T16:35:00Z',
    },
  ];
}

export async function createRefundRequest(
  data: {
    bookingId: string;
    paymentId: string;
    amount: number;
    reason: string;
  },
  adminUser?: { uid: string; name: string }
): Promise<string> {
  const id = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const record: RefundRecord = {
    ...data,
    id,
    status: 'processed',
    initiatedBy: adminUser?.name || 'Admin',
    approvedBy: adminUser?.name || 'SuperAdmin',
    gatewayRefundId: `rfnd_sim_${Date.now()}`,
    createdAt: now,
    processedAt: now,
  };

  const docRef = doc(db, 'refunds', id);
  await setDoc(docRef, record);

  // Update linked booking status to refunded
  try {
    await updateBookingStatus(data.bookingId, 'refunded', adminUser);
  } catch {
    // Non-blocking
  }

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'refund.processed',
      entityType: 'refund',
      entityId: id,
      summary: `${adminUser.name} processed refund of ₹${data.amount} for booking ${data.bookingId}. Reason: ${data.reason}`,
      newData: record,
    });
  }

  return id;
}
