import fs from 'fs';
import path from 'path';

export interface FeedbackRecord {
  id: string;
  userId?: string;
  type: string;
  rating: number;
  title: string;
  message: string;
  createdAt: string;
}

interface FeedbackStore {
  records: FeedbackRecord[];
}

const FEEDBACK_DB_PATH = path.join(process.cwd(), '.next', 'feedback_records.json');

function loadFeedbackDB(): FeedbackStore {
  try {
    if (fs.existsSync(FEEDBACK_DB_PATH)) {
      const data = fs.readFileSync(FEEDBACK_DB_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading feedback DB:', err);
  }
  return { records: [] };
}

function saveFeedbackDB(db: FeedbackStore) {
  try {
    const dir = path.dirname(FEEDBACK_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FEEDBACK_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving feedback DB:', err);
  }
}

const memoryFeedbackDB: FeedbackStore = loadFeedbackDB();

export function saveFeedback(params: Omit<FeedbackRecord, 'id' | 'createdAt'>): FeedbackRecord {
  const record: FeedbackRecord = {
    ...params,
    id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  memoryFeedbackDB.records.push(record);
  saveFeedbackDB(memoryFeedbackDB);
  return record;
}
