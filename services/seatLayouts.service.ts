import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TicketXSeatLayout, TicketXSeatSection, TicketXSeatRow, TicketXSeatGroup, TicketXSeat } from '@/types/seatLayouts';
import { seatLayoutsList as staticLayouts } from '@/data/seatLayouts';
import { logAdminAction } from './audit.service';

export interface AdminSeatLayoutTemplate extends TicketXSeatLayout {
  templateName?: string;
  theatreName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllSeatLayouts(): Promise<AdminSeatLayoutTemplate[]> {
  try {
    const snap = await getDocs(collection(db, 'seatLayouts'));
    if (!snap.empty) {
      const results: AdminSeatLayoutTemplate[] = [];
      snap.forEach((d) => results.push({ ...d.data(), id: d.id } as AdminSeatLayoutTemplate));
      return results;
    }
  } catch (err) {
    console.warn('Firestore seat layouts fallback:', err);
  }

  // Fallback to static layouts
  return staticLayouts.map((l) => ({
    ...l,
    templateName: `${l.theatreName || l.theatreId} Standard Layout`,
  }));
}

export async function getSeatLayoutById(id: string): Promise<AdminSeatLayoutTemplate | null> {
  try {
    const docRef = doc(db, 'seatLayouts', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as AdminSeatLayoutTemplate;
    }
  } catch (err) {
    console.warn('Firestore seat layout lookup fallback:', err);
  }

  const staticMatch = staticLayouts.find((l) => l.id === id || l.theatreId === id);
  if (staticMatch) {
    return {
      ...staticMatch,
      templateName: `${staticMatch.theatreName || staticMatch.theatreId} Standard Layout`,
    };
  }

  return null;
}

export async function saveSeatLayout(
  layoutData: AdminSeatLayoutTemplate,
  adminUser?: { uid: string; name: string }
): Promise<string> {
  const id = layoutData.id || `layout_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const record: AdminSeatLayoutTemplate = {
    ...layoutData,
    id,
    updatedAt: now,
    createdAt: layoutData.createdAt || now,
  };

  const docRef = doc(db, 'seatLayouts', id);
  await setDoc(docRef, record, { merge: true });

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'seat_layout.saved',
      entityType: 'seat_layout',
      entityId: id,
      summary: `${adminUser.name} saved seat layout "${record.templateName || record.id}" with ${record.capacity} capacity.`,
      newData: { id, capacity: record.capacity, sectionsCount: record.sections?.length },
    });
  }

  return id;
}

export async function deleteSeatLayout(
  id: string,
  templateName: string,
  adminUser?: { uid: string; name: string }
): Promise<boolean> {
  const docRef = doc(db, 'seatLayouts', id);
  await deleteDoc(docRef);

  if (adminUser) {
    await logAdminAction({
      adminUid: adminUser.uid,
      adminName: adminUser.name,
      action: 'seat_layout.deleted',
      entityType: 'seat_layout',
      entityId: id,
      summary: `${adminUser.name} deleted seat layout "${templateName}".`,
    });
  }

  return true;
}

/**
 * Visual Seat Layout Generator Utility
 */
export function buildGridLayout(params: {
  theatreId: string;
  screenId?: string;
  theatreName: string;
  rowsCount: number; // e.g. 10
  seatsPerRow: number; // e.g. 16
  aisleAfterSeat: number; // e.g. 8 (splits row into left and right blocks)
  sections: { name: string; rows: number; price: number }[];
}): TicketXSeatLayout {
  const { theatreId, screenId, theatreName, rowsCount, seatsPerRow, aisleAfterSeat, sections } = params;

  let totalCapacity = 0;
  let currentRowIndex = 0;
  const layoutSections: TicketXSeatSection[] = [];

  sections.forEach((sec, sIdx) => {
    const sectionRows: TicketXSeatRow[] = [];

    for (let r = 0; r < sec.rows; r++) {
      if (currentRowIndex >= rowsCount) break;
      const rowLetter = String.fromCharCode(65 + currentRowIndex);
      currentRowIndex++;

      // Split into Left and Right Groups around Aisle
      const leftSeatsCount = Math.min(aisleAfterSeat, seatsPerRow);
      const rightSeatsCount = Math.max(0, seatsPerRow - aisleAfterSeat);

      const leftSeats: TicketXSeat[] = [];
      for (let s = 1; s <= leftSeatsCount; s++) {
        const id = `${rowLetter}${s.toString().padStart(2, '0')}`;
        leftSeats.push({
          id,
          label: id,
          row: rowLetter,
          number: s,
          status: 'available',
          sectionId: `sec_${sIdx}`,
        });
        totalCapacity++;
      }

      const rightSeats: TicketXSeat[] = [];
      for (let s = 1; s <= rightSeatsCount; s++) {
        const seatNum = leftSeatsCount + s;
        const id = `${rowLetter}${seatNum.toString().padStart(2, '0')}`;
        rightSeats.push({
          id,
          label: id,
          row: rowLetter,
          number: seatNum,
          status: 'available',
          sectionId: `sec_${sIdx}`,
        });
        totalCapacity++;
      }

      const groups: TicketXSeatGroup[] = [{ seats: leftSeats }, { seats: rightSeats }];

      sectionRows.push({
        row: rowLetter,
        groups,
        seats: [...leftSeats, ...rightSeats].map((st) => ({ number: st.number || 0, status: st.status })),
      });
    }

    layoutSections.push({
      id: `sec_${sIdx}`,
      name: sec.name,
      price: sec.price,
      priceStatus: 'confirmed',
      rows: sectionRows,
    });
  });

  return {
    id: `${theatreId}-layout`,
    theatreId,
    screenId,
    theatreName,
    screenPosition: 'bottom',
    sections: layoutSections,
    capacity: totalCapacity,
  };
}
