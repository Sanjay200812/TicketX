"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/admin-login');
    }
  }, [admin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center">
        <AdminLoader text="Authenticating administrative session..." />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#16191f] border border-red-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white font-heading">ACCESS DENIED</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            You do not have administrative privileges to view this section.
          </p>
          <Link
            href="/admin-login"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
