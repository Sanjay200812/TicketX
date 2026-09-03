"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Send } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import {
  getAllNotifications,
  saveNotification,
  deleteNotification,
  AdminNotification,
} from '@/services/notifications.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<AdminNotification['target']>('all_users');
  const [type, setType] = useState<AdminNotification['type']>('info');
  const [deleteTarget, setDeleteTarget] = useState<AdminNotification | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { admin } = useAdminAuth();

  const loadNotifications = async () => {
    setLoading(true);
    const data = await getAllNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setIsSaving(true);

    await saveNotification(
      {
        id: '',
        title: title.trim(),
        message: message.trim(),
        target,
        type,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );

    setIsSaving(false);
    setIsModalOpen(false);
    setTitle('');
    setMessage('');
    await loadNotifications();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteNotification(deleteTarget.id, deleteTarget.title, admin ? { uid: admin.uid, name: admin.name } : undefined);
    setDeleteTarget(null);
    await loadNotifications();
  };

  const columns: Column<AdminNotification>[] = [
    {
      header: 'Announcement Title',
      accessor: 'title',
      sortable: true,
      render: (n) => (
        <div className="space-y-0.5">
          <div className="font-bold text-white text-xs">{n.title}</div>
          <p className="text-[11px] text-gray-400 max-w-sm truncate">{n.message}</p>
        </div>
      ),
    },
    {
      header: 'Audience Target',
      accessor: 'target',
      sortable: true,
      render: (n) => (
        <span className="capitalize font-mono text-xs text-gray-300">
          {n.target.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Alert Type',
      accessor: 'type',
      sortable: true,
      render: (n) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
            n.type === 'promo'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : n.type === 'alert'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-primary/20 text-primary border border-primary/30'
          }`}
        >
          {n.type}
        </span>
      ),
    },
    {
      header: 'Date Sent',
      accessor: 'createdAt',
      sortable: true,
      render: (n) => (
        <span className="font-mono text-xs text-gray-400">
          {new Date(n.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (n) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setDeleteTarget(n)}
            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
            title="Delete Alert"
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
        title="Announcements &amp; Notifications"
        description="Broadcast notifications, promotional notices, and platform updates to ticket buyers."
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Broadcast Alert</span>
          </button>
        }
      />

      {loading ? (
        <AdminLoader text="Loading announcements..." />
      ) : (
        <AdminDataTable
          data={notifications}
          columns={columns}
          keyExtractor={(n) => n.id}
          searchPlaceholder="Search announcements..."
          searchFields={['title', 'message', 'target']}
          emptyIcon={Bell}
          emptyTitle="No announcements broadcast"
          emptyDescription="Send out marketing updates or cinema alerts."
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSendNotification}
            className="w-full max-w-md bg-[#16191f] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">Broadcast Announcement</h3>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Headline / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midnight Premiere Advance Booking Open"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Target Audience
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as AdminNotification['target'])}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
                >
                  <option value="all_users">All Customers</option>
                  <option value="specific_city">Specific City</option>
                  <option value="theatre_partners">Theatre Partners</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AdminNotification['type'])}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
                >
                  <option value="info">General Info</option>
                  <option value="promo">Promotional / Sale</option>
                  <option value="alert">System Alert</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Message Body *
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the notification message content..."
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Sending...' : 'Broadcast'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Delete */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.title}"?`}
        message="This alert will be removed from customer notifications."
        confirmLabel="Delete Alert"
        isDestructive={true}
        isLoading={false}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
