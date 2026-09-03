"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { AdminEventInput, saveEvent } from '@/services/events.service';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { uploadMediaFile } from '@/services/media.service';

const EVENT_CATEGORIES = ['Concerts', 'College events', 'Comedy', 'Sports', 'Workshops', 'Conferences', 'Special events'];
const EVENT_CITIES = [
  { id: 'guntur', name: 'Guntur' },
  { id: 'vijayawada', name: 'Vijayawada' },
  { id: 'nrt', name: 'Narasaraopeta' },
  { id: 'hyderabad', name: 'Hyderabad' },
];

interface EventFormProps {
  initialData?: AdminEventInput | null;
  isNew?: boolean;
}

export function EventForm({ initialData, isNew = false }: EventFormProps) {
  const router = useRouter();
  const { admin } = useAdminAuth();

  const [form, setForm] = useState<AdminEventInput>(() => ({
    id: initialData?.id || '',
    name: initialData?.name || initialData?.title || '',
    title: initialData?.title || initialData?.name || '',
    cityId: initialData?.cityId || 'guntur',
    cityName: initialData?.cityName || 'Guntur',
    venue: initialData?.venue || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    time: initialData?.time || '06:00 PM',
    eventType: initialData?.eventType || 'Concerts',
    category: initialData?.category || 'Concerts',
    poster: initialData?.poster || '',
    capacity: initialData?.capacity || 500,
    startingPrice: initialData?.startingPrice || 199,
    pricing: initialData?.pricing || { silver: 199, gold: 399, premium: 799 },
    bookingEnabled: initialData?.bookingEnabled ?? true,
    description: initialData?.description || '',
    organizer: initialData?.organizer || 'TicketX Events',
    status: initialData?.status || 'published',
    ticketTypes: initialData?.ticketTypes || [
      { id: 'tt_1', name: 'General', price: 199, capacity: 300 },
      { id: 'tt_2', name: 'VIP Pass', price: 599, capacity: 100 },
    ],
  }));

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const handleCityChange = (cityId: string) => {
    const match = EVENT_CITIES.find((c) => c.id === cityId);
    setForm({
      ...form,
      cityId,
      cityName: match ? match.name : cityId,
    });
  };

  const addTicketType = () => {
    setForm((prev) => ({
      ...prev,
      ticketTypes: [
        ...(prev.ticketTypes || []),
        { id: `tt_${Date.now()}`, name: 'Silver', price: 250, capacity: 100 },
      ],
    }));
  };

  const updateTicketType = (idx: number, field: string, val: string | number) => {
    setForm((prev) => {
      const list = [...(prev.ticketTypes || [])];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, ticketTypes: list };
    });
  };

  const removeTicketType = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      ticketTypes: (prev.ticketTypes || []).filter((_, i) => i !== idx),
    }));
  };

  const handlePosterUpload = async (file: File) => {
    try {
      setUploadingPoster(true);
      const media = await uploadMediaFile(
        file,
        'event_poster',
        admin ? { uid: admin.uid, name: admin.name } : undefined
      );
      setForm((prev) => ({ ...prev, poster: media.url }));
    } catch {
      setErrorMsg('Failed to upload event poster.');
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!form.name.trim() || !form.venue.trim()) {
      setErrorMsg('Event Name and Venue are required.');
      return;
    }

    setSaving(true);
    try {
      await saveEvent(
        form,
        admin ? { uid: admin.uid, name: admin.name } : undefined
      );
      setSuccessMsg('Event saved successfully.');

      if (isNew) {
        setTimeout(() => router.push('/admin/events'), 1000);
      }
    } catch {
      setErrorMsg('Failed to save event.');
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

      {/* Basic Event Info */}
      <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
        <h2 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">
          Event Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, title: e.target.value })}
              placeholder="e.g. StarX Live Concert 2026, NEC Freshers"
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value, eventType: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
            >
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">City / Region</label>
            <select
              value={form.cityId}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
            >
              {EVENT_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Venue Address *</label>
            <input
              type="text"
              required
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="e.g. Siddhartha Auditorium, Moghalrajpuram"
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Organizer Name</label>
            <input
              type="text"
              value={form.organizer || ''}
              onChange={(e) => setForm({ ...form, organizer: e.target.value })}
              placeholder="e.g. Star Events Ltd"
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Event Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Start Time</label>
            <input
              type="text"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              placeholder="06:30 PM"
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Starting Price (₹)</label>
            <input
              type="number"
              value={form.startingPrice}
              onChange={(e) => setForm({ ...form, startingPrice: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono"
            />
          </div>
        </div>

        {/* Poster URL / Upload */}
        <div>
          <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Poster Image</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.poster}
              onChange={(e) => setForm({ ...form, poster: e.target.value })}
              placeholder="/posters/event.jpg or https://..."
              className="flex-1 px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
            />
            <label className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-1.5 shrink-0">
              <Upload className="w-4 h-4" />
              <span>{uploadingPoster ? 'Uploading...' : 'Upload'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePosterUpload(f);
                }}
              />
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Event details, highlights, artists..."
            className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
          />
        </div>
      </div>

      {/* Ticket Types / Tiers */}
      <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">
            Ticket Categories &amp; Pricing Tiers
          </h2>
          <button
            type="button"
            onClick={addTicketType}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-primary/20 border border-primary/40 text-primary text-xs font-bold hover:bg-primary/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Ticket Tier</span>
          </button>
        </div>

        <div className="space-y-3">
          {form.ticketTypes?.map((tt, idx) => (
            <div
              key={tt.id || idx}
              className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <input
                type="text"
                placeholder="Tier Name (e.g. VIP, Gold, General)"
                value={tt.name}
                onChange={(e) => updateTicketType(idx, 'name', e.target.value)}
                className="flex-1 px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-xs text-white"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">Price (₹)</span>
                <input
                  type="number"
                  value={tt.price}
                  onChange={(e) => updateTicketType(idx, 'price', parseInt(e.target.value, 10) || 0)}
                  className="w-24 px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-xs text-white font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">Capacity</span>
                <input
                  type="number"
                  value={tt.capacity}
                  onChange={(e) => updateTicketType(idx, 'capacity', parseInt(e.target.value, 10) || 0)}
                  className="w-24 px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-xs text-white font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTicketType(idx)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Event...' : 'Save Event'}</span>
        </button>
      </div>
    </form>
  );
}
