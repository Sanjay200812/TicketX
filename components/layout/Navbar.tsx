"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, MapPin, ChevronDown, Heart, Ticket } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useSidebar } from '@/context/SidebarContext';
import { CitySelectorModal } from '@/components/location/CitySelectorModal';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';
import { Sidebar } from './Sidebar';
import { TOP_NAV_ITEMS } from '@/config/navigation';
import { getTheatresForLocation } from '@/lib/data';

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { toggleSidebar, isDesktopExpanded } = useSidebar();

  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { selectedLocation, setIsCityModalOpen } = useLocation();
  const { user } = useAuth();
  const { favoriteIds } = useFavorites();

  // Theatres for current active city
  const cityTheatres = getTheatresForLocation(selectedLocation.id);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          isDesktopExpanded ? 'lg:pl-[260px]' : 'lg:pl-[68px]',
          scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-4'
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between" ref={dropdownRef}>
          {/* LEFT: Sidebar Opener (Mobile Hamburger) + Logo + City Selector */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Hamburger / Sidebar Menu Button on Mobile */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center justify-center focus:outline-none cursor-pointer"
              aria-label="Open navigation drawer"
              title="Menu"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>

            {/* TicketX Logo */}
            <Link href="/" className="flex items-center gap-2 relative group">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading">
                Ticket<span className="text-primary">X</span>
              </span>
            </Link>

            {/* City Location Selector Button (Visible on both Mobile & Desktop) */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-gray-200 border border-white/10 transition-all shrink-0"
              title="Change City"
            >
              <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[80px] sm:max-w-[120px]">{selectedLocation?.name || 'Select City'}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
            </button>
          </div>

          {/* CENTER: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {TOP_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const isDropdownOpen = activeDropdown === item.label;

              if (item.hasDropdown && item.label === 'THEATRES') {
                return (
                  <div key={item.label} className="relative">
                    <button
                      onClick={() => setActiveDropdown(isDropdownOpen ? null : item.label)}
                      className={cn(
                        'text-xs font-bold tracking-wider transition-colors hover:text-white flex items-center gap-1 py-1 uppercase',
                        isActive || isDropdownOpen ? 'text-white' : 'text-gray-300'
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180 text-primary' : 'text-gray-400'}`} />
                    </button>

                    {/* Theatres Dropdown Box with city-isolated items */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute left-0 mt-2 w-56 bg-[#141418] border border-white/15 rounded-2xl shadow-2xl py-2 z-50 font-sans text-xs"
                        >
                          <Link
                            href="/theatres"
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-2 text-primary font-bold hover:bg-white/5 transition-colors border-b border-white/5"
                          >
                            All Theatres Directory →
                          </Link>

                          <div className="px-4 py-1.5 text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-wider">
                            In {selectedLocation.name}:
                          </div>

                          {cityTheatres.map((th) => (
                            <Link
                              key={th.id}
                              href={`/theatres/${th.id}`}
                              onClick={() => setActiveDropdown(null)}
                              className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium truncate"
                            >
                              {th.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'text-xs font-bold tracking-wider transition-colors hover:text-white uppercase relative',
                    isActive ? 'text-white' : 'text-gray-300'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Search | ♡ Saved Movies | 🎟 My Bookings | Login / Compact Avatar */}
          <div className="flex items-center gap-2.5 md:gap-3.5">
            {/* Search Icon Trigger */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 flex items-center justify-center"
              title="Search Movies, Theatres & Events"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-primary" />
            </button>

            {/* Saved Movies Heart Icon */}
            <Link
              href="/favorites"
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors relative flex items-center justify-center"
              title="Saved Movies"
              aria-label="Saved Movies"
            >
              <Heart className={`w-5 h-5 ${favoriteIds.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {favoriteIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white font-mono text-[9px] font-black flex items-center justify-center border border-black">
                  {favoriteIds.length}
                </span>
              )}
            </Link>

            {/* My Bookings Icon Control */}
            <Link
              href={user ? "/my-bookings" : "/login?redirect=/my-bookings"}
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors relative flex items-center justify-center"
              title="My Bookings"
              aria-label="My Bookings"
            >
              <Ticket className="w-5 h-5 text-amber-400" />
            </Link>

            {/* Login / Compact Account Control */}
            {user ? (
              <Link
                href="/profile"
                className="p-1 rounded-full border border-primary/40 text-white hover:bg-white/10 transition-all flex items-center justify-center ml-1"
                title={user.name || "Profile"}
                aria-label="Profile"
              >
                {user.photoURL || user.avatar ? (
                  <img src={(user.photoURL || user.avatar) as string} alt={user.name || "User"} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-[10px]">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            ) : (
              <Link
                href="/login"
                className="font-extrabold text-xs px-3.5 py-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors shadow-[0_0_12px_rgba(216,33,50,0.3)] ml-1"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Unified Left Sidebar Component */}
      <Sidebar onOpenSearchModal={() => setIsSearchModalOpen(true)} />

      {/* Global Search & Location Modals */}
      <CitySelectorModal />
      <GlobalSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}
