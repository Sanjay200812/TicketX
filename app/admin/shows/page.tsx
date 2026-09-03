"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { getAllShows, deleteShow, saveShow, AdminShowInput } from '@/services/shows.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminShowsPage() {
  const [shows, setShows] = useState<AdminShowInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminShowInput | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { admin } = useAdminAuth();

  const loadShows = async () => {
    setLoading(true);
    const list = await getAllShows();
    setShows(list);
    setLoading(false);
  };

  useEffect(() => {
    loadShows();
  }, []);

  const handleToggleStatus = async (show: AdminShowInput) => {
    const nextStatus = show.status === 'open' ? 'paused' : 'open';
    await saveShow(
      { ...show, status: nextStatus },
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
    await loadShows();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteShow(deleteTarget.id, admin ? { uid: admin.uid, name: admin.name } : undefined);
    setIsDeleting(false);
    setDeleteTarget(null);
    await loadShows();
  };

  const columns: Column<AdminShowInput>[] = [
    {
      header: 'Movie & Format',
      accessor: 'movieId',
      sortable: true,
      render: (s) => (
        <div className="space-y-0.5 min-w-[180px]">
          <div className="font-bold text-white truncate">{s.movieTitle || s.movieId}</div>
          <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5">
            <span className="text-primary font-bold">{s.format || '2D'}</span>
            <span>•</span>
            <span>{s.language || 'Telugu'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Theatre & Screen',
      accessor: 'theatreId',
      sortable: true,
      render: (s) => (
        <div className="space-y-0.5">
          <div className="font-bold text-gray-200 truncate">{s.theatreName || s.theatreId}</div>
          <div className="text-[11px] text-gray-400 font-mono">
            {s.screenName || s.screenId || 'Screen 1'} ({s.locationId})
          </div>
        </div>
      ),
    },
    {
      header: 'Date & Time',
      accessor: 'date',
      sortable: true,
      render: (s) => (
        <div className="font-mono text-xs">
          <div className="text-white font-bold">{s.date}</div>
          <div className="text-primary font-bold">{s.time}</div>
        </div>
      ),
    },
    {
      header: 'Pricing',
      accessor: 'priceStarting',
      render: (s) => (
        <div className="font-mono text-xs space-y-0.5">
          <span className="text-emerald-400 font-bold">
            From ₹{s.priceStarting || s.priceOverrides?.premium || 150}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (s) => <AdminStatusBadge status={s.status || 'open'} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleToggleStatus(s)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
              s.status === 'open'
                ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            {s.status === 'open' ? 'Pause' : 'Open'}
          </button>
          <button
            onClick={() => setDeleteTarget(s)}
            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
            title="Cancel Show"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Screening Schedules &amp; Showtimes"
        description="Oversee cinema programming across Telugu regions, manage category pricing, and schedule bulk show slots."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/shows/bulk"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
            >
              <Clock className="w-4 h-4" />
              <span>Bulk Create Showtimes</span>
            </Link>
          </div>
        }
      />

      {loading ? (
        <AdminLoader text="Loading show schedules..." />
      ) : (
        <AdminDataTable
          data={shows}
          columns={columns}
          keyExtractor={(s) => s.id}
          searchPlaceholder="Search shows by movie, theatre, date..."
          searchFields={['movieId', 'theatreId', 'date', 'time', 'language']}
          filters={[
            {
              label: 'Status',
              key: 'status',
              options: [
                { label: 'Open', value: 'open' },
                { label: 'Paused', value: 'paused' },
                { label: 'Sold Out', value: 'sold_out' },
                { label: 'Cancelled', value: 'cancelled' },
              ],
            },
          ]}
          emptyIcon={Clock}
          emptyTitle="No shows scheduled"
          emptyDescription="Use the Bulk Showtime Scheduler to publish shows across dates and screening auditoriums."
          emptyActionHref="/admin/shows/bulk"
          emptyActionLabel="Bulk Create Shows"
        />
      )}

      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Scheduled Show?"
        message={`Are you sure you want to remove the show on ${deleteTarget?.date} at ${deleteTarget?.time}? Any seat holds will be released.`}
        confirmLabel="Delete Show"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
