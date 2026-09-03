import type { Metadata } from 'next';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { AdminRouteGuard } from './AdminRouteGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';

export const metadata: Metadata = {
  title: 'TicketX Admin Control Panel',
  description: 'Private administration portal for TicketX.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminRouteGuard>
        <AdminLayout>{children}</AdminLayout>
      </AdminRouteGuard>
    </AdminAuthProvider>
  );
}
