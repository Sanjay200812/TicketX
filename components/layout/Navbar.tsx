"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, MapPin, ChevronDown, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { CitySelectorModal } from '@/components/location/CitySelectorModal';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';
import { UserMenu } from './UserMenu';
import { Sidebar } from './Sidebar';
import { TOP_NAV_ITEMS } from '@/config/navigation';

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { selectedLocation, setIsCityModalOpen } = useLocation();
  const { user } = useAuth();
  const { favoriteIds } = useFavorites();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-4'
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between" ref={dropdownRef}>
          {/* Logo & City Selector */}
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 relative group">
              <span className="text-2xl font-black tracking-tighter text-white font-heading">
                TICKET<span className="text-primary">X</span>
              </span>
            </Link>

            {/* City Location Button */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-gray-200 border border-white/10 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{selectedLocation?.name || 'Select City'}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {TOP_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const isDropdownOpen = activeDropdown === item.label;

              if (item.hasDropdown) {
                return (
                  <div key={item.label} className="relative">
                    <button
                      onClick={() => {
                        if (item.label === 'LOCATIONS') {
                          setIsCityModalOpen(true);
                        } else {
                          setActiveDropdown(isDropdownOpen ? null : item.label);
                        }
                      }}
                      className={cn(
                        'text-xs font-bold tracking-wider transition-colors hover:text-white flex items-center gap-1 py-1 uppercase',
                        isActive || isDropdownOpen ? 'text-white' : 'text-gray-300'
                      )}
                    >
                      <span>{item.label}</span>
                      {/* Dropdown Arrow ONLY on Theatres & Locations */}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180 text-primary' : 'text-gray-400'}`} />
                    </button>

                    {/* Theatres / Locations Dropdown Box */}
                    <AnimatePresence>
                      {isDropdownOpen && item.children && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute left-0 mt-2 w-48 bg-[#141418] border border-white/15 rounded-2xl shadow-2xl py-2 z-50 font-sans text-xs"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              onClick={() => setActiveDropdown(null)}
                              className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium"
                            >
                              {child.label}
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

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Search Icon Trigger */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 flex items-center gap-1.5 text-xs font-semibold"
              title="Search Movies, Theatres & Events"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-primary" />
            </button>

            {/* Saved Movies Heart Icon ONLY */}
            <Link
              href="/favorites"
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors relative"
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

            {/* User Account / Login Button */}
            {user ? (
              <UserMenu />
            ) : (
              <Link
                href="/login"
                className="font-extrabold text-xs px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(216,33,50,0.3)]"
              >
                LOGIN
              </Link>
            )}

            {/* Sidebar / Mobile Menu Drawer Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
              aria-label="Open navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Unified Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Global Search Modal */}
      <CitySelectorModal />
      <GlobalSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}
