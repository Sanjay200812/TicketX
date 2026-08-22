import fs from 'fs';
import path from 'path';

export interface VenueRegistrationRequest {
  id: string;
  userId?: string;
  contactName: string;
  businessName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  venueType: 'movie_theatre' | 'event_hall' | 'multipurpose';
  bookingType: 'movies' | 'events' | 'both';
  address: string;
  locality?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  mapsUrl?: string;
  screensCount?: number;
  capacity?: number;
  stageAvailable?: boolean;
  facilities: string[];
  acceptsOnlineBookings?: boolean;
  existingPlatform?: string;
  preferredContact: 'phone' | 'email' | 'whatsapp';
  bestContactTime?: string;
  seatingLayoutUrl?: string;
  notes?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
}

interface VenueStore {
  requests: Record<string, VenueRegistrationRequest>;
}

const VENUE_DB_PATH = path.join(process.cwd(), '.next', 'venue_registrations.json');

function loadVenueDB(): VenueStore {
  try {
    if (fs.existsSync(VENUE_DB_PATH)) {
      const data = fs.readFileSync(VENUE_DB_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading venue DB:', err);
  }
  return { requests: {} };
}

function saveVenueDB(db: VenueStore) {
  try {
    const dir = path.dirname(VENUE_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(VENUE_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving venue DB:', err);
  }
}

const memoryVenueDB: VenueStore = loadVenueDB();

export function saveVenueRegistration(params: Omit<VenueRegistrationRequest, 'id' | 'status' | 'createdAt'>): VenueRegistrationRequest {
  const id = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const record: VenueRegistrationRequest = {
    ...params,
    id,
    status: 'pending', // Requirement 49: Saved as pending (NEVER auto-published!)
    createdAt: new Date().toISOString(),
  };

  memoryVenueDB.requests[id] = record;
  saveVenueDB(memoryVenueDB);
  return record;
}

export function getUserVenueRegistrations(userId?: string, email?: string): VenueRegistrationRequest[] {
  return Object.values(memoryVenueDB.requests)
    .filter((req) => (userId && req.userId === userId) || (email && req.email.toLowerCase() === email.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
