"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Building2, CheckCircle2, AlertCircle, Upload, ShieldCheck, MapPin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const AVAILABLE_FACILITIES = [
  'Air Conditioning',
  'Dolby Atmos',
  '4K Projection',
  '2K Projection',
  'Recliners',
  'Parking',
  'Food & Beverages',
  'Wheelchair Access',
  'Restrooms',
  'Stage',
  'Green Room',
  'VIP Area',
  'Balcony',
];

export default function RegisterHallPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [contactName, setContactName] = useState(user?.name || '');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [alternatePhone, setAlternatePhone] = useState('');

  const [venueType, setVenueType] = useState<'movie_theatre' | 'event_hall' | 'multipurpose'>('movie_theatre');
  const [bookingType, setBookingType] = useState<'movies' | 'events' | 'both'>('movies');

  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Andhra Pradesh');
  const [pincode, setPincode] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');

  const [screensCount, setScreensCount] = useState<number>(1);
  const [capacity, setCapacity] = useState<number>(300);
  const [stageAvailable, setStageAvailable] = useState<boolean>(false);

  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(['Air Conditioning', 'Parking', 'Restrooms']);

  const [acceptsOnlineBookings, setAcceptsOnlineBookings] = useState<boolean>(false);
  const [existingPlatform, setExistingPlatform] = useState('');

  const [preferredContact, setPreferredContact] = useState<'phone' | 'email' | 'whatsapp'>('whatsapp');
  const [bestContactTime, setBestContactTime] = useState('10:00 AM - 6:00 PM');

  // Requirement 45: Upload Seating Layout
  const [seatingLayoutUrl, setSeatingLayoutUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError('Please confirm that you are authorized to register this venue.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register-venue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          contactName,
          businessName,
          email,
          phone,
          alternatePhone,
          venueType,
          bookingType,
          address,
          locality,
          city,
          district,
          state,
          pincode,
          mapsUrl,
          screensCount: Number(screensCount),
          capacity: Number(capacity),
          stageAvailable,
          facilities: selectedFacilities,
          acceptsOnlineBookings,
          existingPlatform,
          preferredContact,
          bestContactTime,
          seatingLayoutUrl,
          notes,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit registration request.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setLoading(false);
      setError('A network error occurred. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center px-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-secondary/40 border border-white/10 p-8 rounded-3xl text-center space-y-5 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white">Registration Received</h2>
          <p className="text-sm text-gray-300">
            Thank you for your interest in TicketX. Our team will review your venue details and contact you via <strong className="text-emerald-400 uppercase">{preferredContact}</strong>.
          </p>
          <div className="bg-black/50 p-4 rounded-2xl border border-white/10 text-xs font-mono text-gray-400">
            Status: <span className="text-amber-400 font-bold uppercase">Pending Review</span>
          </div>
          <Button
            onClick={() => (window.location.href = '/')}
            className="w-full rounded-xl font-bold py-5 bg-primary text-white"
          >
            Return to TicketX Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-4 shadow-lg">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-3">Register Your Hall</h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            List your movie theatre, auditorium or event venue on TicketX to reach thousands of cinema &amp; live show lovers.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: REGISTRATION TYPE */}
          <div className="bg-secondary/30 border border-white/10 p-6 md:p-8 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Building2 className="w-5 h-5 text-amber-400" /> 1. Venue &amp; Booking Type
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">What would you like to register?</label>
                <select
                  value={venueType}
                  onChange={(e) => setVenueType(e.target.value as 'movie_theatre' | 'event_hall' | 'multipurpose')}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-primary outline-none font-medium"
                >
                  <option value="movie_theatre">Movie Theatre / Cinema</option>
                  <option value="event_hall">Event Hall / Auditorium</option>
                  <option value="multipurpose">Multipurpose Venue</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">Booking Category Needed</label>
                <select
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value as 'movies' | 'events' | 'both')}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-primary outline-none font-medium"
                >
                  <option value="movies">Movie Ticket Booking</option>
                  <option value="events">Event Ticket Booking</option>
                  <option value="both">Both (Movies &amp; Live Events)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: OWNER / CLIENT DETAILS */}
          <div className="bg-secondary/30 border border-white/10 p-6 md:p-8 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Mail className="w-5 h-5 text-primary" /> 2. Owner &amp; Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Contact Person Name *</label>
                <Input
                  required
                  placeholder="e.g. Arshad Khan"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Business / Venue Name *</label>
                <Input
                  required
                  placeholder="e.g. Geetha Multiplex or StarX Auditorium"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Email Address *</label>
                <Input
                  type="email"
                  required
                  placeholder="owner@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Phone Number *</label>
                <Input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Alternate Phone (Optional)</label>
                <Input
                  type="tel"
                  placeholder="9876543211"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: LOCATION DETAILS */}
          <div className="bg-secondary/30 border border-white/10 p-6 md:p-8 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <MapPin className="w-5 h-5 text-emerald-400" /> 3. Venue Location Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Full Street Address *</label>
                <Input
                  required
                  placeholder="Door No, Street Name, Landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Area / Locality</label>
                <Input
                  placeholder="e.g. Cinema Hall Road"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">City / Town *</label>
                <Input
                  required
                  placeholder="e.g. Narasaraopeta"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">District</label>
                <Input
                  placeholder="e.g. Palnadu / Guntur"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">State *</label>
                <Input
                  required
                  placeholder="Andhra Pradesh"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">PIN Code *</label>
                <Input
                  required
                  placeholder="522601"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-sm font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Google Maps Link (Optional)</label>
                <Input
                  placeholder="https://maps.google.com/..."
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: VENUE CAPACITY & FACILITIES */}
          <div className="bg-secondary/30 border border-white/10 p-6 md:p-8 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <ShieldCheck className="w-5 h-5 text-rose-400" /> 4. Venue Capacity &amp; Facilities
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Number of Screens / Halls</label>
                <Input
                  type="number"
                  min={1}
                  value={screensCount}
                  onChange={(e) => setScreensCount(Number(e.target.value))}
                  className="bg-black/50 border-white/10 text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Approximate Total Capacity</label>
                <Input
                  type="number"
                  min={10}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="bg-black/50 border-white/10 text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">Stage Available?</label>
                <select
                  value={stageAvailable ? 'yes' : 'no'}
                  onChange={(e) => setStageAvailable(e.target.value === 'yes')}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-primary outline-none font-medium"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">Currently Accept Online Bookings?</label>
                <select
                  value={acceptsOnlineBookings ? 'yes' : 'no'}
                  onChange={(e) => setAcceptsOnlineBookings(e.target.value === 'yes')}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-primary outline-none font-medium"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              {acceptsOnlineBookings && (
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Existing Platform Name</label>
                  <Input
                    placeholder="e.g. BookMyShow / Paytm"
                    value={existingPlatform}
                    onChange={(e) => setExistingPlatform(e.target.value)}
                    className="bg-black/50 border-white/10 text-white text-sm"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">Preferred Contact Method</label>
                <select
                  value={preferredContact}
                  onChange={(e) => setPreferredContact(e.target.value as 'phone' | 'email' | 'whatsapp')}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-primary outline-none font-medium"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Phone Call</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Best Time to Contact</label>
                <Input
                  placeholder="e.g. 10:00 AM - 6:00 PM"
                  value={bestContactTime}
                  onChange={(e) => setBestContactTime(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-3">Available Facilities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {AVAILABLE_FACILITIES.map((facility) => {
                  const isChecked = selectedFacilities.includes(facility);
                  return (
                    <button
                      type="button"
                      key={facility}
                      onClick={() => toggleFacility(facility)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                          : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>{facility}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 5: SEATING LAYOUT UPLOAD (Requirement 45) */}
          <div className="bg-secondary/30 border border-white/10 p-6 md:p-8 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Upload className="w-5 h-5 text-emerald-400" /> 5. Seating Layout Upload (Important)
            </h3>
            <p className="text-xs text-muted-foreground">
              Provide an image URL or document link showing your hall&apos;s seating map, row layout, screen direction, and entrance corridors so our onboarding team can configure your exact digital seat map.
            </p>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Seating Layout Image / PDF Link</label>
              <Input
                placeholder="https://example.com/seating-map.png"
                value={seatingLayoutUrl}
                onChange={(e) => setSeatingLayoutUrl(e.target.value)}
                className="bg-black/50 border-white/10 text-white text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Additional Notes / Custom Requirements</label>
              <textarea
                rows={3}
                placeholder="Tell us anything else about your venue, booking requirements or seating configuration..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* CONSENT & SUBMIT */}
          <div className="space-y-4">
            <label className="flex items-start gap-3 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black/40 text-primary focus:ring-primary"
              />
              <span>
                I confirm that the information provided is accurate and I am authorized to represent this venue for TicketX listing.
              </span>
            </label>

            <Button
              type="submit"
              disabled={loading || !consent}
              className="w-full h-14 rounded-2xl font-extrabold text-lg shadow-[0_0_25px_rgba(216,33,50,0.4)]"
            >
              {loading ? 'Submitting Registration...' : 'SUBMIT REGISTRATION'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
