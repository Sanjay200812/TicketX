import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { TheatreForm } from '@/components/admin/theatres/TheatreForm';

export const metadata: Metadata = {
  title: 'Add Theatre - TicketX Admin',
  robots: { index: false, follow: false },
};

export default function NewTheatrePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add Partner Cinema"
        description="Register a new movie theatre or multiplex to the TicketX cinema network."
        backHref="/admin/theatres"
        backLabel="Back to Theatres"
      />
      <TheatreForm isNew={true} />
    </div>
  );
}
