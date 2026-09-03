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
import { Coupon } from '@/types/admin';
import { logAdminAction } from './audit.service';

export async function getAllCoupons(): Promise<Coupon[]> {
  try {
    const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const results: Coupon[] = [];
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as Coupon));
      return results;
    }
  } catch (err) {
    console.warn('Firestore coupons fallback:', err);
  }

  // Fallback demo coupon
  return [
    {
      id: 'cpn_001',
      code: 'WELCOME50',
      description: 'Flat ₹50 off on your first Telugu movie booking',
      discountType: 'flat',
      discountAmount: 50,
      minBookingAmount: 200,
      validUntil: '2026-12-31',
      usageLimit: 1000,
      usageCount: 42,
      status: 'active',
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'cpn_002',
      code: 'BLOCKBUSTER20',
      description: '20% off up to ₹100 on weekend screenings',
      discountType: 'percentage',
      discountAmount: 20,
      minBookingAmount: 300,
      maxDiscount: 100,
      validUntil: '2026-10-31',
      usageLimit: 500,
      usageCount: 128,
      status: 'active',
      createdAt: '2026-08-10T00:00:00Z',
    },
  ];
}

export async function saveCoupon(
  coupon: Coupon,
  adminUser?: { uid: string; name: string }
): Promise<string> {
  const id = coupon.id || `cpn_${coupon.code.toUpperCase()}`;
  const now = new Date().toISOString();

  const record: Coupon = {
    ...coupon,
    id,
    code: coupon.code.toUpperCase(),
    usageCount: coupon.usageCount || 0,
    createdAt: coupon.createdAt || now,
  };

  const docRef = doc(db, 'coupons', id);
  await setDoc(docRef, record, { merge: true });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'coupon.saved',
      entityType: 'coupon',
      entityId: id,
      summary: `${adminUser.name} configured coupon code "${record.code}" (${record.discountType === 'flat' ? `₹${record.discountAmount}` : `${record.discountAmount}%`}).`,
      newData: record,
    });
  }

  return id;
}

export async function deleteCoupon(
  id: string,
  code: string,
  adminUser?: { uid: string; name: string }
): Promise<void> {
  const docRef = doc(db, 'coupons', id);
  await deleteDoc(docRef);

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'coupon.deleted',
      entityType: 'coupon',
      entityId: id,
      summary: `${adminUser.name} deleted coupon code "${code}".`,
    });
  }
}
