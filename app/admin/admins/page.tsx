"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { getAllAdmins, saveAdmin, deleteAdminUser } from '@/services/users.service';
import { AdminUser, AdminRole } from '@/types/admin';
import { useAdminAuth } from '@/context/AdminAuthContext';

const ADMIN_ROLES: { id: AdminRole; label: string; desc: string }[] = [
  { id: 'super_admin', label: 'Super Administrator', desc: 'Full control across all settings, security, and finances.' },
  { id: 'content_manager', label: 'Content Manager', desc: 'Can manage Movies, Events, Banners, Media, and Homepage.' },
  { id: 'theatre_manager', label: 'Theatre Manager', desc: 'Can manage Theatres, Screens, Shows, and Seating Layouts.' },
  { id: 'support_agent', label: 'Support Agent', desc: 'Can view Bookings, handle Tickets, and resolve customer issues.' },
  { id: 'finance_manager', label: 'Finance Manager', desc: 'Can oversee Payments, Settlements, and issue Refunds.' },
];

export default function AdminStaffPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('content_manager');
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { admin } = useAdminAuth();

  const loadAdmins = async () => {
    setLoading(true);
    const data = await getAllAdmins();
    setAdmins(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setIsSubmitting(true);

    await saveAdmin(
      {
        uid: `adm_${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );


    setIsSubmitting(false);
    setIsModalOpen(false);
    setName('');
    setEmail('');
    await loadAdmins();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    await deleteAdminUser(
      deleteTarget.uid,
      deleteTarget.name,
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
    setIsSubmitting(false);
    setDeleteTarget(null);
    await loadAdmins();
  };

  const columns: Column<AdminUser>[] = [
    {
      header: 'Admin Name & Email',
      accessor: 'name',
      sortable: true,
      render: (a) => (
        <div className="space-y-0.5">
          <div className="font-bold text-white text-xs flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{a.name}</span>
          </div>
          <div className="text-[11px] text-gray-400 font-mono">{a.email}</div>
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      accessor: 'role',
      sortable: true,
      render: (a) => {
        const matched = ADMIN_ROLES.find((r) => r.id === a.role);
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-primary/20 border border-primary/40 text-primary">
            {matched ? matched.label : a.role}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'isActive',
      sortable: true,
      render: () => (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Active
        </span>
      ),

    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1.5">
          {a.role !== 'super_admin' && (
            <button
              onClick={() => setDeleteTarget(a)}
              className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
              title="Revoke Admin Access"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Staff &amp; Role-Based Access"
        description="Grant granular operational privileges across Content, Theatres, Finance, and Customer Support."
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Administrator</span>
          </button>
        }
      />

      {loading ? (
        <AdminLoader text="Loading administration staff..." />
      ) : (
        <AdminDataTable
          data={admins}
          columns={columns}
          keyExtractor={(a) => a.uid}
          searchPlaceholder="Search admin staff by name or email..."
          searchFields={['name', 'email', 'role']}
          emptyIcon={Shield}
          emptyTitle="No staff configured"
          emptyDescription="Add team members to delegate operations."
        />
      )}

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateAdmin}
            className="w-full max-w-md bg-[#16191f] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">Add Administrator</h3>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh V"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@ticketx.in"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Operational Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AdminRole)}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                {ADMIN_ROLES.find((r) => r.id === role)?.desc}
              </p>
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
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25"
              >
                {isSubmitting ? 'Adding...' : 'Save Administrator'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Revoke Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Revoke access for "${deleteTarget?.name}"?`}
        message="This user will immediately lose administrative access to TicketX back-office tools."
        confirmLabel="Revoke Privileges"
        isDestructive={true}
        isLoading={isSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
