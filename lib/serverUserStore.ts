import fs from 'fs';
import path from 'path';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface CustomerProfile {
  id: string;
  uid: string;
  name: string;
  phone: string;
  phoneNumber?: string;
  phoneVerified: boolean;
  email?: string;
  gender?: string;
  dob?: string;
  photoURL?: string;
  status: 'active' | 'suspended' | 'disabled';
  createdAt: string;
  lastLoginAt: string;
  lastActiveAt: string;
  loginCount: number;
  totalBookings: number;
  totalSpent: number;
}

const USERS_DB_PATH = path.join(process.cwd(), '.next', 'ticketx_users.json');

const defaultCustomers: CustomerProfile[] = [
  {
    id: 'usr_sanjay_2718',
    uid: 'usr_sanjay_2718',
    name: 'Sanjay Kumar',
    phone: '+919876543210',
    phoneNumber: '+919876543210',
    phoneVerified: true,
    email: 'sanjay@example.com',
    gender: 'Male',
    dob: '1998-05-14',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    lastLoginAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    loginCount: 14,
    totalBookings: 6,
    totalSpent: 2640,
  },
  {
    id: 'usr_priya_092',
    uid: 'usr_priya_092',
    name: 'Priya Sharma',
    phone: '+919848022338',
    phoneNumber: '+919848022338',
    phoneVerified: true,
    gender: 'Female',
    dob: '2001-09-22',
    status: 'active',
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    lastLoginAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    loginCount: 5,
    totalBookings: 3,
    totalSpent: 1350,
  },
  {
    id: 'usr_varun_411',
    uid: 'usr_varun_411',
    name: 'Varun Teja',
    phone: '+919440112233',
    phoneNumber: '+919440112233',
    phoneVerified: true,
    gender: 'Male',
    dob: '1995-12-03',
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    lastLoginAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    loginCount: 2,
    totalBookings: 1,
    totalSpent: 520,
  },
];

function loadUsersDB(): CustomerProfile[] {
  try {
    if (fs.existsSync(USERS_DB_PATH)) {
      const raw = fs.readFileSync(USERS_DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}
  return [...defaultCustomers];
}

function saveUsersDB(list: CustomerProfile[]) {
  try {
    const dir = path.dirname(USERS_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch {}
}

const memoryCustomers: CustomerProfile[] = loadUsersDB();

export async function recordCustomerLoginEvent(params: {
  uid: string;
  name?: string;
  phone: string;
  isNewUser: boolean;
  dob?: string;
  gender?: string;
}): Promise<CustomerProfile> {
  const now = new Date().toISOString();
  const existingIdx = memoryCustomers.findIndex((c) => c.uid === params.uid || c.id === params.uid);

  let updatedProfile: CustomerProfile;

  if (existingIdx >= 0) {
    const prev = memoryCustomers[existingIdx];
    updatedProfile = {
      ...prev,
      name: params.name || prev.name,
      phone: params.phone || prev.phone,
      phoneNumber: params.phone || prev.phoneNumber,
      lastLoginAt: now,
      lastActiveAt: now,
      loginCount: (prev.loginCount || 0) + 1,
      dob: params.dob || prev.dob,
      gender: params.gender || prev.gender,
    };
    memoryCustomers[existingIdx] = updatedProfile;
  } else {
    updatedProfile = {
      id: params.uid,
      uid: params.uid,
      name: params.name || 'New Customer',
      phone: params.phone,
      phoneNumber: params.phone,
      phoneVerified: true,
      gender: params.gender || 'Prefer not to say',
      dob: params.dob,
      status: 'active',
      createdAt: now,
      lastLoginAt: now,
      lastActiveAt: now,
      loginCount: 1,
      totalBookings: 0,
      totalSpent: 0,
    };
    memoryCustomers.unshift(updatedProfile);
  }

  saveUsersDB(memoryCustomers);

  // Attempt Firestore sync (non-blocking)
  try {
    const docRef = doc(db, 'users', params.uid);
    setDoc(
      docRef,
      {
        uid: params.uid,
        name: updatedProfile.name,
        phoneNumber: updatedProfile.phone,
        phoneVerified: true,
        lastLoginAt: now,
        lastActiveAt: now,
        loginCount: updatedProfile.loginCount,
        status: updatedProfile.status,
        updatedAt: now,
        ...(params.isNewUser ? { createdAt: now } : {}),
      },
      { merge: true }
    ).catch(() => {});
  } catch {}

  return updatedProfile;
}

export function getAllStoredCustomers(): CustomerProfile[] {
  return [...loadUsersDB()];
}

export function getStoredCustomerByUid(uid: string): CustomerProfile | null {
  const current = loadUsersDB();
  const found = current.find((c) => c.uid === uid || c.id === uid);
  return found ? { ...found } : null;
}

export function updateStoredCustomerStatus(uid: string, status: 'active' | 'suspended' | 'disabled'): boolean {
  const current = loadUsersDB();
  const idx = current.findIndex((c) => c.uid === uid || c.id === uid);
  if (idx >= 0) {
    current[idx].status = status;
    saveUsersDB(current);
    try {
      updateDoc(doc(db, 'users', uid), { status, updatedAt: new Date().toISOString() }).catch(() => {});
    } catch {}
    return true;
  }
  return false;
}

export function getCustomerMetrics() {
  const current = loadUsersDB();
  const total = current.length;
  const nowMs = Date.now();
  const dayMs = 24 * 3600 * 1000;
  const weekMs = 7 * dayMs;

  const newToday = current.filter((c) => nowMs - new Date(c.createdAt).getTime() <= dayMs).length;
  const newThisWeek = current.filter((c) => nowMs - new Date(c.createdAt).getTime() <= weekMs).length;
  const activeNow = current.filter((c) => nowMs - new Date(c.lastActiveAt).getTime() <= 5 * 60 * 1000).length;
  const activeToday = current.filter((c) => nowMs - new Date(c.lastActiveAt).getTime() <= dayMs).length;

  return {
    total,
    newToday,
    newThisWeek,
    activeNow,
    activeToday,
  };
}
