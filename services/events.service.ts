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
import { TicketXEvent } from '@/types/event';
import { events as staticEvents } from '@/data/events';
import { logAdminAction } from './audit.service';

export interface AdminEventInput extends TicketXEvent {
  slug?: string;
  category?: string;
  banner?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  locationId?: string;
  mapsUrl?: string;
  ageRequirement?: string;
  terms?: string;
  cancellationPolicy?: string;
  status?: 'draft' | 'published' | 'archived' | 'completed';
  featured?: boolean;
  ticketTypes?: {
    id: string;
    name: string;
    price: number;
    capacity: number;
    description?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllEvents(): Promise<AdminEventInput[]> {
  try {
    const q = query(collection(db, 'events'), orderBy('name', 'asc'));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const results: AdminEventInput[] = [];
      snap.forEach((d) => {
        results.push({ ...d.data(), id: d.id } as AdminEventInput);
      });
      return results;
    }
  } catch (err) {
    console.warn('Firestore events read fallback to static data:', err);
  }

  // Fallback to static events
  return staticEvents.map((e) => ({
    ...e,
    status: 'published',
    category: e.eventType,
    startDate: e.date,
    startTime: e.time,
    ticketTypes: [
      { id: 't1', name: 'Silver', price: e.pricing.silver, capacity: 200 },
      { id: 't2', name: 'Gold', price: e.pricing.gold, capacity: 150 },
      { id: 't3', name: 'Premium', price: e.pricing.premium, capacity: 50 },
    ],
  }));
}

export async function getEventById(id: string): Promise<AdminEventInput | null> {
  try {
    const docRef = doc(db, 'events', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as AdminEventInput;
    }
  } catch (err) {
    console.warn('Firestore event lookup fallback to static data:', err);
  }

  const staticMatch = staticEvents.find((e) => e.id === id);
  if (staticMatch) {
    return {
      ...staticMatch,
      status: 'published',
      category: staticMatch.eventType,
      startDate: staticMatch.date,
      startTime: staticMatch.time,
      ticketTypes: [
        { id: 't1', name: 'Silver', price: staticMatch.pricing.silver, capacity: 200 },
        { id: 't2', name: 'Gold', price: staticMatch.pricing.gold, capacity: 150 },
        { id: 't3', name: 'Premium', price: staticMatch.pricing.premium, capacity: 50 },
      ],
    };
  }

  return null;
}

export async function saveEvent(
  eventData: AdminEventInput,
  adminUser?: { uid: string; name: string }
): Promise<string> {
  const id =
    eventData.id ||
    eventData.slug ||
    (eventData.title || eventData.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const now = new Date().toISOString();
  const record: AdminEventInput = {
    ...eventData,
    id,
    name: eventData.name || eventData.title,
    title: eventData.title || eventData.name,
    status: eventData.status || 'published',
    updatedAt: now,
    createdAt: eventData.createdAt || now,
  };

  const docRef = doc(db, 'events', id);
  await setDoc(docRef, record, { merge: true });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'event.saved',
      entityType: 'event',
      entityId: id,
      summary: `${adminUser.name} saved event "${record.name}".`,
      newData: record,
    });
  }

  return id;
}

export async function deleteEvent(
  id: string,
  name: string,
  adminUser?: { uid: string; name: string }
): Promise<boolean> {
  const docRef = doc(db, 'events', id);
  await deleteDoc(docRef);

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'event.deleted',
      entityType: 'event',
      entityId: id,
      summary: `${adminUser.name} deleted event "${name}".`,
    });
  }

  return true;
}
