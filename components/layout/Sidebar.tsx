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
  Store,
  ChevronDown,
  ChevronRight,
  X,
  Building,
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
  Store,
  Building,
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { location, setIsCityModalOpen } = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ Theatres: false, Locations: false });

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isVenueOwner = user?.role === 'venue_owner' || user?.role === 'admin';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer Sidebar Content */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-72 max-w-[85vw] h-full bg-[#121216] border-r border-white/10 flex flex-col justify-between p-5 z-10 font-sans shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <Link href="/" onClick={onClose} className="flex items-center gap-2">
                  <span className="text-xl font-black font-heading tracking-wider text-white">
                    TICKET<span className="text-primary">X</span>
                  </span>
                </Link>
                <button
                  onClick={onClose}
                  className="p-1 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                  aria-label="Close Navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Group Sections */}
              <div className="space-y-6">
                {SIDEBAR_NAV_SECTIONS.map((section) => {
                  // Requirement 45, 46, 72, 73: Role-based PARTNER section filtering
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

            {/* Footer Location Summary */}
            <div className="pt-4 border-t border-white/10 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px]">Selected Location</span>
                <span className="font-bold text-white font-mono">{location.city.name}</span>
              </div>
              <p className="text-[10px] text-gray-500">TicketX Platform v2.0 • Andhra Pradesh</p>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
