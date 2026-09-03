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
import { TicketXMovie } from '@/types/movie';
import { movies as staticMovies } from '@/data/movies';
import { logAdminAction } from './audit.service';

export interface AdminMovieInput extends TicketXMovie {
  slug?: string;
  shortDescription?: string;
  backdrop?: string;
  trailerUrl?: string;
  featured?: boolean;
  trending?: boolean;
  comingSoon?: boolean;
  nowShowing?: boolean;
  availableLocations?: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllMovies(): Promise<AdminMovieInput[]> {
  try {
    const q = query(collection(db, 'movies'), orderBy('title', 'asc'));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const liveMovies: AdminMovieInput[] = [];
      snap.forEach((d) => {
        liveMovies.push({ ...d.data(), id: d.id } as AdminMovieInput);
      });
      return liveMovies;
    }
  } catch (err) {
    console.warn('Firestore movies read fallback to static data:', err);
  }

  // Graceful Fallback to static movies
  return staticMovies.map((m) => ({
    ...m,
    status: m.status || 'published',
    nowShowing: true,
    languages: m.languages || (m.language ? [m.language] : ['Telugu']),
  }));
}

export async function getMovieById(id: string): Promise<AdminMovieInput | null> {
  try {
    const docRef = doc(db, 'movies', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as AdminMovieInput;
    }
  } catch (err) {
    console.warn('Firestore movie lookup fallback to static data:', err);
  }

  const staticMatch = staticMovies.find((m) => m.id === id);
  if (staticMatch) {
    return {
      ...staticMatch,
      status: staticMatch.status || 'published',
      nowShowing: true,
      languages: staticMatch.languages || (staticMatch.language ? [staticMatch.language] : ['Telugu']),
    };
  }

  return null;
}

export async function saveMovie(
  movieData: AdminMovieInput,
  adminUser?: { uid: string; name: string }
): Promise<string> {
  const id =
    movieData.id ||
    movieData.slug ||
    movieData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const now = new Date().toISOString();
  const record: AdminMovieInput = {
    ...movieData,
    id,
    slug: movieData.slug || id,
    updatedAt: now,
    createdAt: movieData.createdAt || now,
  };

  const docRef = doc(db, 'movies', id);
  await setDoc(docRef, record, { merge: true });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: movieData.createdAt ? 'movie.updated' : 'movie.created',
      entityType: 'movie',
      entityId: id,
      summary: `${adminUser.name} saved movie "${movieData.title}" (${record.status || 'draft'}).`,
      newData: record,
    });
  }

  return id;
}

export async function deleteMovie(
  id: string,
  title: string,
  adminUser?: { uid: string; name: string }
): Promise<boolean> {
  const docRef = doc(db, 'movies', id);
  await deleteDoc(docRef);

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'movie.deleted',
      entityType: 'movie',
      entityId: id,
      summary: `${adminUser.name} deleted movie "${title}".`,
    });
  }

  return true;
}

export async function updateMovieStatus(
  id: string,
  status: 'draft' | 'scheduled' | 'published' | 'archived',
  adminUser?: { uid: string; name: string }
): Promise<void> {
  const docRef = doc(db, 'movies', id);
  await updateDoc(docRef, {
    status,
    updatedAt: new Date().toISOString(),
  });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'movie.status_changed',
      entityType: 'movie',
      entityId: id,
      summary: `${adminUser.name} changed movie "${id}" status to ${status}.`,
    });
  }
}
