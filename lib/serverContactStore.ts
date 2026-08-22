export interface ContactSubmission {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  booking_id?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}

// In-memory store for server runtime contact submissions (Requirement 8)
const contactSubmissions: ContactSubmission[] = [];

export function saveContactSubmission(data: Omit<ContactSubmission, 'id' | 'status' | 'created_at'>): ContactSubmission {
  const newSubmission: ContactSubmission = {
    id: `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    ...data,
    status: 'new',
    created_at: new Date().toISOString(),
  };

  contactSubmissions.unshift(newSubmission);
  console.log(`[TICKETX CONTACT LOG] New contact request received from ${data.email} (${data.category})`);
  return newSubmission;
}

export function getContactSubmissions(): ContactSubmission[] {
  return contactSubmissions;
}
