import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logAdminAction } from './audit.service';
import { saveTheatre } from './theatres.service';

export interface VenueApplication {
  id: string;
  theatreName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  screensCount: number;
  seatingCapacity: number;
  facilities?: string[];
  formats?: string[];
  seatingPlanUrl?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function submitVenueApplication(
  data: Omit<VenueApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = `venue_app_${Date.now()}`;
  const now = new Date().toISOString();

  const record: VenueApplication = {
    ...data,
    id,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  const docRef = doc(db, 'venueApplications', id);
  await setDoc(docRef, record);
  return id;
}

export async function getAllVenueApplications(): Promise<VenueApplication[]> {
  try {
    const q = query(collection(db, 'venueApplications'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const results: VenueApplication[] = [];
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as VenueApplication));
      return results;
    }
  } catch (err) {
    console.warn('Firestore venue applications lookup fallback:', err);
  }
  return [];
}

export async function updateVenueApplicationStatus(
  id: string,
  status: VenueApplication['status'],
  notes?: string,
  adminUser?: { uid: string; name: string }
): Promise<void> {
  const docRef = doc(db, 'venueApplications', id);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    status,
    adminNotes: notes || '',
    updatedAt: now,
  });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'venue_application.status_changed',
      entityType: 'venue_application',
      entityId: id,
      summary: `${adminUser.name} changed venue application ${id} status to ${status}.`,
      newData: { status, notes },
    });
  }
}

export async function approveAndOnboardVenue(
  app: VenueApplication,
  adminUser?: { uid: string; name: string }
): Promise<string> {
  // 1. Create theatre entry
  const theatreId = await saveTheatre(
    {
      id: app.theatreName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: app.theatreName,
      locationId: app.city.toLowerCase().replace(/[^a-z0-9]+/g, ''),
      area: app.address,
      address: app.address,
      status: 'available',
      facilities: app.facilities || ['Air Conditioned', 'Snack Bar', 'Parking'],
      format: app.formats || ['2D', '4K'],
      contactNumber: app.phone,
      email: app.email,
    },
    adminUser
  );

  // 2. Mark application approved
  await updateVenueApplicationStatus(app.id, 'approved', `Approved and onboarded as theatre ID: ${theatreId}`, adminUser);

  return theatreId;
}
