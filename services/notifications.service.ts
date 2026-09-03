import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logAdminAction } from './audit.service';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  target: 'all_users' | 'specific_city' | 'theatre_partners';
  targetCity?: string;
  type: 'info' | 'promo' | 'alert' | 'maintenance';
  isActive: boolean;
  createdAt: string;
}

export async function getAllNotifications(): Promise<AdminNotification[]> {
  try {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const results: AdminNotification[] = [];
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as AdminNotification));
      return results;
    }
  } catch (err) {
    console.warn('Firestore notifications read fallback:', err);
  }

  return [
    {
      id: 'notif_001',
      title: 'Advance Booking Open for OG',
      message: 'Grab early bird tickets for the midnight and 4 AM premiere shows across Guntur and Vijayawada.',
      target: 'all_users',
      type: 'promo',
      isActive: true,
      createdAt: '2026-09-02T10:00:00Z',
    },
  ];
}

export async function saveNotification(
  notif: AdminNotification,
  adminUser?: { uid: string; name: string }
): Promise<string> {
  const id = notif.id || `notif_${Date.now()}`;
  const now = new Date().toISOString();

  const record: AdminNotification = {
    ...notif,
    id,
    createdAt: notif.createdAt || now,
  };

  const docRef = doc(db, 'notifications', id);
  await setDoc(docRef, record, { merge: true });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'notification.sent',
      entityType: 'notification',
      entityId: id,
      summary: `${adminUser.name} broadcast notification "${record.title}".`,
      newData: record,
    });
  }

  return id;
}

export async function deleteNotification(
  id: string,
  title: string,
  adminUser?: { uid: string; name: string }
): Promise<void> {
  const docRef = doc(db, 'notifications', id);
  await deleteDoc(docRef);

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'notification.deleted',
      entityType: 'notification',
      entityId: id,
      summary: `${adminUser.name} deleted notification "${title}".`,
    });
  }
}
