"use client";

import React, { useState } from 'react';
import { Menu, Search, Bell, LogOut, Shield } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { ROLE_LABELS } from '@/lib/admin/permissions';

interface AdminHeaderProps {
  onMobileMenuToggle: () => void;
  onOpenSearch: () => void;
}

export function AdminHeader({ onMobileMenuToggle, onOpenSearch }: AdminHeaderProps) {
  const { admin, logout } = useAdminAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="h-16 bg-[#121418]/90 backdrop-blur-md border-b border-white/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <span className="text-white font-bold">Admin Console</span>
          <span>/</span>
          <span className="text-primary font-semibold capitalize">TicketX Central</span>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile Menu */}
      <div className="flex items-center gap-3">
        {/* Global Search Shortcut */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-xs text-gray-400 hover:text-white transition-all shadow-inner"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search anything...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-gray-300">
            Ctrl+K
          </kbd>
        </button>

        {/* Quick Notifications */}
        <button
          onClick={() => {}}
          className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/30 to-red-600/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {admin?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </button>

          {isProfileOpen && (
            <>
              <div
                onClick={() => setIsProfileOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#16191f] border border-white/10 p-3 shadow-2xl z-50 space-y-3">
                <div className="px-2 py-1.5 border-b border-white/10 space-y-1">
                  <div className="font-bold text-sm text-white truncate">{admin?.name}</div>
                  <div className="text-xs text-gray-400 truncate">{admin?.email}</div>
                  <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/30 uppercase">
                    <Shield className="w-3 h-3" />
                    <span>{admin ? ROLE_LABELS[admin.role] : 'ADMIN'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
