"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Menu, MapPin, ChevronDown, X, LogOut, Ticket, Heart, Store } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { CitySelectorModal } from '@/components/location/CitySelectorModal';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const { selectedLocation, setIsCityModalOpen } = useLocation();
  const { user, logout } = useAuth();
  const { favoriteIds } = useFavorites();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Requirement 33, 35, 63: Navigation items including Register Your Hall
  const navLinks = [
    { name: 'Movies', href: '/movies' },
    { name: 'Events', href: '/events' },
    { name: 'Theatres', href: '/theatres' },
    { name: 'Favorites', href: '/favorites' },
    { name: 'Register', href: '/register' },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'bg-black/85 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 relative group">
              <span className="text-2xl font-bold tracking-tighter text-white font-heading">
                Ticket<span className="text-primary">X</span>
              </span>
            </Link>

            {/* City Location Button */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-gray-200 border border-white/10 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{selectedLocation?.name || 'Select City'}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-white relative flex items-center gap-1.5',
                    isActive ? 'text-white' : 'text-gray-400'
                  )}
                >
                  {link.name === 'Favorites' && (
                    <Heart className={`w-3.5 h-3.5 ${favoriteIds.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
                  )}
                  {link.name === 'Register' && (
                    <Store className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  {link.name}
                  {link.name === 'Favorites' && favoriteIds.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-bold">
                      {favoriteIds.length}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Requirement 24, 62: Global Search Trigger Button */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="text-gray-300 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 flex items-center gap-1.5 text-xs font-semibold"
              title="Search Movies, Theatres & Events"
            >
              <Search className="w-5 h-5 text-primary" />
              <span className="hidden lg:inline text-gray-300 font-normal">Search</span>
            </button>

            <Link
              href="/favorites"
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors relative"
              title="Saved Movies"
            >
              <Heart className={`w-4 h-4 ${favoriteIds.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            </Link>

            <Link
              href="/my-bookings"
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <Ticket className="w-4 h-4 text-primary" />
              <span>My Bookings</span>
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user.name || 'Account'}</span>
                </Link>

                <button
                  onClick={logout}
                  className="text-xs text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center justify-center font-bold text-xs px-4 py-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(216,33,50,0.3)]"
              >
                Login
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#121212] border-b border-white/10 p-6 md:hidden flex flex-col gap-4 shadow-2xl"
          >
            {/* Global Search Trigger in Mobile Menu */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSearchModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-bold text-gray-200 mb-1"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" /> Search Movies, Theatres, Events
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">🔍</span>
            </button>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-gray-200 hover:text-primary transition-colors py-1 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {link.name === 'Register' && <Store className="w-4 h-4 text-amber-400" />}
                  {link.name}
                </span>
                {link.name === 'Favorites' && favoriteIds.length > 0 && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                    {favoriteIds.length}
                  </span>
                )}
              </Link>
            ))}
            <div className="h-px bg-white/10 my-1" />
            <Link
              href="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-gray-200 hover:text-primary transition-colors"
            >
              My Bookings
            </Link>
            {user ? (
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-primary flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> My Account ({user.name || 'User'})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-destructive font-bold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-primary flex items-center gap-2 pt-2"
              >
                <User className="w-4 h-4" /> Login / Register
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <CitySelectorModal />
      <GlobalSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}
