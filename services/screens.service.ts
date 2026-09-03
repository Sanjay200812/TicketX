import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logAdminAction } from './audit.service';

export interface AdminScreen {
  id: string;
  theatreId: string;
  theatreName?: string;
  name: string;
  capacity: number;
  seatLayoutId?: string;
  screenType: '2D' | '3D' | 'IMAX' | '4DX' | 'Dolby Cinema' | 'Standard';
  projectionType?: '4K Barco Laser' | '4K Laser' | '2K Digital' | 'Standard';
  soundType?: 'Dolby Atmos' | '7.1 DTS Surround' | '5.1 Dolby' | 'Standard';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function getScreensForTheatre(theatreId: string): Promise<AdminScreen[]> {
  try {
    const q = query(collection(db, 'screens'), where('theatreId', '==', theatreId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const results: AdminScreen[] = [];
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as AdminScreen));
      return results;
    }
  } catch (err) {
    console.warn('Firestore screens read fallback:', err);
  }

  // Fallback defaults: Screen 1 & Screen 2
  return [
    {
      id: `${theatreId}-screen-1`,
      theatreId,
      name: 'Screen 1 (Main Auditorium)',
      capacity: 320,
      screenType: '2D',
      projectionType: '4K Barco Laser',
      soundType: 'Dolby Atmos',
      isActive: true,
      seatLayoutId: theatreId,
    },
    {
      id: `${theatreId}-screen-2`,
      theatreId,
      name: 'Screen 2',
      capacity: 180,
      screenType: '2D',
      projectionType: '2K Digital',
      soundType: '7.1 DTS Surround',
      isActive: true,
      seatLayoutId: theatreId,
    },
  ];
}

export async function getAllScreens(): Promise<AdminScreen[]> {
  try {
    const snap = await getDocs(collection(db, 'screens'));
    if (!snap.empty) {
      const results: AdminScreen[] = [];
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as AdminScreen));
      return results;
    }
  } catch (err) {
    console.warn('Firestore all screens read fallback:', err);
  }
  return [];
}

export async function saveScreen(
  screenData: AdminScreen,
  adminUser?: { uid: string; name: string }
): Promise<string> {
  const id =
    screenData.id ||
    `${screenData.theatreId}-${screenData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  const now = new Date().toISOString();
  const record: AdminScreen = {
    ...screenData,
    id,
    updatedAt: now,
    createdAt: screenData.createdAt || now,
  };

  const docRef = doc(db, 'screens', id);
  await setDoc(docRef, record, { merge: true });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'screen.saved',
      entityType: 'screen',
      entityId: id,
      summary: `${adminUser.name} saved screen "${record.name}" for theatre "${record.theatreId}".`,
      newData: record,
    });
  }

  return id;
}

export async function deleteScreen(
  id: string,
  name: string,
  adminUser?: { uid: string; name: string }
): Promise<boolean> {
  const docRef = doc(db, 'screens', id);
  await deleteDoc(docRef);

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'screen.deleted',
      entityType: 'screen',
      entityId: id,
      summary: `${adminUser.name} deleted screen "${name}".`,
    });
  }

  return true;
}
