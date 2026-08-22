"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Ticket, MapPin, ChevronRight, Edit3, CheckCircle2, AlertCircle, Store, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { getBookings } from '@/lib/storage';
import { Booking } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VenueRegistrationRequest } from '@/lib/serverVenueStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUsername, logout } = useAuth();
  const { location, setIsCityModalOpen } = useLocation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venueRegistrations, setVenueRegistrations] = useState<VenueRegistrationRequest[]>([]);

  // Profile Edit State
  const [editing, setEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setBookings(getBookings());
    setUsernameInput(user.name || '');

    // Fetch user venue registrations (Requirement 53)
    const fetchRegistrations = async () => {
      try {
        const query = user.id ? `userId=${encodeURIComponent(user.id)}` : `email=${encodeURIComponent(user.email || '')}`;
        const res = await fetch(`/api/register-venue?${query}`);
        if (res.ok) {
          const data = await res.json();
          setVenueRegistrations(data.registrations || []);
        }
      } catch (err) {
        console.error('Failed to fetch user venue registrations:', err);
      }
    };

    fetchRegistrations();
  }, [user, router]);

  if (!user) return null;

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    const res = updateUsername(usernameInput);
    if (!res.success) {
      setSaveError(res.error || 'Failed to update username');
      return;
    }

    setSaveSuccess('Username updated successfully.');
    setEditing(false);
    setTimeout(() => setSaveSuccess(null), 5000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* User Account Header */}
        <div className="bg-secondary/40 border border-white/10 rounded-2xl p-6 md:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(216,33,50,0.3)]">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
                <span>{user.name || 'My TicketX Account'}</span>
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </h1>
              <p className="text-sm font-mono text-primary mt-1 font-semibold">
                {user.email || user.displayPhone || user.phone || 'TicketX Member'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="rounded-xl border-white/10 text-gray-300 hover:text-white hover:bg-white/5 gap-2 font-bold"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        {/* Username Success / Error Banners */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center gap-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {saveError && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm font-bold flex items-center gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Edit Username Card Form */}
        {editing && (
          <form onSubmit={handleSaveUsername} className="bg-secondary/40 border border-white/10 rounded-2xl p-6 mb-8 space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-bold text-lg text-white font-heading">Edit Display Username</h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs text-muted-foreground hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Username / Display Name</label>
              <Input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter your display username"
                className="bg-black/40 border-white/15 text-white font-semibold text-sm max-w-md"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="rounded-xl font-bold px-6">
                SAVE CHANGES
              </Button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link
            href="/my-bookings"
            className="bg-secondary/30 border border-white/10 hover:border-primary/40 rounded-xl p-5 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5 text-primary" />
              <div>
                <p className="font-bold text-white group-hover:text-primary transition-colors">My Bookings</p>
                <p className="text-xs text-muted-foreground">{bookings.length} Saved Passes</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={() => setIsCityModalOpen(true)}
            className="bg-secondary/30 border border-white/10 hover:border-primary/40 rounded-xl p-5 flex items-center justify-between transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="font-bold text-white group-hover:text-primary transition-colors">Saved Location</p>
                <p className="text-xs text-muted-foreground">{location.city.name}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </button>

          <Link
            href="/register"
            className="bg-secondary/30 border border-white/10 hover:border-amber-500/40 rounded-xl p-5 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-bold text-white group-hover:text-amber-400 transition-colors">Register Hall</p>
                <p className="text-xs text-muted-foreground">List your theatre or venue</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* SECTION: MY VENUE REGISTRATIONS (Requirement 53) */}
        {venueRegistrations.length > 0 && (
          <div className="bg-secondary/40 border border-white/10 rounded-2xl p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-lg text-white font-heading flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" /> My Venue Registrations ({venueRegistrations.length})
              </h3>
              <span className="text-xs font-mono text-muted-foreground uppercase">CLIENT ENQUIRIES</span>
            </div>

            <div className="space-y-3">
              {venueRegistrations.map((req) => (
                <div key={req.id} className="bg-black/50 border border-white/10 rounded-xl p-4 flex items-center justify-between font-mono text-xs">
                  <div>
                    <p className="font-bold text-sm text-white">{req.businessName}</p>
                    <p className="text-muted-foreground text-xs">{req.city}, {req.state} • {req.venueType.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Submitted: {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full font-bold uppercase text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-spin" /> {req.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
