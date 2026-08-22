"use client";

import Link from 'next/link';
import { Settings as SettingsIcon, Moon, Sun, Monitor, MapPin, HelpCircle, Shield, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, setRole } = useAuth();
  const { location, setIsCityModalOpen } = useLocation();

  const isVenueOwner = user?.role === 'venue_owner' || user?.role === 'admin';

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-white">App Settings</h1>
            <p className="text-xs text-muted-foreground">Manage appearance, location preferences, and account permissions.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* SECTION 1: APPEARANCE & THEME */}
          <div className="bg-secondary/30 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-base text-white font-heading flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" /> Appearance Theme
              </h3>
              <span className="text-[10px] font-mono uppercase bg-white/5 px-2 py-0.5 rounded text-gray-400">
                Active: {theme}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-400" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(216,33,50,0.3)]'
                    : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Moon className="w-5 h-5 text-primary" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                  theme === 'system'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Monitor className="w-5 h-5 text-emerald-400" />
                <span>Device Default</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-400">
              Device Default automatically syncs TicketX with your OS/browser <code className="font-mono text-emerald-400">prefers-color-scheme</code>.
            </p>
          </div>

          {/* SECTION 2: SAVED LOCATIONS */}
          <div className="bg-secondary/30 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-base text-white font-heading flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" /> Location Context
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

          {/* SECTION 3: ROLE PERMISSION MODE */}
          <div className="bg-secondary/30 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-base text-white font-heading flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" /> Account Mode &amp; Permissions
              </h3>
              <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded font-bold border border-amber-500/30">
                {user?.role || 'customer'}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-300">
                Toggle your account mode to test venue owner partner features (Register Your Hall in sidebar, My Venue Registrations):
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex-1 p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    !isVenueOwner
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {!isVenueOwner && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Customer Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('venue_owner')}
                  className={`flex-1 p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isVenueOwner
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {isVenueOwner && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Venue Owner Partner Mode</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 4: HELP & SUPPORT LINKS */}
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
                For Venue Owners &amp; Hall Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
