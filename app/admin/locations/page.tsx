"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Check, X, Trash2, Edit2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import {
  getAllLocations,
  saveLocation,
  deleteLocation,
  toggleLocationBooking,
  AdminLocationInput,
} from '@/services/locations.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<AdminLocationInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLoc, setEditingLoc] = useState<AdminLocationInput | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminLocationInput | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { admin } = useAdminAuth();

  const loadLocations = async () => {
    setLoading(true);
    const data = await getAllLocations();
    setLocations(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleToggle = async (loc: AdminLocationInput) => {
    const nextState = !loc.bookingEnabled;
    // Optimistic update
    setLocations((prev) =>
      prev.map((l) => (l.id === loc.id ? { ...l, bookingEnabled: nextState } : l))
    );

    await toggleLocationBooking(
      loc.id,
      nextState,
      loc.name,
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
  };

  const handleTogglePopular = async (loc: AdminLocationInput) => {
    const nextState = !loc.isPopular;
    setLocations((prev) =>
      prev.map((l) => (l.id === loc.id ? { ...l, isPopular: nextState } : l))
    );
    await saveLocation(
      { ...loc, isPopular: nextState },
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
  };

  const handleToggleEventOnly = async (loc: AdminLocationInput) => {
    const nextState = !loc.isEventOnly;
    setLocations((prev) =>
      prev.map((l) => (l.id === loc.id ? { ...l, isEventOnly: nextState } : l))
    );
    await saveLocation(
      { ...loc, isEventOnly: nextState },
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoc || !editingLoc.name.trim()) return;

    setIsSaving(true);
    await saveLocation(
      editingLoc,
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
    setIsSaving(false);
    setEditingLoc(null);
    await loadLocations();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteLocation(
      deleteTarget.id,
      deleteTarget.name,
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
    setIsDeleting(false);
    setDeleteTarget(null);
    await loadLocations();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Location & Region Management"
        description="Enable or disable booking across cities (Guntur, Vijayawada, Narasaraopeta, etc.) and configure regional operational modes."
        actions={
          <button
            onClick={() =>
              setEditingLoc({
                id: '',
                name: '',
                shortName: '',
                state: 'Andhra Pradesh',
                country: 'India',
                bookingEnabled: true,
                isPopular: false,
                isEventOnly: false,
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Location</span>
          </button>
        }
      />

      {loading ? (
        <AdminLoader text="Loading regions & locations..." />
      ) : (
        <div className="bg-[#16191f] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-black/40 border-b border-white/10 text-gray-400 font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4 font-bold">City / Location</th>
                  <th className="p-4 font-bold">Short Code</th>
                  <th className="p-4 font-bold">State</th>
                  <th className="p-4 font-bold text-center">Booking Status</th>
                  <th className="p-4 font-bold text-center">Popular</th>
                  <th className="p-4 font-bold text-center">Event-Only</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span>{loc.name}</span>
                    </td>
                    <td className="p-4 font-mono text-gray-400">{loc.shortName || '—'}</td>
                    <td className="p-4 text-gray-400">{loc.state}</td>

                    {/* Booking Enabled Toggle */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggle(loc)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                          loc.bookingEnabled
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {loc.bookingEnabled ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>ENABLED</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>DISABLED</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Popular Toggle */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleTogglePopular(loc)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                          loc.isPopular
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10'
                        }`}
                      >
                        {loc.isPopular ? '★ Popular' : 'Standard'}
                      </button>
                    </td>

                    {/* Event Only Toggle */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleEventOnly(loc)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                          loc.isEventOnly
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10'
                        }`}
                      >
                        {loc.isEventOnly ? 'Event-Only' : 'All Cinema'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingLoc(loc)}
                          className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
                          title="Edit Location"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(loc)}
                          className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
                          title="Delete Location"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {editingLoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveLocation}
            className="w-full max-w-md bg-[#16191f] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">
              {editingLoc.id ? `Edit ${editingLoc.name}` : 'Add New Location'}
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                City / Region Name *
              </label>
              <input
                type="text"
                required
                value={editingLoc.name}
                onChange={(e) => setEditingLoc({ ...editingLoc, name: e.target.value })}
                placeholder="e.g. Tenali, Chirala"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Short Name
                </label>
                <input
                  type="text"
                  value={editingLoc.shortName || ''}
                  onChange={(e) => setEditingLoc({ ...editingLoc, shortName: e.target.value })}
                  placeholder="e.g. TNL, CHR"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  State
                </label>
                <input
                  type="text"
                  value={editingLoc.state}
                  onChange={(e) => setEditingLoc({ ...editingLoc, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingLoc.bookingEnabled}
                  onChange={(e) =>
                    setEditingLoc({ ...editingLoc, bookingEnabled: e.target.checked })
                  }
                  className="rounded border-white/20 bg-black/40 text-primary"
                />
                <span>Online Booking Enabled</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingLoc.isPopular}
                  onChange={(e) => setEditingLoc({ ...editingLoc, isPopular: e.target.checked })}
                  className="rounded border-white/20 bg-black/40 text-primary"
                />
                <span>Mark as Popular City</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingLoc.isEventOnly}
                  onChange={(e) => setEditingLoc({ ...editingLoc, isEventOnly: e.target.checked })}
                  className="rounded border-white/20 bg-black/40 text-primary"
                />
                <span>Event-Only Mode (No Cinemas)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingLoc(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25"
              >
                {isSaving ? 'Saving...' : 'Save Location'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Delete */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete Location "${deleteTarget?.name}"?`}
        message="This will remove this city from TicketX location pickers and unassign regional screens."
        confirmLabel="Delete Location"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
