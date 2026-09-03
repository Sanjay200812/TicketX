"use client";

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Film,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  Building2,
  Tv,
  Grid,
  Clock,
  MapPin,
  Ticket,
  CreditCard,
  RotateCcw,
  Tag,
  Store,
  Users,
  ShieldAlert,
  ShieldCheck,
  Bell,
  Headphones,
  MessageSquare,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { ROLE_LABELS } from '@/lib/admin/permissions';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  exact?: boolean;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    title: 'DASHBOARD',
    items: [
      { name: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { name: 'Movies', href: '/admin/movies', icon: Film },
      { name: 'Events', href: '/admin/events', icon: Calendar },
      { name: 'Homepage CMS', href: '/admin/homepage', icon: Sparkles },
      { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
    ],
  },
  {
    title: 'CINEMA',
    items: [
      { name: 'Theatres', href: '/admin/theatres', icon: Building2 },
      { name: 'Screens', href: '/admin/screens', icon: Tv },
      { name: 'Seat Layouts', href: '/admin/seat-layouts', icon: Grid },
      { name: 'Shows', href: '/admin/shows', icon: Clock },
      { name: 'Locations', href: '/admin/locations', icon: MapPin },
    ],
  },
  {
    title: 'TRANSACTIONS',
    items: [
      { name: 'Bookings', href: '/admin/bookings', icon: Ticket },
      { name: 'Payments', href: '/admin/payments', icon: CreditCard },
      { name: 'Refunds', href: '/admin/refunds', icon: RotateCcw },
      { name: 'Coupons', href: '/admin/coupons', icon: Tag },
    ],
  },
  {
    title: 'PARTNERS',
    items: [
      { name: 'Venue Applications', href: '/admin/venue-applications', icon: Store },
      { name: 'Venue Owners', href: '/admin/venue-owners', icon: Building2 },
    ],
  },

  {
    title: 'USERS',
    items: [
      { name: 'Customers', href: '/admin/users', icon: Users },
      { name: 'Admins', href: '/admin/admins', icon: ShieldCheck },
      { name: 'Roles', href: '/admin/roles', icon: ShieldAlert },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      { name: 'Notifications', href: '/admin/notifications', icon: Bell },
      { name: 'Support', href: '/admin/support', icon: Headphones },
      { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ isMobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          const b: Record<string, number> = {};
          if (data.stats.pendingVenueApplications > 0) {
            b['/admin/venue-applications'] = data.stats.pendingVenueApplications;
          }
          if (data.stats.openSupportTickets > 0) {
            b['/admin/support'] = data.stats.openSupportTickets;
          }
          if (data.stats.pendingRefunds > 0) {
            b['/admin/refunds'] = data.stats.pendingRefunds;
          }
          setBadges(b);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const isActive = (item: SidebarItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };


  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#121418] border-r border-white/10 text-gray-300">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black shrink-0">
            TX
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-heading font-black text-sm tracking-wider text-white">
                TICKET<span className="text-primary">X</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold">
                Admin Panel
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5 custom-scrollbar">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 py-1 text-[10px] font-bold font-mono tracking-wider text-gray-400 uppercase">
                {group.title}
              </div>
            ) : (
              <div className="my-1 border-t border-white/10" />
            )}

            {group.items.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1">{item.name}</span>
                      {badges[item.href] !== undefined && badges[item.href] > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-primary/20 text-primary border border-primary/30'
                          }`}
                        >
                          {badges[item.href]}
                        </span>
                      )}
                    </>
                  )}

                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Admin Footer */}
      <div className="p-3 border-t border-white/10 bg-black/20 shrink-0">
        {!isCollapsed ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">
                  {admin?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-gray-400 truncate">{admin?.email}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-primary/20 text-primary border border-primary/30 uppercase shrink-0">
                {admin ? ROLE_LABELS[admin.role] : 'ADMIN'}
              </span>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={logout}
              className="p-2 rounded-xl text-red-400 hover:bg-red-500/10"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
