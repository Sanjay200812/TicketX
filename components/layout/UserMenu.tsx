"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Ticket, Heart, Settings, HelpCircle, LogOut, MoreVertical, Store, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const isVenueOwner = user.role === 'venue_owner' || user.role === 'admin';

  return (
    <div className="relative" ref={menuRef}>
      {/* User Account Trigger Button (Avatar + Name + Three-Dot Icon) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/40 border border-white/10 hover:border-white/20 transition-all text-xs font-semibold text-white focus:outline-none"
        aria-label="User Account Menu"
      >
        <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover" />
          ) : (
            <User className="w-3.5 h-3.5" />
          )}
        </div>
        <span className="max-w-[100px] truncate hidden sm:inline-block font-medium">{user.name || 'Account'}</span>
        <MoreVertical className="w-4 h-4 text-gray-400 hover:text-white" />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-[#141418] border border-white/15 rounded-2xl shadow-2xl py-2 z-50 text-xs font-sans"
          >
            {/* Header info */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="truncate">
                <p className="font-bold text-white text-sm truncate">{user.name || 'TicketX User'}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email || user.displayPhone || user.phone}</p>
              </div>
            </div>

            {/* Menu Links */}
            <div className="py-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Profile</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </Link>

              <Link
                href="/my-bookings"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Ticket className="w-4 h-4 text-primary" />
                  <span>My Bookings</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </Link>

              <Link
                href="/favorites"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Saved Movies</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </Link>

              {isVenueOwner && (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 text-amber-300 hover:bg-white/5 transition-colors font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-amber-400" />
                    <span>My Venue Registrations</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                </Link>
              )}

              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Settings</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </Link>

              <Link
                href="/support"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>Support &amp; Help</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </Link>
            </div>

            {/* Logout Button */}
            <div className="pt-1 border-t border-white/10">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                  router.push('/');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-destructive hover:bg-destructive/10 transition-colors font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
