"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminTheatreInput, saveTheatre } from '@/services/theatres.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

const AVAILABLE_FACILITIES = [
  'Dolby Atmos',
  '4K Barco Laser',
  '4K Projection',
  '3D',
  'Recliner Seats',
  'Food Court',
  'Snack Bar',
  'Air Conditioned',
  'Parking',
  'Valet Parking',
  'Wheelchair Access',
  'Online Booking',
  'Restrooms',
];

const AVAILABLE_FORMATS = ['2D', '3D', '4K', 'IMAX', 'Dolby Cinema'];

const LOCATIONS_LIST = [
  { id: 'guntur', name: 'Guntur' },
  { id: 'vijayawada', name: 'Vijayawada' },
  { id: 'nrt', name: 'Narasaraopeta' },
  { id: 'sattenapalli', name: 'Sattenapalli' },
  { id: 'edlapadu', name: 'Edlapadu' },
  { id: 'martur', name: 'Martur' },
  { id: 'hyderabad', name: 'Hyderabad' },
];

interface TheatreFormProps {
  initialData?: AdminTheatreInput | null;
  isNew?: boolean;
}

export function TheatreForm({ initialData, isNew = false }: TheatreFormProps) {
  const router = useRouter();
  const { admin } = useAdminAuth();

  const [form, setForm] = useState<AdminTheatreInput>(() => ({
    id: initialData?.id || '',
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    locationId: initialData?.locationId || 'guntur',
    area: initialData?.area || '',
    address: initialData?.address || '',
    status: initialData?.status || 'available',
    facilities: initialData?.facilities || ['Air Conditioned', 'Parking', 'Snack Bar'],
    format: initialData?.format || ['2D', '4K'],
    contactNumber: initialData?.contactNumber || '',
    email: initialData?.email || '',
    mapsUrl: initialData?.mapsUrl || '',
    description: initialData?.description || '',
  }));

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleFacility = (facility: string) => {
    setForm((prev) => {
      const existing = prev.facilities || [];
      const updated = existing.includes(facility)
        ? existing.filter((f) => f !== facility)
        : [...existing, facility];
      return { ...prev, facilities: updated };
    });
  };

  const toggleFormat = (fmt: string) => {
    setForm((prev) => {
      const existing = prev.format || [];
      const updated = existing.includes(fmt)
        ? existing.filter((f) => f !== fmt)
        : [...existing, fmt];
      return { ...prev, format: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!form.name.trim()) {
      setErrorMsg('Theatre name is required.');
      return;
    }

    setSaving(true);
    try {
      await saveTheatre(
        form,
        admin ? { uid: admin.uid, name: admin.name } : undefined
      );
      setSuccessMsg('Theatre saved successfully.');
      if (isNew) {
        setTimeout(() => router.push('/admin/theatres'), 1000);
      }
    } catch {
      setErrorMsg('Failed to save theatre details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
        <h2 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">
          Cinema Property Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
              Theatre Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Plateno Cinemas Dolby Atmos 4K"
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
              City / Region
            </label>
            <select
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
            >
              {LOCATIONS_LIST.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Area / Locality</label>
            <input
              type="text"
              value={form.area || ''}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              placeholder="e.g. Arundelpet, Collectorate Road"
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Full Physical Address</label>
            <input
              type="text"
              value={form.address || ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Door No, Street, Landmark, Pincode"
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Contact Phone</label>
            <input
              type="text"
              value={form.contactNumber || ''}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              placeholder="+91 9876543210"
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Google Maps URL</label>
            <input
              type="text"
              value={form.mapsUrl || ''}
              onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
              placeholder="https://maps.google.com/..."
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as 'available' | 'coming-soon' })}
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
            >
              <option value="available">Available for Booking</option>
              <option value="coming-soon">Coming Soon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Facilities & Formats */}
      <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
        <h2 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">
          Cinema Amenities &amp; Projection Tech
        </h2>

        <div>
          <label className="text-xs font-bold text-gray-300 block mb-2 font-mono">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_FACILITIES.map((fac) => {
              const active = form.facilities?.includes(fac);
              return (
                <button
                  type="button"
                  key={fac}
                  onClick={() => toggleFacility(fac)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    active
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-black/40 border border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {fac}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-300 block mb-2 font-mono">Supported Formats</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_FORMATS.map((fmt) => {
              const active = form.format?.includes(fmt);
              return (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => toggleFormat(fmt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    active
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-black/40 border border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Theatre Details'}</span>
        </button>
      </div>
    </form>
  );
}
