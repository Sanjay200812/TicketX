import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TicketXTheatre } from '@/types/theatre';
import { theatres as staticTheatres } from '@/data/theatres';
import { logAdminAction } from './audit.service';

export interface AdminTheatreInput extends TicketXTheatre {
  contactNumber?: string;
  email?: string;
  logo?: string;
  banner?: string;
  description?: string;
  mapsUrl?: string;
  latitude?: number;
  longitude?: number;
  screensCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllTheatres(): Promise<AdminTheatreInput[]> {
  try {
    const q = query(collection(db, 'theatres'), orderBy('name', 'asc'));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const liveList: AdminTheatreInput[] = [];
      snap.forEach((d) => {
        liveList.push({ ...d.data(), id: d.id } as AdminTheatreInput);
      });
      return liveList;
    }
  } catch (err) {
    console.warn('Firestore theatres read fallback to static data:', err);
  }

  // Fallback to static theatres
  return staticTheatres.map((t) => ({
    ...t,
    status: t.status || 'available',
    facilities: t.facilities || ['Air Conditioned', 'Parking', 'Snack Bar'],
    format: t.format || ['2D', '4K'],
  }));
}

export async function getTheatreById(id: string): Promise<AdminTheatreInput | null> {
  try {
    const docRef = doc(db, 'theatres', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as AdminTheatreInput;
    }
  } catch (err) {
    console.warn('Firestore theatre lookup fallback to static data:', err);
  }

  const staticMatch = staticTheatres.find((t) => t.id === id);
  if (staticMatch) {
    return {
      ...staticMatch,
      status: staticMatch.status || 'available',
      facilities: staticMatch.facilities || ['Air Conditioned', 'Parking', 'Snack Bar'],
      format: staticMatch.format || ['2D', '4K'],
    };
  }

  return null;
}

export async function saveTheatre(
  theatreData: AdminTheatreInput,
  adminUser?: { uid: string; name: string }
): Promise<string> {
  const id =
    theatreData.id ||
    theatreData.slug ||
    theatreData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const now = new Date().toISOString();
  const record: AdminTheatreInput = {
    ...theatreData,
    id,
    slug: theatreData.slug || id,
    updatedAt: now,
    createdAt: theatreData.createdAt || now,
  };

  const docRef = doc(db, 'theatres', id);
  await setDoc(docRef, record, { merge: true });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'theatre.saved',
      entityType: 'theatre',
      entityId: id,
      summary: `${adminUser.name} saved theatre "${record.name}".`,
      newData: record,
    });
  }

  return id;
}

export async function deleteTheatre(
  id: string,
  name: string,
  adminUser?: { uid: string; name: string }
): Promise<boolean> {
  const docRef = doc(db, 'theatres', id);
  await deleteDoc(docRef);

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'theatre.deleted',
      entityType: 'theatre',
      entityId: id,
      summary: `${adminUser.name} deleted theatre "${name}".`,
    });
  }

  return true;
}
