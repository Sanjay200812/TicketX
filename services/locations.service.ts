import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TicketXLocation } from '@/types/location';
import { locations as staticLocations } from '@/data/locations';
import { logAdminAction } from './audit.service';

export interface AdminLocationInput extends TicketXLocation {
  displayOrder?: number;
  latitude?: number;
  longitude?: number;
  comingSoon?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllLocations(): Promise<AdminLocationInput[]> {
  try {
    const snap = await getDocs(collection(db, 'locations'));
    if (!snap.empty) {
      const results: AdminLocationInput[] = [];
      snap.forEach((d) => {
        results.push({ ...d.data(), id: d.id } as AdminLocationInput);
      });
      return results.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
  } catch (err) {
    console.warn('Firestore locations read fallback to static data:', err);
  }

  // Fallback to static locations
  return staticLocations.map((loc, idx) => ({
    ...loc,
    displayOrder: idx + 1,
    bookingEnabled: loc.bookingEnabled ?? true,
    isPopular: loc.isPopular ?? false,
    isEventOnly: loc.isEventOnly ?? false,
  }));
}

export async function saveLocation(
  locationData: AdminLocationInput,
  adminUser?: { uid: string; name: string }
): Promise<string> {
  const id = locationData.id || locationData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const now = new Date().toISOString();

  const record: AdminLocationInput = {
    ...locationData,
    id,
    updatedAt: now,
    createdAt: locationData.createdAt || now,
  };

  const docRef = doc(db, 'locations', id);
  await setDoc(docRef, record, { merge: true });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'location.saved',
      entityType: 'location',
      entityId: id,
      summary: `${adminUser.name} updated location "${locationData.name}".`,
      newData: record,
    });
  }

  return id;
}

export async function toggleLocationBooking(
  id: string,
  bookingEnabled: boolean,
  name: string,
  adminUser?: { uid: string; name: string }
): Promise<void> {
  const docRef = doc(db, 'locations', id);
  await updateDoc(docRef, {
    bookingEnabled,
    updatedAt: new Date().toISOString(),
  });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'location.booking_toggled',
      entityType: 'location',
      entityId: id,
      summary: `${adminUser.name} set booking to ${bookingEnabled ? 'ENABLED' : 'DISABLED'} for "${name}".`,
    });
  }
}

export async function deleteLocation(
  id: string,
  name: string,
  adminUser?: { uid: string; name: string }
): Promise<boolean> {
  const docRef = doc(db, 'locations', id);
  await deleteDoc(docRef);

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'location.deleted',
      entityType: 'location',
      entityId: id,
      summary: `${adminUser.name} deleted location "${name}".`,
    });
  }

  return true;
}
