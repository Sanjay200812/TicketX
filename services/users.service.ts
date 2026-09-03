import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminUser, AdminRole } from '@/types/admin';
import { logAdminAction } from './audit.service';

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  dob?: string;
  isBlocked?: boolean;
  totalBookings?: number;
  totalSpent?: number;
  createdAt?: string;
}

export async function getAllCustomers(): Promise<CustomerUser[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (!snap.empty) {
      const results: CustomerUser[] = [];
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as CustomerUser));
      return results;
    }
  } catch (err) {
    console.warn('Firestore users lookup fallback:', err);
  }

  // Fallback demo users
  return [
    {
      id: 'usr_001',
      name: 'Sanjay Kumar',
      email: 'sanjay@example.com',
      phone: '9876543210',
      gender: 'Male',
      totalBookings: 6,
      totalSpent: 2616,
      isBlocked: false,
      createdAt: '2026-08-15T12:00:00Z',
    },
    {
      id: 'usr_002',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9848022338',
      gender: 'Female',
      totalBookings: 3,
      totalSpent: 1485,
      isBlocked: false,
      createdAt: '2026-08-20T14:30:00Z',
    },
    {
      id: 'usr_003',
      name: 'Ramesh Babu',
      email: 'ramesh@example.com',
      phone: '9440112233',
      gender: 'Male',
      totalBookings: 1,
      totalSpent: 640,
      isBlocked: false,
      createdAt: '2026-08-25T09:10:00Z',
    },
  ];
}

export async function toggleCustomerBlock(
  userId: string,
  isBlocked: boolean,
  userName: string,
  adminUser?: { uid: string; name: string }
): Promise<void> {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, { isBlocked, updatedAt: new Date().toISOString() });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: isBlocked ? 'user.blocked' : 'user.unblocked',
      entityType: 'user',
      entityId: userId,
      summary: `${adminUser.name} ${isBlocked ? 'suspended' : 'reactivated'} customer account "${userName}".`,
    });
  }
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  try {
    const snap = await getDocs(collection(db, 'adminUsers'));
    if (!snap.empty) {
      const results: AdminUser[] = [];
      snap.forEach((d) => results.push({ ...d.data(), uid: d.id } as AdminUser));
      return results;
    }
  } catch (err) {
    console.warn('Firestore adminUsers lookup fallback:', err);
  }

  // Fallback default super admin
  return [
    {
      uid: 'admin_primary_bootstrap',
      email: 'sanjay@ticketx.in',
      name: 'Sanjay Kumar (Primary)',
      role: 'super_admin',
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function saveAdmin(
  adminData: AdminUser,
  adminUser?: { uid: string; name: string }
): Promise<void> {
  const uid = adminData.uid || `adm_${Date.now()}`;
  const now = new Date().toISOString();

  const record: AdminUser = {
    ...adminData,
    uid,
    createdAt: adminData.createdAt || now,
  };

  const docRef = doc(db, 'adminUsers', uid);
  await setDoc(docRef, record, { merge: true });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'admin.saved',
      entityType: 'admin_user',
      entityId: uid,
      summary: `${adminUser.name} configured admin account for "${record.name}" (${record.role}).`,
      newData: { role: record.role, email: record.email },
    });
  }
}

export async function deleteAdminUser(
  uid: string,
  name: string,
  adminUser?: { uid: string; name: string }
): Promise<void> {
  const docRef = doc(db, 'adminUsers', uid);
  await deleteDoc(docRef);

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'admin.deleted',
      entityType: 'admin_user',
      entityId: uid,
      summary: `${adminUser.name} revoked administrator privileges for "${name}".`,
    });
  }
}
