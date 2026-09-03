"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Grid, Plus, Edit2, Copy, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { AdminLoader } from '@/components/admin/AdminLoader';
import {
  getAllSeatLayouts,
  deleteSeatLayout,
  saveSeatLayout,
  AdminSeatLayoutTemplate,
} from '@/services/seatLayouts.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminSeatLayoutsPage() {
  const [layouts, setLayouts] = useState<AdminSeatLayoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminSeatLayoutTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { admin } = useAdminAuth();

  const loadLayouts = async () => {
    setLoading(true);
    const list = await getAllSeatLayouts();
    setLayouts(list);
    setLoading(false);
  };

  useEffect(() => {
    loadLayouts();
  }, []);

  const handleDuplicate = async (layout: AdminSeatLayoutTemplate) => {
    const newId = `${layout.theatreId}-copy-${Date.now().toString(36).substring(2, 6)}`;
    const duplicated: AdminSeatLayoutTemplate = {
      ...layout,
      id: newId,
      templateName: `${layout.templateName || layout.theatreName || 'Layout'} (Cloned)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveSeatLayout(duplicated, admin ? { uid: admin.uid, name: admin.name } : undefined);
    await loadLayouts();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteSeatLayout(
      deleteTarget.id,
      deleteTarget.templateName || deleteTarget.id,
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
    setIsDeleting(false);
    setDeleteTarget(null);
    await loadLayouts();
  };

  const columns: Column<AdminSeatLayoutTemplate>[] = [
    {
      header: 'Template / Theatre',
      accessor: 'templateName',
      sortable: true,
      render: (l) => (
        <div className="space-y-0.5 min-w-[200px]">
          <Link
            href={`/admin/seat-layouts/builder?id=${l.id}`}
            className="font-bold text-white hover:text-primary transition-colors block truncate"
          >
            {l.templateName || l.theatreName || l.id}
          </Link>
          <div className="text-[11px] text-gray-400 font-mono">
            Theatre: {l.theatreId} {l.screenId ? `• ${l.screenId}` : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Total Capacity',
      accessor: 'capacity',
      sortable: true,
      render: (l) => (
        <span className="font-mono font-bold text-emerald-400">
          {l.capacity} Seats
        </span>
      ),
    },
    {
      header: 'Sections & Tiers',
      accessor: 'sections',
      render: (l) => (
        <div className="flex flex-wrap gap-1">
          {l.sections?.map((sec) => (
            <span
              key={sec.id || sec.name}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-gray-300"
            >
              {sec.name} (₹{sec.price || '—'})
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Screen Orientation',
      accessor: 'screenPosition',
      render: (l) => (
        <span className="text-[11px] font-mono text-gray-400 uppercase">
          {l.screenPosition || 'Bottom'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (l) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/seat-layouts/builder?id=${l.id}`}
            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            title="Open in Visual Builder"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => handleDuplicate(l)}
            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            title="Duplicate Template"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(l)}
            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
            title="Delete Layout"
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
        title="Visual Seat Layout Designer"
        description="Design auditorium seating geometries, configure Gold/Silver/Recliner tiers, and save reusable cinema layout templates."
        actions={
          <Link
            href="/admin/seat-layouts/builder"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Visual Builder</span>
          </Link>
        }
      />

      {loading ? (
        <AdminLoader text="Loading auditorium seating templates..." />
      ) : (
        <AdminDataTable
          data={layouts}
          columns={columns}
          keyExtractor={(l) => l.id}
          searchPlaceholder="Search layouts by template name, theatre ID..."
          searchFields={['templateName', 'theatreId', 'theatreName']}
          emptyIcon={Grid}
          emptyTitle="No seat layout templates"
          emptyDescription="Create your first visual auditorium seating grid to assign it to cinema screens."
          emptyActionHref="/admin/seat-layouts/builder"
          emptyActionLabel="Launch Visual Builder"
        />
      )}

      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.templateName || deleteTarget?.id}"?`}
        message="Are you sure you want to delete this seating layout template? Shows depending on this layout may need reconfiguration."
        confirmLabel="Delete Layout"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
