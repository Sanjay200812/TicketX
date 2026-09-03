"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ArrowLeft, Send, Sparkles } from 'lucide-react';
import { submitVenueApplication } from '@/services/venues.service';

const POPULAR_CITIES = ['Guntur', 'Vijayawada', 'Narasaraopeta', 'Sattenapalli', 'Edlapadu', 'Martur', 'Hyderabad', 'Visakhapatnam', 'Tirupati'];
const AVAILABLE_AMENITIES = ['Dolby Atmos', '4K Barco Laser', '3D Projection', 'Luxury Recliners', 'Food Court', 'Valet Parking', 'Air Conditioned'];

export default function RegisterVenuePage() {
  const [theatreName, setTheatreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Guntur');
  const [address, setAddress] = useState('');
  const [screensCount, setScreensCount] = useState(1);
  const [seatingCapacity, setSeatingCapacity] = useState(300);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Dolby Atmos', 'Air Conditioned']);

  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleAmenity = (item: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!theatreName.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg('Please provide Theatre Name, Phone Number, and Email.');
      return;
    }

    setSubmitting(true);
    try {
      const id = await submitVenueApplication({
        theatreName,
        ownerName,
        email,
        phone,
        city,
        address,
        screensCount,
        seatingCapacity,
        facilities: selectedAmenities,
        formats: ['2D', '4K'],
      });
      setSubmittedId(id);
    } catch {
      setErrorMsg('Failed to submit venue application. Please try again or contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          href="/partners"
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Partners Overview</span>
        </Link>

        {submittedId ? (
          <div className="p-8 md:p-12 bg-secondary/50 border border-emerald-500/40 rounded-3xl text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-white">
              Application Submitted Successfully!
            </h2>
            <p className="text-xs md:text-sm text-gray-300 max-w-md mx-auto">
              Thank you for listing <strong className="text-white">{theatreName}</strong> on TicketX. Our onboarding team has received your details and will get in touch within 24 hours.
            </p>
            <div className="p-3 bg-black/40 border border-white/10 rounded-xl font-mono text-xs text-gray-400 max-w-xs mx-auto">
              Reference ID: <span className="text-primary font-bold">{submittedId}</span>
            </div>
            <div className="pt-4">
              <Link
                href="/"
                className="inline-block px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-secondary/40 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TicketX Partner Network</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading text-white">
                Register Your Cinema or Hall
              </h1>
              <p className="text-xs text-muted-foreground">
                Join TicketX to start selling online movie tickets and managing live shows.
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-destructive/20 border border-destructive/40 text-destructive text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5 font-mono">
                    Cinema / Hall Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={theatreName}
                    onChange={(e) => setTheatreName(e.target.value)}
                    placeholder="e.g. Sree Ramachandra 4K Laser"
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5 font-mono">
                    Owner / Manager Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Venkatesh Rao"
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5 font-mono">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="management@theatre.com"
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5 font-mono">
                    Phone (+91) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5 font-mono">
                    City / Region *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white outline-none"
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5 font-mono">
                    Number of Screens
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={screensCount}
                    onChange={(e) => setScreensCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5 font-mono">
                    Approx Seating Capacity
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={seatingCapacity}
                    onChange={(e) => setSeatingCapacity(parseInt(e.target.value, 10) || 100)}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5 font-mono">
                  Full Physical Address
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Landmark, Area, Pincode"
                  className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2 font-mono">
                  Amenities &amp; Facilities
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_AMENITIES.map((am) => {
                    const active = selectedAmenities.includes(am);
                    return (
                      <button
                        type="button"
                        key={am}
                        onClick={() => toggleAmenity(am)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          active
                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                            : 'bg-black/50 border border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {am}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 mt-4"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Application...' : 'Submit Partnership Application'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
