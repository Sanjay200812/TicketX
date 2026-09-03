"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { getAllEvents, deleteEvent, AdminEventInput } from '@/services/events.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEventInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminEventInput | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { admin } = useAdminAuth();

  const loadEvents = async () => {
    setLoading(true);
    const data = await getAllEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteEvent(
      deleteTarget.id,
      deleteTarget.name,
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
    setIsDeleting(false);
    setDeleteTarget(null);
    await loadEvents();
  };

  const columns: Column<AdminEventInput>[] = [
    {
      header: 'Event & Venue',
      accessor: 'name',
      sortable: true,
      render: (e) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-10 h-14 rounded-lg bg-black/60 border border-white/10 overflow-hidden shrink-0">
            {e.poster ? (
              <img src={e.poster} alt={e.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                No Img
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/admin/events/${e.id}`}
              className="font-bold text-white hover:text-primary transition-colors truncate block"
            >
              {e.name}
            </Link>
            <div className="text-[11px] text-gray-400 truncate">
              {e.venue} • {e.cityName}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'eventType',
      sortable: true,
      render: (e) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-gray-300">
          {e.category || e.eventType || 'Event'}
        </span>
      ),
    },
    {
      header: 'Schedule',
      accessor: 'date',
      sortable: true,
      render: (e) => (
        <div className="text-xs font-mono">
          <div className="text-white font-bold">{e.date}</div>
          <div className="text-gray-400 text-[11px]">{e.time}</div>
        </div>
      ),
    },
    {
      header: 'Starting Price',
      accessor: 'startingPrice',
      sortable: true,
      render: (e) => (
        <span className="font-mono font-bold text-emerald-400">
          ₹{e.startingPrice || e.pricing?.silver || 0}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (e) => <AdminStatusBadge status={e.status || 'published'} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (e) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/events/${e.id}`}
            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            title="Edit Event"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/events/${e.id}`}
            target="_blank"
            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            title="Public View"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDeleteTarget(e)}
            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
            title="Delete Event"
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
        title="Live Events Management"
        description="Manage music concerts, college fests, auditorium shows, and ticket tier allocations."
        actions={
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        }
      />

      {loading ? (
        <AdminLoader text="Loading events..." />
      ) : (
        <AdminDataTable
          data={events}
          columns={columns}
          keyExtractor={(e) => e.id}
          searchPlaceholder="Search events by title, venue, city..."
          searchFields={['name', 'venue', 'cityName', 'eventType']}
          emptyIcon={Calendar}
          emptyTitle="No events found"
          emptyDescription="Add a new live event or concert pass to publish it on TicketX."
          emptyActionHref="/admin/events/new"
          emptyActionLabel="Create Event"
        />
      )}

      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.name}"?`}
        message="Are you sure you want to remove this event listing? Customers will no longer be able to view or book passes for it."
        confirmLabel="Delete Event"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
