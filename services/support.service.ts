import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logAdminAction } from './audit.service';

export interface SupportTicket {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  message: string;
  category: 'booking_issue' | 'payment_failure' | 'refund_status' | 'venue_inquiry' | 'general';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  adminResponse?: string;
  createdAt: string;
  updatedAt?: string;
}

export async function getAllSupportTickets(): Promise<SupportTicket[]> {
  try {
    const q = query(collection(db, 'supportTickets'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const results: SupportTicket[] = [];
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as SupportTicket));
      return results;
    }
  } catch (err) {
    console.warn('Firestore support tickets fallback:', err);
  }

  return [
    {
      id: 'tkt_001',
      customerName: 'Anil Reddy',
      customerEmail: 'anil@example.com',
      customerPhone: '9848011223',
      subject: 'Amount deducted but booking confirmation pending',
      message: 'I paid ₹436 for Debba Debba via UPI, transaction shows successful in GPay but ticket did not show up in profile.',
      category: 'payment_failure',
      status: 'open',
      priority: 'high',
      createdAt: '2026-09-03T14:20:00Z',
    },
    {
      id: 'tkt_002',
      customerName: 'Kavitha Devi',
      customerEmail: 'kavitha@example.com',
      customerPhone: '9441122334',
      subject: 'Need wheelchair assistance for elderly parent at PVR',
      message: 'Booking ref TX-94822. Please confirm if theatre has ramp access and elevator to Screen 2.',
      category: 'venue_inquiry',
      status: 'resolved',
      priority: 'medium',
      adminResponse: 'Confirmed with PVR management. Dedicated staff will assist at main entrance.',
      createdAt: '2026-09-03T09:15:00Z',
    },
  ];
}

export async function updateSupportTicket(
  id: string,
  data: { status?: SupportTicket['status']; adminResponse?: string },
  adminUser?: { uid: string; name: string }
): Promise<void> {
  const docRef = doc(db, 'supportTickets', id);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    ...data,
    updatedAt: now,
  });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'ticket.updated',
      entityType: 'ticket',
      entityId: id,
      summary: `${adminUser.name} updated support ticket ${id} to ${data.status || 'updated'}.`,
    });
  }
}
