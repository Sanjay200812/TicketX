import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { EventForm } from '@/components/admin/events/EventForm';

export const metadata: Metadata = {
  title: 'Create Event - TicketX Admin',
  robots: { index: false, follow: false },
};

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Create New Event"
        description="Configure live stage concerts, college fests, or special passes."
        backHref="/admin/events"
        backLabel="Back to Events"
      />
      <EventForm isNew={true} />
    </div>
  );
}
