"use client";

import React from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isDesktopExpanded } = useSidebar();

  return (
    <main
      className={cn(
        'flex-1 transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
        isDesktopExpanded ? 'lg:pl-[260px]' : 'lg:pl-[68px]'
      )}
    >
      {children}
    </main>
  );
}
