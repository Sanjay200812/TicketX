import fs from 'fs';
import path from 'path';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface LoginEvent {
  id: string;
  uid: string;
  name: string;
  phone: string;
  loginAt: string;
  loginMethod: 'phone';
  isNewUser: boolean;
  device: 'mobile' | 'desktop' | 'tablet';
  createdAt: string;
}

const ACTIVITY_DB_PATH = path.join(process.cwd(), '.next', 'ticketx_activity.json');

const defaultEvents: LoginEvent[] = [
  {
    id: 'evt_101',
    uid: 'usr_sanjay_2718',
    name: 'Sanjay Kumar',
    phone: '+919876543210',
    loginAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    loginMethod: 'phone',
    isNewUser: false,
    device: 'desktop',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt_102',
    uid: 'usr_varun_411',
    name: 'Varun Teja',
    phone: '+919440112233',
    loginAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    loginMethod: 'phone',
    isNewUser: true,
    device: 'mobile',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
];

function loadActivityDB(): LoginEvent[] {
  try {
    if (fs.existsSync(ACTIVITY_DB_PATH)) {
      const raw = fs.readFileSync(ACTIVITY_DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}
  return [...defaultEvents];
}

function saveActivityDB(list: LoginEvent[]) {
  try {
    const dir = path.dirname(ACTIVITY_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ACTIVITY_DB_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch {}
}

const memoryLoginEvents: LoginEvent[] = loadActivityDB();

export async function recordLoginEvent(params: {
  uid: string;
  name: string;
  phone: string;
  isNewUser: boolean;
  device?: 'mobile' | 'desktop' | 'tablet';
}): Promise<LoginEvent> {
  const now = new Date().toISOString();
  const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const event: LoginEvent = {
    id,
    uid: params.uid,
    name: params.name,
    phone: params.phone,
    loginAt: now,
    loginMethod: 'phone',
    isNewUser: params.isNewUser,
    device: params.device || 'mobile',
    createdAt: now,
  };

  const list = loadActivityDB();
  list.unshift(event);
  if (list.length > 100) {
    list.pop();
  }
  saveActivityDB(list);

  // Attempt Firestore write non-blockingly
  try {
    const docRef = doc(db, 'loginEvents', id);
    setDoc(docRef, event).catch(() => {});
  } catch {}

  return event;
}

export function getRecentLoginEvents(count = 15): LoginEvent[] {
  return loadActivityDB().slice(0, count);
}
