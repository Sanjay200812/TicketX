import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SystemSettings } from '@/types/admin';
import { logAdminAction } from './audit.service';

import { movies as staticMovies } from '@/data/movies';
import { theatres as staticTheatres } from '@/data/theatres';
import { shows as staticShows } from '@/data/shows';
import { locations as staticLocations } from '@/data/locations';
import { events as staticEvents } from '@/data/events';
import { seatLayoutsList as staticLayouts } from '@/data/seatLayouts';

import { saveMovie } from './movies.service';
import { saveTheatre } from './theatres.service';
import { saveShow } from './shows.service';
import { saveLocation } from './locations.service';
import { saveEvent } from './events.service';
import { saveSeatLayout } from './seatLayouts.service';

export const DEFAULT_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  maintenanceMessage: 'TicketX is undergoing scheduled cinema maintenance. We will be back online shortly!',
  platformFee: 20,
  taxPercentage: 18,
  supportEmail: 'support@ticketx.in',
  supportPhone: '+91 863 2233445',
  updatedAt: new Date().toISOString(),
};

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const docRef = doc(db, 'systemSettings', 'general');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SystemSettings;
    }
  } catch (err) {
    console.warn('Firestore settings fallback:', err);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSystemSettings(
  settings: SystemSettings,
  adminUser?: { uid: string; name: string }
): Promise<void> {
  const docRef = doc(db, 'systemSettings', 'general');
  const record: SystemSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, record, { merge: true });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'settings.updated',
      entityType: 'settings',
      entityId: 'general',
      summary: `${adminUser.name} updated system operational settings (Fee: ₹${settings.platformFee}, Maintenance: ${settings.maintenanceMode ? 'ON' : 'OFF'}).`,
      newData: record,
    });
  }
}

export interface SeedReport {
  movies: number;
  theatres: number;
  shows: number;
  locations: number;
  events: number;
  seatLayouts: number;
  durationMs: number;
}

/**
 * One-Click Migration Tool:
 * Copies all static TypeScript definitions into live Firestore collections so admin can manage them immediately.
 */
export async function seedStaticDataToFirestore(
  adminUser?: { uid: string; name: string }
): Promise<SeedReport> {
  const startTime = Date.now();
  const report: SeedReport = {
    movies: 0,
    theatres: 0,
    shows: 0,
    locations: 0,
    events: 0,
    seatLayouts: 0,
    durationMs: 0,
  };

  // 1. Seed Locations
  for (const loc of staticLocations) {
    await saveLocation({
      id: loc.id,
      name: loc.name,
      shortName: loc.shortName,
      state: loc.state,
      country: loc.country,
      bookingEnabled: loc.bookingEnabled,
      isPopular: loc.isPopular,
      isEventOnly: loc.isEventOnly,
    });
    report.locations++;
  }

  // 2. Seed Theatres
  for (const th of staticTheatres) {
    await saveTheatre({
      ...th,
      status: th.status || 'available',
      facilities: th.facilities || ['Air Conditioned', 'Snack Bar', 'Parking'],
      format: th.format || ['2D', '4K'],
    });
    report.theatres++;
  }

  // 3. Seed Movies
  for (const m of staticMovies) {
    await saveMovie({
      ...m,
      status: 'published',
    });
    report.movies++;
  }

  // 4. Seed Shows
  for (const s of staticShows) {
    await saveShow({
      ...s,
      status: 'open',
      categoryPrices: {
        Silver: s.priceOverrides?.premium ? s.priceOverrides.premium - 50 : 150,
        Gold: s.priceOverrides?.gold || 200,
        Recliner: s.priceOverrides?.onLand || 295,
      },
    });
    report.shows++;
  }

  // 5. Seed Events
  for (const ev of staticEvents) {
    await saveEvent({
      ...ev,
      title: ev.name,
      status: 'published',
    });
    report.events++;
  }

  // 6. Seed Seat Layouts
  for (const sl of staticLayouts) {
    await saveSeatLayout({
      ...sl,
      templateName: `${sl.theatreName || sl.theatreId} Standard Layout`,
    });
    report.seatLayouts++;
  }

  report.durationMs = Date.now() - startTime;

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'database.seeded',
      entityType: 'settings',
      summary: `${adminUser.name} executed 1-Click Static-to-Firestore Seed (${report.movies} movies, ${report.theatres} theatres, ${report.shows} shows, ${report.locations} cities, ${report.events} events, ${report.seatLayouts} layouts).`,
      newData: report,
    });
  }

  return report;
}
