"use client";

import Link from 'next/link';
import { Settings as SettingsIcon, MapPin, HelpCircle, User, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth, formatIndianPhone } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { Button } from '@/components/ui/button';

import { TicketXHeading } from '@/components/shared/TicketXHeading';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { location, setIsCityModalOpen } = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">
        {/* Page Header */}
        <div className="mb-8 pb-4 border-b border-white/10">
          <TicketXHeading
            subtitle="Manage your account profile, location preferences, and help options."
            size="lg"
            icon={<SettingsIcon className="w-7 h-7" />}
          >
            Settings
          </TicketXHeading>
        </div>

        <div className="space-y-6">
          {/* SECTION 1: USER PROFILE INFORMATION */}
          <div className="bg-secondary/30 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-base text-white font-heading flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Profile Information
              </h3>
              {user && (
                <span className="text-[10px] font-mono uppercase bg-primary/20 text-primary px-2.5 py-0.5 rounded font-bold border border-primary/30">
                  {user.role || 'customer'}
                </span>
              )}
            </div>

            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3.5 bg-black/40 p-4 rounded-2xl border border-white/10">
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
                    <p className="font-bold text-sm text-white truncate">{user.name || 'TicketX Customer'}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{formatIndianPhone(user.phoneNumber || user.phone)}</p>
                    <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Mobile Verified Customer
                    </p>

                  </div>

                  <Link href="/profile">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold border-white/10 gap-1">
                      Edit <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/10">
                <div>
                  <p className="font-bold text-sm text-white">Not Logged In</p>
                  <p className="text-xs text-muted-foreground">Sign in to sync your bookings and saved movies.</p>
                </div>
                <Link href="/login">
                  <Button size="sm" className="rounded-xl text-xs font-bold">
                    Login / Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* SECTION 2: LOCATION CONTEXT & PREFERENCES */}
          <div className="bg-secondary/30 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-base text-white font-heading flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" /> Location Preference
              </h3>
            </div>

            <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/10">
              <div>
                <p className="font-bold text-sm text-white">{location.city.name}</p>
                <p className="text-xs text-muted-foreground">{location.city.state || 'Andhra Pradesh'}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCityModalOpen(true)}
                className="rounded-xl text-xs font-bold border-white/10"
              >
                Change City
              </Button>
            </div>
          </div>

          {/* SECTION 3: HELP & INFORMATION LINKS */}
          <div className="bg-secondary/30 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-white font-heading flex items-center gap-2 pb-2 border-b border-white/10">
              <HelpCircle className="w-4 h-4 text-primary" /> Support &amp; Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
              <Link href="/support" className="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-white/20 text-gray-200 block">
                Support Hub &amp; Chatbot
              </Link>
              <Link href="/support/faq" className="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-white/20 text-gray-200 block">
                Frequently Asked Questions
              </Link>
              <Link href="/support/feedback" className="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-white/20 text-gray-200 block">
                Send Feedback
              </Link>
              <Link href="/partners" className="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-white/20 text-gray-200 block text-amber-300">
                Partner Hall Registration Info
              </Link>
            </div>
          </div>

          {/* SECTION 4: LOGOUT ACTION BUTTON */}
          {user && (
            <div className="pt-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full rounded-2xl py-5 font-bold text-xs text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 gap-2"
              >
                <LogOut className="w-4 h-4" /> Log Out of TicketX
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
