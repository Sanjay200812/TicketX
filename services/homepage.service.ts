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
import { HomepageBanner, HomepageSectionConfig } from '@/types/admin';
import { logAdminAction } from './audit.service';

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  { id: 'sec_hero', name: 'Hero Banner Carousel', title: 'Top Premieres', type: 'hero', enabled: true, displayOrder: 1 },
  { id: 'sec_now_showing', name: 'Now Showing', title: 'Now Showing in Cinema', type: 'now_showing', enabled: true, displayOrder: 2 },
  { id: 'sec_languages', name: 'Browse by Indian Language', title: 'Indian Cinema Languages', type: 'custom', enabled: true, displayOrder: 3 },
  { id: 'sec_events', name: 'Events Near You', title: 'Live Events & Concerts', type: 'events_near_you', enabled: true, displayOrder: 4 },
  { id: 'sec_theatres', name: 'Partner Cinemas', title: 'Explore Theatres', type: 'featured_theatres', enabled: true, displayOrder: 5 },
  { id: 'sec_upcoming', name: 'Upcoming Movies', title: 'Coming Soon to TicketX', type: 'upcoming_movies', enabled: true, displayOrder: 6 },
];

export const DEFAULT_HOMEPAGE_BANNERS: HomepageBanner[] = [
  {
    id: 'banner_1',
    title: 'Debba Debba',
    subtitle: 'Mass Commercial Blockbuster Now Showing',
    tagline: 'Experience in Dolby Atmos 4K Barco Laser',
    image: '/posters/debba-debba.jpg',
    ctaText: 'Book Tickets',
    ctaLink: '/movies/debba-debba',
    movieId: 'debba-debba',
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'banner_2',
    title: 'Irumudi',
    subtitle: 'Sacred Devotional Action Thriller',
    tagline: 'Starring Sharwanand & Sai Pallavi',
    image: '/posters/irumudi.jpg',
    ctaText: 'Book Tickets',
    ctaLink: '/movies/irumudi',
    movieId: 'irumudi',
    isActive: true,
    displayOrder: 2,
  },
];

export async function getHomepageBanners(): Promise<HomepageBanner[]> {
  try {
    const q = query(collection(db, 'homepageBanners'), orderBy('displayOrder', 'asc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const results: HomepageBanner[] = [];
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as HomepageBanner));
      return results;
    }
  } catch (err) {
    console.warn('Firestore homepage banners fallback:', err);
  }
  return DEFAULT_HOMEPAGE_BANNERS;
}

export async function saveHomepageBanner(
  banner: HomepageBanner,
  adminUser?: { uid: string; name: string }
): Promise<string> {
  const id = banner.id || `banner_${Date.now()}`;
  const record: HomepageBanner = { ...banner, id };

  const docRef = doc(db, 'homepageBanners', id);
  await setDoc(docRef, record, { merge: true });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'homepage.banner_saved',
      entityType: 'homepage',
      entityId: id,
      summary: `${adminUser.name} saved homepage banner "${banner.title}".`,
      newData: banner,
    });
  }

  return id;
}

export async function deleteHomepageBanner(
  id: string,
  adminUser?: { uid: string; name: string }
): Promise<boolean> {
  const docRef = doc(db, 'homepageBanners', id);
  await deleteDoc(docRef);

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'homepage.banner_deleted',
      entityType: 'homepage',
      entityId: id,
      summary: `${adminUser.name} deleted homepage banner "${id}".`,
    });
  }

  return true;
}

export async function getHomepageSections(): Promise<HomepageSectionConfig[]> {
  try {
    const docRef = doc(db, 'systemSettings', 'homepage_sections');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.sections) {
      return snap.data().sections as HomepageSectionConfig[];
    }
  } catch (err) {
    console.warn('Firestore homepage sections fallback:', err);
  }
  return DEFAULT_HOMEPAGE_SECTIONS;
}

export async function saveHomepageSections(
  sections: HomepageSectionConfig[],
  adminUser?: { uid: string; name: string }
): Promise<void> {
  const docRef = doc(db, 'systemSettings', 'homepage_sections');
  await setDoc(docRef, { sections, updatedAt: new Date().toISOString() }, { merge: true });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'homepage.sections_updated',
      entityType: 'homepage',
      summary: `${adminUser.name} updated homepage sections visibility & layout order.`,
      newData: sections,
    });
  }
}
