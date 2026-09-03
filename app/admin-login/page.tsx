import type { Metadata } from 'next';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { AdminLoginForm } from './AdminLoginForm';

export const metadata: Metadata = {
  title: 'TicketX Admin - Secure Access',
  description: 'Private administrative login for TicketX platform operations.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0c0f] relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />

        <AdminLoginForm />
      </div>
    </AdminAuthProvider>
  );
}
