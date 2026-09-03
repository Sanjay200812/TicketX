import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AuditLogEntry } from '@/types/admin';

export async function logAdminAction(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<string> {
  try {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullRecord: AuditLogEntry = {
      ...entry,
      id,
      timestamp: new Date().toISOString(),
    };

    const docRef = doc(db, 'auditLogs', id);
    const writePromise = setDoc(docRef, fullRecord);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Audit write timed out')), 1000)
    );

    await Promise.race([writePromise, timeoutPromise]);
    return id;
  } catch {
    // Non-blocking fallback when Firestore is offline or uninitialized
    return '';
  }
}

export async function getRecentAuditLogs(count = 50): Promise<AuditLogEntry[]> {
  try {
    const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(count));
    const snap = await getDocs(q);
    const results: AuditLogEntry[] = [];
    snap.forEach((d) => {
      results.push(d.data() as AuditLogEntry);
    });
    return results;
  } catch {
    return [];
  }
}
