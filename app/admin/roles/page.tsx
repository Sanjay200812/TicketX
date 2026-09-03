"use client";

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Key, Check, Lock } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ROLE_PERMISSIONS, ROLE_LABELS } from '@/lib/admin/permissions';
import { AdminRole, AdminPermission } from '@/types/admin';

export default function AdminRolesPage() {
  const roles: AdminRole[] = ['super_admin', 'content_manager', 'theatre_manager', 'support_agent'];
  const [selectedRole, setSelectedRole] = useState<AdminRole>('super_admin');

  const allPermissions: { key: AdminPermission; category: string; description: string }[] = [
    { key: 'movies:read', category: 'Movies', description: 'Browse and view catalog films' },
    { key: 'movies:write', category: 'Movies', description: 'Create and edit movie details' },
    { key: 'movies:publish', category: 'Movies', description: 'Publish or unpublish movies to public site' },
    { key: 'movies:delete', category: 'Movies', description: 'Permanently remove or archive movies' },
    { key: 'events:read', category: 'Events', description: 'View concerts and auditorium events' },
    { key: 'events:write', category: 'Events', description: 'Create and update events' },
    { key: 'theatres:write', category: 'Theatres', description: 'Create and update theatre venues' },
    { key: 'screens:manage', category: 'Screens', description: 'Configure screens, projection, sound' },
    { key: 'seat_layouts:manage', category: 'Layouts', description: 'Build and modify visual seating grids' },
    { key: 'shows:write', category: 'Shows', description: 'Schedule showtimes across screens' },
    { key: 'bookings:read', category: 'Transactions', description: 'View customer ticket orders' },
    { key: 'payments:read', category: 'Transactions', description: 'Inspect payment logs and transactions' },
    { key: 'refunds:manage', category: 'Transactions', description: 'Approve or reject customer refund requests' },
    { key: 'coupons:manage', category: 'Marketing', description: 'Create discount codes and promotions' },
    { key: 'venue_applications:manage', category: 'Partners', description: 'Review and approve partner hall applications' },
    { key: 'users:read', category: 'Customers', description: 'Inspect customer profiles and activity' },
    { key: 'users:manage', category: 'Customers', description: 'Suspend or reactivate customer accounts' },
    { key: 'admins:manage', category: 'Security', description: 'Invite and manage team administrator accounts' },
    { key: 'roles:manage', category: 'Security', description: 'Configure roles and permission matrices' },
    { key: 'settings:write', category: 'System', description: 'Modify platform settings and maintenance switches' },
    { key: 'audit_logs:read', category: 'System', description: 'Inspect immutable administrative audit records' },
  ];

  const currentPerms = ROLE_PERMISSIONS[selectedRole] || [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Roles & Permissions"
        description="Inspect administrative access tiers, assigned permissions, and role privilege boundaries across TicketX."
      />

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {roles.map((r) => {
          const isSelected = selectedRole === r;
          const count = ROLE_PERMISSIONS[r]?.length || 0;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRole(r)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                  : 'bg-[#12141a]/90 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
                  {r === 'super_admin' ? 'Root Access' : 'Staff Tier'}
                </span>
                {isSelected ? (
                  <ShieldCheck className="w-4 h-4 text-primary" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <div className="font-bold text-sm text-white">{ROLE_LABELS[r]}</div>
              <div className="text-xs text-primary font-mono mt-1 font-semibold">
                {count} Privileges Granted
              </div>
            </button>
          );
        })}
      </div>

      {/* Permissions Breakdown Matrix */}
      <div className="bg-[#12141a]/90 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-white font-heading">
              {ROLE_LABELS[selectedRole]} Privileges
            </h2>
            <p className="text-xs text-gray-400">
              {selectedRole === 'super_admin'
                ? 'Unrestricted full platform administrative clearance.'
                : 'Scoped operational privileges restricted by organizational role.'}
            </p>
          </div>
          {selectedRole === 'super_admin' ? (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/20 text-primary border border-primary/30 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Immutable Super Role</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 text-gray-300 border border-white/10">
              Standard Role
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allPermissions.map((p) => {
            const hasAccess = currentPerms.includes(p.key);
            return (
              <div
                key={p.key}
                className={`p-3.5 rounded-2xl border transition-all ${
                  hasAccess
                    ? 'bg-black/40 border-emerald-500/20 shadow-sm'
                    : 'bg-black/20 border-white/5 opacity-40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                      {p.category}
                    </span>
                    <div className="font-mono text-xs font-bold text-white">{p.key}</div>
                    <p className="text-[11px] text-gray-400 leading-snug">{p.description}</p>
                  </div>
                  {hasAccess ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-white/5 text-gray-600 flex items-center justify-center shrink-0">
                      <Key className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
