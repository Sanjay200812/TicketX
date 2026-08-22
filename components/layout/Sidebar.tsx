"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Film,
  Sparkles,
  Building2,
  MapPin,
  Heart,
  Ticket,
  User,
  Settings,
  HelpCircle,
  FileQuestion,
  MessageSquare,
  Mail,
  Store,
  ChevronDown,
  ChevronRight,
  X,
  Building,
  LogOut,
  LogIn,
  LucideProps,
} from 'lucide-react';
import { SIDEBAR_NAV_SECTIONS } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Home,
  Film,
  Sparkles,
  Building2,
  MapPin,
  Heart,
  Ticket,
  User,
  Settings,
  HelpCircle,
  FileQuestion,
  MessageSquare,
  Mail,
  Store,
  Building,
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { location, setIsCityModalOpen } = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ Theatres: false, Locations: false });

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isVenueOwner = user?.role === 'venue_owner' || user?.role === 'admin';

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex">
          {/* Backdrop Overlay - Clicking overlay closes sidebar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Left Drawer Sidebar Content */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-80 max-w-[85vw] h-full bg-[#121216] border-r border-white/10 flex flex-col justify-between p-5 z-10 font-sans shadow-2xl overflow-y-auto"
          >
            <div>
              {/* TOP HEADER: Logo & Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <Link href="/" onClick={onClose} className="flex items-center gap-2">
                  <span className="text-xl font-black font-heading tracking-wider text-white">
                    TICKET<span className="text-primary">X</span>
                  </span>
                </Link>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close Navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* MOVED PROFILE BLOCK AT TOP OF SIDEBAR (Requirements 1, 2, 3) */}
              <div className="mb-6 bg-secondary/40 border border-white/10 rounded-2xl p-4 shadow-lg">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name || 'User avatar'}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary/50 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-rose-700 text-white font-extrabold flex items-center justify-center text-lg border-2 border-primary/50 shrink-0">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-white truncate">{user.name || 'TicketX User'}</h4>
                        </div>
                        {user.email && (
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        )}
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold uppercase bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30">
                            {user.role || 'customer'}
                          </span>
                          <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Profile Links */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs font-semibold">
                      <Link
                        href="/profile"
                        onClick={onClose}
                        className="py-1.5 px-3 rounded-lg bg-black/40 hover:bg-white/10 text-gray-200 text-center transition-colors border border-white/5 flex items-center justify-center gap-1.5"
                      >
                        <User className="w-3.5 h-3.5 text-primary" /> Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={onClose}
                        className="py-1.5 px-3 rounded-lg bg-black/40 hover:bg-white/10 text-gray-200 text-center transition-colors border border-white/5 flex items-center justify-center gap-1.5"
                      >
                        <Settings className="w-3.5 h-3.5 text-amber-400" /> Settings
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 space-y-2.5">
                    <div className="w-10 h-10 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Guest User</p>
                      <p className="text-[11px] text-muted-foreground">Sign in for tickets &amp; saved movies</p>
                    </div>
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="block w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(216,33,50,0.3)] flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-4 h-4" /> LOGIN / SIGN UP
                    </Link>
                  </div>
                )}
              </div>

              {/* SIDEBAR NAVIGATION GROUP SECTIONS */}
              <div className="space-y-6">
                {SIDEBAR_NAV_SECTIONS.map((section) => {
                  // Hide PARTNER section completely for normal customer role
                  if (section.title === 'PARTNER' && !isVenueOwner) {
                    return null;
                  }

                  return (
                    <div key={section.title} className="space-y-2">
                      <h4 className="text-[10px] font-bold font-mono uppercase tracking-widest text-muted-foreground px-2">
                        {section.title}
                      </h4>

                      <div className="space-y-1">
                        {section.items.map((item) => {
                          const IconComp = item.icon ? ICON_MAP[item.icon] : null;
                          const isActive = pathname === item.href;
                          const isExpanded = expandedSections[item.label];

                          if (item.hasDropdown) {
                            return (
                              <div key={item.label} className="space-y-1">
                                <button
                                  onClick={() => {
                                    if (item.label === 'Locations') {
                                      setIsCityModalOpen(true);
                                      onClose();
                                    } else {
                                      toggleSection(item.label);
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                    isActive ? 'bg-primary/15 text-primary' : 'text-gray-300 hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {IconComp && <IconComp className="w-4 h-4 text-primary shrink-0" />}
                                    <span>{item.label}</span>
                                    {item.label === 'Locations' && (
                                      <span className="text-[10px] text-muted-foreground font-mono">({location.city.name})</span>
                                    )}
                                  </div>
                                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                </button>

                                {/* Child Links */}
                                {isExpanded && item.children && (
                                  <div className="pl-8 space-y-1 pt-1 border-l border-white/10 ml-5">
                                    {item.children.map((child) => (
                                      <Link
                                        key={child.label}
                                        href={child.href}
                                        onClick={onClose}
                                        className="block py-1.5 px-2 text-[11px] font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                      >
                                        {child.label}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={onClose}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                isActive
                                  ? 'bg-primary/20 text-primary border border-primary/30'
                                  : 'text-gray-300 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {IconComp && <IconComp className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />}
                                <span>{item.label}</span>
                              </div>
                              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FOOTER & LOGOUT BUTTON */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" /> LOGOUT
                </button>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="text-[11px]">Selected Location</span>
                <span className="font-bold text-white font-mono">{location.city.name}</span>
              </div>
              <p className="text-[10px] text-gray-500 text-center">TicketX Platform v2.0 • Andhra Pradesh</p>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
