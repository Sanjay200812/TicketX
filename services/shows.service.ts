import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TicketXShow } from '@/types/show';
import { shows as staticShows } from '@/data/shows';
import { logAdminAction } from './audit.service';

export interface AdminShowInput extends TicketXShow {
  status?: 'scheduled' | 'open' | 'paused' | 'sold_out' | 'completed' | 'cancelled';
  movieTitle?: string;
  theatreName?: string;
  screenName?: string;
  categoryPrices?: Record<string, number>; // e.g. { Silver: 150, Gold: 200, Recliner: 295 }
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllShows(filters?: {
  theatreId?: string;
  movieId?: string;
  date?: string;
}): Promise<AdminShowInput[]> {
  try {
    const snap = await getDocs(collection(db, 'shows'));
    if (!snap.empty) {
      let results: AdminShowInput[] = [];
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as AdminShowInput));

      if (filters?.theatreId) {
        results = results.filter((s) => s.theatreId === filters.theatreId);
      }
      if (filters?.movieId) {
        results = results.filter((s) => s.movieId === filters.movieId);
      }
      if (filters?.date) {
        results = results.filter((s) => s.date === filters.date);
      }
      return results;
    }
  } catch (err) {
    console.warn('Firestore shows read fallback to static data:', err);
  }

  // Fallback to static shows
  let filtered = [...staticShows];
  if (filters?.theatreId) filtered = filtered.filter((s) => s.theatreId === filters.theatreId);
  if (filters?.movieId) filtered = filtered.filter((s) => s.movieId === filters.movieId);
  if (filters?.date) filtered = filtered.filter((s) => s.date === filters.date);

  return filtered.map((s) => ({
    ...s,
    status: 'open',
    categoryPrices: {
      Silver: s.priceOverrides?.premium ? s.priceOverrides.premium - 50 : 150,
      Gold: s.priceOverrides?.gold || 200,
      Recliner: s.priceOverrides?.onLand || 295,
    },
  }));
}

export async function saveShow(
  showData: AdminShowInput,
  adminUser?: { uid: string; name: string }
): Promise<string> {
  const id =
    showData.id ||
    `show_${showData.theatreId}_${showData.movieId}_${showData.date}_${showData.time.replace(/[^a-zA-Z0-9]/g, '')}`;

  const now = new Date().toISOString();
  const record: AdminShowInput = {
    ...showData,
    id,
    status: showData.status || 'open',
    updatedAt: now,
    createdAt: showData.createdAt || now,
  };

  const docRef = doc(db, 'shows', id);
  await setDoc(docRef, record, { merge: true });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'show.saved',
      entityType: 'show',
      entityId: id,
      summary: `${adminUser.name} scheduled show for "${record.movieId}" at ${record.theatreId} (${record.date} ${record.time}).`,
      newData: record,
    });
  }

  return id;
}

export async function bulkCreateShows(
  params: {
    movieId: string;
    movieTitle?: string;
    locationId: string;
    theatreId: string;
    theatreName?: string;
    screenId: string;
    screenName?: string;
    seatLayoutId: string;
    format: string;
    language: string;
    dates: string[]; // ['2026-09-10', '2026-09-11', ...]
    times: string[]; // ['10:30 AM', '02:30 PM', '06:30 PM', '10:00 PM']
    categoryPrices: Record<string, number>;
  },
  adminUser?: { uid: string; name: string }
): Promise<string[]> {
  const createdIds: string[] = [];

  for (const date of params.dates) {
    for (const time of params.times) {
      const showObj: AdminShowInput = {
        id: `show_${params.theatreId}_${params.screenId}_${date}_${time.replace(/[^a-zA-Z0-9]/g, '')}`,
        movieId: params.movieId,
        movieTitle: params.movieTitle,
        locationId: params.locationId,
        theatreId: params.theatreId,
        theatreName: params.theatreName,
        screenId: params.screenId,
        screenName: params.screenName,
        seatLayoutId: params.seatLayoutId,
        date,
        time,
        format: params.format,
        language: params.language,
        status: 'open',
        priceStarting: Math.min(...Object.values(params.categoryPrices)),
        categoryPrices: params.categoryPrices,
        priceOverrides: {
          gold: params.categoryPrices['Gold'] || 200,
          premium: params.categoryPrices['Silver'] || 150,
          onLand: params.categoryPrices['Recliner'] || 295,
        },
      };

      const id = await saveShow(showObj);
      createdIds.push(id);
    }
  }

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'show.bulk_created',
      entityType: 'show',
      summary: `${adminUser.name} bulk scheduled ${createdIds.length} shows for "${params.movieTitle || params.movieId}".`,
      newData: { count: createdIds.length, dates: params.dates, times: params.times },
    });
  }

  return createdIds;
}

export async function copySchedule(
  params: {
    sourceDate: string;
    targetDates: string[];
    theatreId: string;
    screenId?: string;
  },
  adminUser?: { uid: string; name: string }
): Promise<number> {
  const sourceShows = await getAllShows({ theatreId: params.theatreId, date: params.sourceDate });
  if (sourceShows.length === 0) return 0;

  let totalCopied = 0;

  for (const targetDate of params.targetDates) {
    for (const s of sourceShows) {
      if (params.screenId && s.screenId !== params.screenId) continue;

      const newShow: AdminShowInput = {
        ...s,
        id: `show_${s.theatreId}_${s.screenId || 's1'}_${targetDate}_${s.time.replace(/[^a-zA-Z0-9]/g, '')}`,
        date: targetDate,
        status: 'open',
      };
      await saveShow(newShow);
      totalCopied++;
    }
  }

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'show.schedule_copied',
      entityType: 'show',
      summary: `${adminUser.name} copied schedule from ${params.sourceDate} to ${params.targetDates.join(', ')} (${totalCopied} shows).`,
    });
  }

  return totalCopied;
}

export async function deleteShow(
  id: string,
  adminUser?: { uid: string; name: string }
): Promise<boolean> {
  const docRef = doc(db, 'shows', id);
  await deleteDoc(docRef);

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'show.deleted',
      entityType: 'show',
      entityId: id,
      summary: `${adminUser.name} deleted show "${id}".`,
    });
  }

  return true;
}
