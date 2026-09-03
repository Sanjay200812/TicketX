"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Plus, Edit2, Trash2, MapPin, Tv } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { getAllTheatres, deleteTheatre, AdminTheatreInput } from '@/services/theatres.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminTheatresPage() {
  const [theatres, setTheatres] = useState<AdminTheatreInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminTheatreInput | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { admin } = useAdminAuth();

  const loadTheatres = async () => {
    setLoading(true);
    const data = await getAllTheatres();
    setTheatres(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTheatres();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteTheatre(
      deleteTarget.id,
      deleteTarget.name,
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
    setIsDeleting(false);
    setDeleteTarget(null);
    await loadTheatres();
  };

  const columns: Column<AdminTheatreInput>[] = [
    {
      header: 'Theatre & Address',
      accessor: 'name',
      sortable: true,
      render: (t) => (
        <div className="space-y-0.5 min-w-[220px]">
          <Link
            href={`/admin/theatres/${t.id}`}
            className="font-bold text-white hover:text-primary transition-colors block truncate"
          >
            {t.name}
          </Link>
          <div className="text-[11px] text-gray-400 flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 text-primary shrink-0" />
            <span>{t.area || t.address || t.locationId}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'City / Region',
      accessor: 'locationId',
      sortable: true,
      render: (t) => (
        <span className="capitalize font-bold text-gray-300 font-mono text-xs">
          {t.locationId}
        </span>
      ),
    },
    {
      header: 'Facilities',
      accessor: 'facilities',
      render: (t) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {t.facilities?.slice(0, 3).map((f) => (
            <span
              key={f}
              className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-gray-300"
            >
              {f}
            </span>
          ))}
          {(t.facilities?.length || 0) > 3 && (
            <span className="text-[10px] text-gray-500">+{t.facilities!.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Formats',
      accessor: 'format',
      render: (t) => (
        <span className="font-mono text-xs text-primary font-bold">
          {t.format?.join(', ') || '2D'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (t) => <AdminStatusBadge status={t.status || 'available'} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/screens?theatreId=${t.id}`}
            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            title="Manage Screens"
          >
            <Tv className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/admin/theatres/${t.id}`}
            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            title="Edit Theatre"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDeleteTarget(t)}
            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
            title="Delete Theatre"
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
        title="Cinemas &amp; Multiplexes"
        description="Manage partnered movie theatres, location mappings, auditorium facilities, and sound specifications."
        actions={
          <Link
            href="/admin/theatres/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Theatre</span>
          </Link>
        }
      />

      {loading ? (
        <AdminLoader text="Loading cinema list..." />
      ) : (
        <AdminDataTable
          data={theatres}
          columns={columns}
          keyExtractor={(t) => t.id}
          searchPlaceholder="Search theatres by name, area, location..."
          searchFields={['name', 'locationId', 'area', 'address']}
          emptyIcon={Building2}
          emptyTitle="No theatres found"
          emptyDescription="Add a new partnered cinema hall to start scheduling movie screenings."
          emptyActionHref="/admin/theatres/new"
          emptyActionLabel="Add Theatre"
        />
      )}

      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.name}"?`}
        message="Are you sure you want to remove this theatre? All associated screen allocations and show schedules will be permanently disconnected."
        confirmLabel="Delete Theatre"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
