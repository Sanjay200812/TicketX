"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isDesktopExpanded: boolean;
  isMobileDrawerOpen: boolean;
  toggleDesktop: () => void;
  toggleMobile: () => void;
  toggleSidebar: () => void;
  closeMobile: () => void;
  closeAll: () => void;
  setDesktopExpanded: (expanded: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Default desktop state: collapsed (false)
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const toggleDesktop = () => setIsDesktopExpanded((prev) => !prev);
  const toggleMobile = () => setIsMobileDrawerOpen((prev) => !prev);
  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsDesktopExpanded((prev) => !prev);
    } else {
      setIsMobileDrawerOpen((prev) => !prev);
    }
  };
  const closeMobile = () => setIsMobileDrawerOpen(false);
  const closeAll = () => {
    setIsMobileDrawerOpen(false);
  };

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isDesktopExpanded,
        isMobileDrawerOpen,
        toggleDesktop,
        toggleMobile,
        toggleSidebar,
        closeMobile,
        closeAll,
        setDesktopExpanded: setIsDesktopExpanded,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
