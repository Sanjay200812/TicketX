import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { logAdminAction } from './audit.service';

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  category: 'movie_poster' | 'movie_banner' | 'event_poster' | 'event_banner' | 'theatre_image' | 'promotional_banner' | 'general';
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
}

export async function uploadMediaFile(
  file: File,
  category: MediaItem['category'] = 'general',
  adminUser?: { uid: string; name: string }
): Promise<MediaItem> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `media/${category}/${timestamp}_${safeName}`;
  const storageRef = ref(storage, storagePath);

  // Upload to Firebase Storage
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);

  const mediaId = `media_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
  const mediaItem: MediaItem = {
    id: mediaId,
    name: file.name,
    url: downloadUrl,
    storagePath,
    category,
    sizeBytes: file.size,
    mimeType: file.type,
    createdAt: new Date().toISOString(),
  };

  // Index in Firestore media collection
  const docRef = doc(db, 'media', mediaId);
  await setDoc(docRef, mediaItem);

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'media.uploaded',
      entityType: 'media',
      entityId: mediaId,
      summary: `${adminUser.name} uploaded media file "${file.name}" to ${category}.`,
      newData: { name: file.name, size: file.size, category },
    });
  }

  return mediaItem;
}

export async function getAllMedia(): Promise<MediaItem[]> {
  try {
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const results: MediaItem[] = [];
    snap.forEach((d) => results.push(d.data() as MediaItem));
    return results;
  } catch (err) {
    console.warn('Failed to fetch media records:', err);
    return [];
  }
}

export async function deleteMediaItem(
  item: MediaItem,
  adminUser?: { uid: string; name: string }
): Promise<boolean> {
  try {
    // Delete from Firebase Storage
    if (item.storagePath) {
      const storageRef = ref(storage, item.storagePath);
      await deleteObject(storageRef).catch(() => {});
    }

    // Delete Firestore record
    const docRef = doc(db, 'media', item.id);
    await deleteDoc(docRef);

    if (adminUser) {
      await logAdminAction({
        adminUid: adminUser.uid,
        adminName: adminUser.name,
        action: 'media.deleted',
        entityType: 'media',
        entityId: item.id,
        summary: `${adminUser.name} deleted media item "${item.name}".`,
      });
    }

    return true;
  } catch (err) {
    console.error('Error deleting media item:', err);
    return false;
  }
}
