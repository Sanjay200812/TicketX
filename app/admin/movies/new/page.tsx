import type { Metadata } from 'next';
import { MovieForm } from '@/components/admin/movies/MovieForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export const metadata: Metadata = {
  title: 'Add New Movie - TicketX Admin',
  robots: { index: false, follow: false },
};

export default function NewMoviePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add New Feature Film"
        description="Publish a new release or save a draft to schedule across TicketX theatres."
        backHref="/admin/movies"
        backLabel="Back to Movie Catalog"
      />
      <MovieForm isNew={true} />
    </div>
  );
}
