"use client";

import { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronRight,
  X,
  LogOut,
  LogIn,
  MoreVertical,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { LOCATIONS } from '@/data/locations';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIDEBAR_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Movies', href: '/movies', icon: Film },
  { label: 'Events', href: '/events', icon: Sparkles },
  { label: 'Theatres', href: '/theatres', icon: Building2 },
  { label: 'Locations', href: '#', icon: MapPin, hasDropdown: true },
  { label: 'Saved Movies', href: '/favorites', icon: Heart },
  { label: 'My Bookings', href: '/my-bookings', icon: Ticket },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Support', href: '/support', icon: HelpCircle },
  { label: 'FAQ', href: '/support/faq', icon: FileQuestion },
  { label: 'Feedback', href: '/support/feedback', icon: MessageSquare },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { location, selectLocation } = useLocation();
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);
  const [expandedLocations, setExpandedLocations] = useState(false);

  // Escape key press listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        setShowThreeDotsMenu(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    setShowThreeDotsMenu(false);
    await logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              onClose();
              setShowThreeDotsMenu(false);
            }}
          />

          {/* Requirement Section 4, 5: Glassmorphism Translucent Sidebar */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-80 max-w-[85vw] h-full bg-[#0c0c0e]/85 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between p-5 z-10 font-sans shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-y-auto"
          >
            <div>
              {/* TOP HEADER: Logo, 3-Dots Menu (Section 4), and Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5 relative">
                <Link href="/" onClick={onClose} className="flex items-center gap-2">
                  <span className="text-xl font-black font-heading tracking-wider text-white">
                    Ticket<span className="text-primary">X</span>
                  </span>
                </Link>

                <div className="flex items-center gap-1">
                  {/* Requirement Section 4: Top 3-Dots Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowThreeDotsMenu(!showThreeDotsMenu)}
                      aria-label="Account Options Menu"
                      className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* 3-Dots Dropdown Popup */}
                    <AnimatePresence>
                      {showThreeDotsMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 5 }}
                          className="absolute right-0 top-11 w-44 bg-[#141419] border border-white/15 rounded-2xl shadow-2xl p-1.5 z-30 backdrop-blur-xl text-xs font-semibold"
                        >
                          <Link
                            href="/profile"
                            onClick={() => {
                              setShowThreeDotsMenu(false);
                              onClose();
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-200 hover:bg-primary/20 hover:text-primary transition-colors"
                          >
                            <User className="w-4 h-4 text-primary" /> Profile
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => {
                              setShowThreeDotsMenu(false);
                              onClose();
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-200 hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-amber-400" /> Settings
                          </Link>

                          {user && (
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors text-left font-bold border-t border-white/10 mt-1 pt-2"
                            >
                              <LogOut className="w-4 h-4 text-rose-400" /> Logout
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Close Sidebar Button */}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close Navigation"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* NAVIGATION LINKS LIST */}
              <nav className="space-y-1.5">
                {SIDEBAR_ITEMS.map((item) => {
                  const IconComp = item.icon;
                  const isActive = pathname === item.href;

                  if (item.hasDropdown) {
                    return (
                      <div key={item.label} className="space-y-1">
                        <button
                          onClick={() => setExpandedLocations(!expandedLocations)}
                          className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <IconComp className="w-4 h-4 text-primary shrink-0" />
                            <span>{item.label}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">({location.city.name})</span>
                          </div>
                          {expandedLocations ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </button>

                        {expandedLocations && (
                          <div className="pl-8 space-y-1 pt-1 border-l border-white/10 ml-5">
                            {LOCATIONS.map((loc) => (
                              <button
                                key={loc.id}
                                onClick={() => {
                                  selectLocation(loc);
                                  onClose();
                                }}
                                className={`block w-full text-left py-2 px-2.5 text-xs font-semibold rounded-lg transition-colors ${
                                  location.city.id === loc.id
                                    ? 'bg-primary/20 text-primary font-bold'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                {loc.name}
                              </button>
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
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(216,33,50,0.2)]'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Requirement Section 4, 5: BOTTOM SECTION PROFILE QUICK ACTION CARD */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="bg-secondary/40 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-xl">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {user.photoURL || user.avatar ? (
                        <img
                          src={(user.photoURL || user.avatar) as string}
                          alt={user.name || 'User avatar'}
                          className="w-11 h-11 rounded-full object-cover border-2 border-primary/50 shrink-0 shadow-lg"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary via-rose-700 to-black text-white font-extrabold flex items-center justify-center text-base border-2 border-primary/50 shrink-0 font-heading shadow-lg">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-white truncate font-heading">{user.name || 'TicketX Member'}</h4>
                        {user.email && (
                          <p className="text-[11px] text-muted-foreground truncate font-mono">{user.email}</p>
                        )}
                        <span className="inline-block mt-0.5 text-[9px] font-mono font-bold uppercase bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30">
                          {user.role || 'customer'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs font-bold">
                      <Link
                        href="/profile"
                        onClick={onClose}
                        className="py-2 px-2.5 rounded-xl bg-black/40 hover:bg-white/10 text-gray-200 text-center transition-colors border border-white/10 flex items-center justify-center gap-1.5"
                      >
                        <User className="w-3.5 h-3.5 text-primary" /> Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={onClose}
                        className="py-2 px-2.5 rounded-xl bg-black/40 hover:bg-white/10 text-gray-200 text-center transition-colors border border-white/10 flex items-center justify-center gap-1.5"
                      >
                        <Settings className="w-3.5 h-3.5 text-amber-400" /> Settings
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-1 space-y-2">
                    <p className="text-xs font-bold text-white font-heading">Guest User</p>
                    <p className="text-[11px] text-muted-foreground">Sign in for instant tickets</p>
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

              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span className="text-[11px]">Selected City</span>
                <span className="font-bold text-white font-mono">{location.city.name}</span>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
