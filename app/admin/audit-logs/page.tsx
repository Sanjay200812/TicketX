"use client";

import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { getRecentAuditLogs } from '@/services/audit.service';
import { AuditLogEntry } from '@/types/admin';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    const data = await getRecentAuditLogs(100);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const columns: Column<AuditLogEntry>[] = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      sortable: true,
      render: (l) => (
        <span className="font-mono text-xs text-gray-400">
          {new Date(l.timestamp).toLocaleDateString()}{' '}
          <span className="text-white font-bold">
            {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </span>
      ),
    },
    {
      header: 'Admin Actor',
      accessor: 'adminName',
      sortable: true,
      render: (l) => (
        <div className="space-y-0.5">
          <div className="font-bold text-white text-xs">{l.adminName || 'System'}</div>
          <div className="text-[10px] text-gray-500 font-mono">{l.adminUid}</div>
        </div>
      ),
    },
    {
      header: 'Entity / Model',
      accessor: 'entityType',
      sortable: true,
      render: (l) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-gray-300 uppercase">
          {l.entityType}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      sortable: true,
      render: (l) => (
        <span className="font-mono text-xs text-primary font-bold">
          {l.action}
        </span>
      ),
    },
    {
      header: 'Summary Audit Trail',
      accessor: 'summary',
      render: (l) => (
        <p className="text-xs text-gray-200 max-w-md truncate" title={l.summary}>
          {l.summary}
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Administrative Audit Logs"
        description="Immutable record of changes made across movie releases, theatre programming, discounts, and customer refunds."
      />

      {loading ? (
        <AdminLoader text="Loading audit trails..." />
      ) : (
        <AdminDataTable
          data={logs}
          columns={columns}
          keyExtractor={(l) => l.id}
          searchPlaceholder="Search audit events by admin, action, summary..."
          searchFields={['adminName', 'action', 'entityType', 'summary']}
          filters={[
            {
              label: 'Entity Type',
              key: 'entityType',
              options: [
                { label: 'Movie', value: 'movie' },
                { label: 'Theatre', value: 'theatre' },
                { label: 'Screen', value: 'screen' },
                { label: 'Show', value: 'show' },
                { label: 'Location', value: 'location' },
                { label: 'Coupon', value: 'coupon' },
                { label: 'Refund', value: 'refund' },
                { label: 'Settings', value: 'settings' },
              ],
            },
          ]}
          emptyIcon={History}
          emptyTitle="No audit records yet"
          emptyDescription="Administrative mutations and actions will be logged in real-time."
        />
      )}
    </div>
  );
}
