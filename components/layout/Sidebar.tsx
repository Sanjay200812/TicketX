"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
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
  LogIn,
  LogOut,
  Search,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { useSidebar } from '@/context/SidebarContext';
import { LOCATIONS } from '@/data/locations';
import { getTheatresForLocation } from '@/lib/data';

interface SidebarProps {
  onOpenSearchModal?: () => void;
}

export interface SidebarSection {
  title: string;
  items: {
    id: string;
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    hasDropdown?: boolean;
    type?: 'theatres' | 'locations';
    isAction?: boolean;
  }[];
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: 'MAIN',
    items: [
      { id: 'search', label: 'Search', href: '#search', icon: Search, isAction: true },
      { id: 'home', label: 'Home', href: '/', icon: Home },
      { id: 'movies', label: 'Movies', href: '/movies', icon: Film },
      { id: 'events', label: 'Events', href: '/events', icon: Sparkles },
    ],
  },
  {
    title: 'DISCOVER',
    items: [
      { id: 'theatres', label: 'Theatres', href: '/theatres', icon: Building2, hasDropdown: true, type: 'theatres' },
      { id: 'locations', label: 'Locations', href: '#locations', icon: MapPin, hasDropdown: true, type: 'locations' },
      { id: 'favorites', label: 'Saved Movies', href: '/favorites', icon: Heart },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { id: 'bookings', label: 'My Bookings', href: '/my-bookings', icon: Ticket },
      { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
  {
    title: 'HELP',
    items: [
      { id: 'support', label: 'Support', href: '/support', icon: HelpCircle },
      { id: 'faq', label: 'FAQ', href: '/support/faq', icon: FileQuestion },
      { id: 'feedback', label: 'Feedback', href: '/support/feedback', icon: MessageSquare },
      { id: 'contact', label: 'Contact Us', href: '/support/contact', icon: Mail },
    ],
  },
];

export function Sidebar({ onOpenSearchModal }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { selectLocation, selectedLocation } = useLocation();
  const { isDesktopExpanded, isMobileDrawerOpen, toggleDesktop, closeMobile } = useSidebar();

  const [expandedLocations, setExpandedLocations] = useState(false);
  const [expandedTheatres, setExpandedTheatres] = useState(false);

  // Filter theatres strictly for selected city
  const cityTheatres = getTheatresForLocation(selectedLocation.id);

  // Escape key press listener for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobile();
      }
    };
    if (isMobileDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen, closeMobile]);

  const handleLogout = async () => {
    await logout();
    closeMobile();
  };

  const renderNavContent = (isMobile: boolean) => {
    const isExpanded = isMobile || isDesktopExpanded;

    return (
      <div className="flex flex-col h-full select-none justify-between">
        <div className="flex flex-col flex-1 min-h-0">
          {/* HEADER: In collapsed mode, render ONLY ☰ centered. In expanded mode, render ☰ + TICKETX */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-3 relative min-h-[44px] shrink-0">
            {isExpanded ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={isMobile ? closeMobile : toggleDesktop}
                  className="p-1.5 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center justify-center focus:outline-none cursor-pointer"
                  aria-label="Toggle Sidebar"
                  title="Collapse Sidebar"
                >
                  <Menu className="w-5 h-5 text-primary" />
                </button>

                <Link
                  href="/"
                  onClick={() => isMobile && closeMobile()}
                  className="flex items-center gap-1.5"
                >
                  <span className="text-xl font-black font-heading tracking-wider text-white">
                    Ticket<span className="text-primary">X</span>
                  </span>
                </Link>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center">
                <button
                  type="button"
                  onClick={toggleDesktop}
                  className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center justify-center focus:outline-none cursor-pointer"
                  aria-label="Expand Sidebar"
                  title="Expand Sidebar"
                >
                  <Menu className="w-5 h-5 text-primary" />
                </button>
              </div>
            )}

            {isMobile && (
              <button
                type="button"
                onClick={closeMobile}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* NAVIGATION SECTIONS */}
          <div className="space-y-3.5 overflow-y-auto flex-1 hide-scrollbar pr-0.5">
            {SIDEBAR_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                {/* Section Title in Expanded Mode */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-3.5 py-1 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    {section.title}
                  </motion.div>
                )}

                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const IconComp = item.icon;
                    const isActive = pathname === item.href;

                    // Action buttons like Search
                    if (item.isAction) {
                      return (
                        <div key={item.id} className="relative group">
                          <button
                            type="button"
                            onClick={() => {
                              if (isMobile) closeMobile();
                              if (onOpenSearchModal) onOpenSearchModal();
                            }}
                            className={`w-full flex items-center ${
                              isExpanded ? 'justify-start px-3.5 gap-3' : 'justify-center px-0'
                            } py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer`}
                          >
                            <IconComp className="w-4 h-4 text-primary shrink-0" />
                            {isExpanded && (
                              <motion.span
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.22, delay: 0.08 }}
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </button>

                          {/* Tooltip in collapsed mode */}
                          {!isExpanded && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center z-50 pointer-events-none">
                              <div className="bg-[#18181c] border border-white/15 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xl whitespace-nowrap">
                                {item.label}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Dropdown items (Theatres & Locations)
                    if (item.hasDropdown) {
                      const isLocations = item.type === 'locations';
                      const isTheatres = item.type === 'theatres';
                      const isSectionOpen = isLocations ? expandedLocations : expandedTheatres;
                      const toggleSection = isLocations
                        ? () => setExpandedLocations(!expandedLocations)
                        : () => setExpandedTheatres(!expandedTheatres);

                      return (
                        <div key={item.id} className="space-y-1 relative group">
                          <button
                            type="button"
                            onClick={isExpanded ? toggleSection : () => (isTheatres ? (window.location.href = '/theatres') : setExpandedLocations(true))}
                            className={`w-full flex items-center ${
                              isExpanded ? 'justify-between px-3.5' : 'justify-center px-0'
                            } py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <IconComp className="w-4 h-4 text-primary shrink-0" />
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.22, delay: 0.08 }}
                                  className="flex items-center gap-1.5 truncate"
                                >
                                  <span>{item.label}</span>
                                  {isLocations && (
                                    <span className="text-[10px] text-muted-foreground font-mono truncate">({selectedLocation.name})</span>
                                  )}
                                </motion.div>
                              )}
                            </div>
                            {isExpanded &&
                              (isSectionOpen ? (
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              ))}
                          </button>

                          {/* Tooltip in collapsed mode */}
                          {!isExpanded && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center z-50 pointer-events-none">
                              <div className="bg-[#18181c] border border-white/15 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xl whitespace-nowrap">
                                {item.label}
                              </div>
                            </div>
                          )}

                          {isExpanded && isSectionOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-7 space-y-1 pt-1 border-l border-white/10 ml-4 max-h-44 overflow-y-auto custom-scrollbar"
                            >
                              {isLocations &&
                                LOCATIONS.filter((l) => l.bookingEnabled).map((loc) => (
                                  <button
                                    key={loc.id}
                                    type="button"
                                    onClick={() => {
                                      selectLocation(loc);
                                      if (isMobile) closeMobile();
                                    }}
                                    className={`block w-full text-left py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                      selectedLocation.id === loc.id
                                        ? 'bg-primary/20 text-primary font-bold'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    {loc.name}
                                  </button>
                                ))}

                              {isTheatres &&
                                cityTheatres.map((th) => (
                                  <Link
                                    key={th.id}
                                    href={`/theatres/${th.id}`}
                                    onClick={() => isMobile && closeMobile()}
                                    className="block w-full text-left py-1.5 px-2 text-xs font-semibold rounded-lg text-gray-400 hover:text-white hover:bg-white/5 truncate"
                                  >
                                    {th.name}
                                  </Link>
                                ))}
                            </motion.div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={item.id} className="relative group">
                        <Link
                          href={item.href}
                          onClick={() => isMobile && closeMobile()}
                          className={`flex items-center ${
                            isExpanded ? 'justify-between px-3.5' : 'justify-center px-0'
                          } py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(216,33,50,0.2)]'
                              : 'text-gray-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComp className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                            {isExpanded && (
                              <motion.span
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.22, delay: 0.08 }}
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </div>
                          {isExpanded && isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </Link>

                        {/* Tooltip in collapsed mode */}
                        {!isExpanded && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center z-50 pointer-events-none">
                            <div className="bg-[#18181c] border border-white/15 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xl whitespace-nowrap">
                              {item.label}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM PROFILE / LOGIN CARD */}
        <div className="pt-3 border-t border-white/10">
          {isExpanded ? (
            <div className="bg-secondary/40 border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-xl">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    {user.photoURL || user.avatar ? (
                      <img
                        src={(user.photoURL || user.avatar) as string}
                        alt={user.name || 'User avatar'}
                        className="w-9 h-9 rounded-full object-cover border border-primary/50 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary via-rose-700 to-black text-white font-bold flex items-center justify-center text-xs border border-primary/50 shrink-0 font-heading">
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-white truncate font-heading">{user.name || 'TicketX Member'}</h4>
                      <p className="text-[10px] text-muted-foreground truncate font-mono">{user.email || user.phoneNumber || user.displayPhone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-white/10 text-xs font-bold">
                    <Link
                      href="/profile"
                      onClick={() => isMobile && closeMobile()}
                      className="py-1.5 rounded-lg bg-black/40 hover:bg-white/10 text-gray-200 text-center transition-colors border border-white/10 text-[11px]"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-center transition-colors border border-rose-500/20 text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-1 space-y-1.5">
                  <p className="text-[11px] font-bold text-white font-heading">Guest User</p>
                  <Link
                    href="/login"
                    onClick={() => isMobile && closeMobile()}
                    className="block w-full py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(216,33,50,0.3)] text-center"
                  >
                    LOGIN
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              {user ? (
                <Link
                  href="/profile"
                  className="p-1.5 rounded-full border border-primary/40 hover:border-primary transition-colors"
                  title={user.name || "Profile"}
                >
                  <User className="w-4 h-4 text-primary" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="p-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-md"
                  title="Login"
                >
                  <LogIn className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. DESKTOP COLLAPSIBLE RAIL: 68px (collapsed) <-> 260px (expanded) with 420ms easing */}
      <motion.aside
        initial={false}
        animate={{ width: isDesktopExpanded ? 260 : 68 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 bg-[#0c0c0e]/95 backdrop-blur-2xl border-r border-white/10 flex-col justify-between p-3 font-sans overflow-hidden shadow-2xl"
      >
        {renderNavContent(false)}
      </motion.aside>

      {/* 2. MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-[120] flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
              onClick={closeMobile}
            />

            {/* Mobile Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-80 max-w-[85vw] h-full bg-[#0c0c0e]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between p-4 z-10 font-sans shadow-2xl overflow-y-auto"
            >
              {renderNavContent(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
