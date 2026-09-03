"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tv, Plus, Trash2, Edit2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { getAllTheatres, AdminTheatreInput } from '@/services/theatres.service';
import { getScreensForTheatre, saveScreen, deleteScreen, AdminScreen } from '@/services/screens.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminScreensPage() {
  const searchParams = useSearchParams();
  const initialTheatreId = searchParams.get('theatreId') || '';

  const [theatres, setTheatres] = useState<AdminTheatreInput[]>([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState(initialTheatreId);
  const [screens, setScreens] = useState<AdminScreen[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScreen, setEditingScreen] = useState<AdminScreen | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminScreen | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { admin } = useAdminAuth();

  useEffect(() => {
    async function init() {
      setLoading(true);
      const thList = await getAllTheatres();
      setTheatres(thList);

      const targetThId = selectedTheatreId || thList[0]?.id || '';
      setSelectedTheatreId(targetThId);

      if (targetThId) {
        const scList = await getScreensForTheatre(targetThId);
        setScreens(scList);
      }
      setLoading(false);
    }
    init();
  }, [selectedTheatreId]);

  const handleTheatreSelect = async (thId: string) => {
    setSelectedTheatreId(thId);
    setLoading(true);
    const scList = await getScreensForTheatre(thId);
    setScreens(scList);
    setLoading(false);
  };

  const handleSaveScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScreen || !editingScreen.name.trim()) return;

    setIsSaving(true);
    const thObj = theatres.find((t) => t.id === selectedTheatreId);
    const payload: AdminScreen = {
      ...editingScreen,
      theatreId: selectedTheatreId,
      theatreName: thObj?.name || selectedTheatreId,
    };

    await saveScreen(payload, admin ? { uid: admin.uid, name: admin.name } : undefined);
    setIsSaving(false);
    setEditingScreen(null);

    const refreshed = await getScreensForTheatre(selectedTheatreId);
    setScreens(refreshed);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteScreen(deleteTarget.id, deleteTarget.name, admin ? { uid: admin.uid, name: admin.name } : undefined);
    setIsDeleting(false);
    setDeleteTarget(null);

    const refreshed = await getScreensForTheatre(selectedTheatreId);
    setScreens(refreshed);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Screen &amp; Auditorium Management"
        description="Configure individual cinema screens, audio/projection technology, and link seating capacities."
        actions={
          <button
            onClick={() =>
              setEditingScreen({
                id: '',
                theatreId: selectedTheatreId,
                name: `Screen ${screens.length + 1}`,
                capacity: 250,
                screenType: '2D',
                projectionType: '4K Barco Laser',
                soundType: 'Dolby Atmos',
                isActive: true,
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Screen</span>
          </button>
        }
      />

      {/* Theatre Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#16191f] border border-white/10 rounded-2xl">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-gray-300 font-mono">Select Cinema:</span>
        </div>
        <select
          value={selectedTheatreId}
          onChange={(e) => handleTheatreSelect(e.target.value)}
          className="px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-primary max-w-md"
        >
          {theatres.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.locationId})
            </option>
          ))}
        </select>
      </div>

      {/* Screens Table */}
      {loading ? (
        <AdminLoader text="Loading screens..." />
      ) : (
        <div className="bg-[#16191f] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-black/40 border-b border-white/10 text-gray-400 font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4 font-bold">Screen Name</th>
                <th className="p-4 font-bold">Capacity</th>
                <th className="p-4 font-bold">Screen Type</th>
                <th className="p-4 font-bold">Sound Tech</th>
                <th className="p-4 font-bold">Projection</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {screens.map((sc) => (
                <tr key={sc.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <Tv className="w-4 h-4 text-gray-400" />
                    <span>{sc.name}</span>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-400">
                    {sc.capacity} Seats
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-gray-300">
                      {sc.screenType}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{sc.soundType || 'Dolby Atmos'}</td>
                  <td className="p-4 text-gray-300">{sc.projectionType || '4K Barco'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingScreen(sc)}
                        className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
                        title="Edit Screen"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(sc)}
                        className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
                        title="Delete Screen"
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
      )}

      {/* Screen Edit Modal */}
      {editingScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveScreen}
            className="w-full max-w-md bg-[#16191f] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">
              {editingScreen.id ? 'Edit Screen' : 'Add New Screen'}
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Screen Name *
              </label>
              <input
                type="text"
                required
                value={editingScreen.name}
                onChange={(e) => setEditingScreen({ ...editingScreen, name: e.target.value })}
                placeholder="e.g. Screen 1, Main Auditorium"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Capacity (Seats)
                </label>
                <input
                  type="number"
                  value={editingScreen.capacity}
                  onChange={(e) =>
                    setEditingScreen({ ...editingScreen, capacity: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Format Type
                </label>
                <select
                  value={editingScreen.screenType}
                  onChange={(e) =>
                    setEditingScreen({
                      ...editingScreen,
                      screenType: e.target.value as AdminScreen['screenType'],
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                  <option value="4DX">4DX</option>
                  <option value="Dolby Cinema">Dolby Cinema</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Sound System
                </label>
                <select
                  value={editingScreen.soundType}
                  onChange={(e) =>
                    setEditingScreen({
                      ...editingScreen,
                      soundType: e.target.value as AdminScreen['soundType'],
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
                >
                  <option value="Dolby Atmos">Dolby Atmos</option>
                  <option value="7.1 DTS Surround">7.1 DTS Surround</option>
                  <option value="5.1 Dolby">5.1 Dolby</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Projection
                </label>
                <select
                  value={editingScreen.projectionType}
                  onChange={(e) =>
                    setEditingScreen({
                      ...editingScreen,
                      projectionType: e.target.value as AdminScreen['projectionType'],
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
                >
                  <option value="4K Barco Laser">4K Barco Laser</option>
                  <option value="4K Laser">4K Laser</option>
                  <option value="2K Digital">2K Digital</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingScreen(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25"
              >
                {isSaving ? 'Saving...' : 'Save Screen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.name}"?`}
        message="Are you sure you want to delete this screen? All scheduled showtimes on this screen will be affected."
        confirmLabel="Delete Screen"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
