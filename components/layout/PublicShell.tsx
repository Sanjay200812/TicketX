"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MainLayout } from '@/components/layout/MainLayout';
import { SupportChatbot } from '@/components/support/SupportChatbot';
import { CinematicIntro } from '@/components/shared/CinematicIntro';

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute =
    pathname?.startsWith('/admin') || pathname === '/admin-login';

  if (isAdminRoute) {
    return <div className="min-h-screen w-full bg-[#0d0f12] text-white flex flex-col">{children}</div>;
  }

  return (
    <>
      <CinematicIntro />
      <Navbar />
      <MainLayout>{children}</MainLayout>
      <SupportChatbot />
      <Footer />
    </>
  );
}
