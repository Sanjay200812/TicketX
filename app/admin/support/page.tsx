"use client";

import React, { useState, useEffect } from 'react';
import { Headphones, Eye, Send } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { getAllSupportTickets, updateSupportTicket, SupportTicket } from '@/services/support.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [ticketStatus, setTicketStatus] = useState<SupportTicket['status']>('resolved');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { admin } = useAdminAuth();

  const loadTickets = async () => {
    setLoading(true);
    const data = await getAllSupportTickets();
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setIsSubmitting(true);

    await updateSupportTicket(
      selectedTicket.id,
      {
        status: ticketStatus,
        adminResponse: replyText,
      },
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );

    setIsSubmitting(false);
    setSelectedTicket(null);
    setReplyText('');
    await loadTickets();
  };

  const columns: Column<SupportTicket>[] = [
    {
      header: 'Ticket ID & Subject',
      accessor: 'subject',
      sortable: true,
      render: (t) => (
        <div className="space-y-0.5 min-w-[200px]">
          <div className="font-bold text-white text-xs truncate">{t.subject}</div>
          <div className="text-[10px] text-gray-500 font-mono">
            {t.id} • {t.category.replace(/_/g, ' ')}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      sortable: true,
      render: (t) => (
        <div className="space-y-0.5">
          <div className="font-bold text-gray-200">{t.customerName}</div>
          <div className="text-[11px] text-gray-400 font-mono">{t.customerEmail}</div>
        </div>
      ),
    },
    {
      header: 'Priority',
      accessor: 'priority',
      sortable: true,
      render: (t) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
            t.priority === 'urgent'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : t.priority === 'high'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-white/10 text-gray-300'
          }`}
        >
          {t.priority}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (t) => <AdminStatusBadge status={t.status} />,
    },
    {
      header: 'Date Created',
      accessor: 'createdAt',
      sortable: true,
      render: (t) => (
        <span className="font-mono text-xs text-gray-400">
          {new Date(t.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedTicket(t);
              setReplyText(t.adminResponse || '');
              setTicketStatus(t.status);
            }}
            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            title="View & Reply"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customer Support Desk"
        description="Respond to customer booking issues, payment reconciliations, and auditorium inquiries."
      />

      {loading ? (
        <AdminLoader text="Loading support inquiries..." />
      ) : (
        <AdminDataTable
          data={tickets}
          columns={columns}
          keyExtractor={(t) => t.id}
          searchPlaceholder="Search support tickets..."
          searchFields={['subject', 'customerName', 'customerEmail', 'message']}
          emptyIcon={Headphones}
          emptyTitle="No support tickets"
          emptyDescription="Inbound help desk queries will appear here."
        />
      )}

      {/* Ticket Details & Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleReplySubmit}
            className="w-full max-w-lg bg-[#16191f] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-primary font-bold uppercase">
                  {selectedTicket.category.replace(/_/g, ' ')}
                </span>
                <h3 className="text-base font-bold text-white">{selectedTicket.subject}</h3>
              </div>
              <AdminStatusBadge status={selectedTicket.status} />
            </div>

            <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>From: <strong className="text-white">{selectedTicket.customerName}</strong></span>
                <span className="font-mono">{selectedTicket.customerPhone || selectedTicket.customerEmail}</span>
              </div>
              <p className="text-gray-200 pt-2 leading-relaxed">{selectedTicket.message}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 block font-mono">
                Admin Response / Solution
              </label>
              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type response to send to customer or add internal resolution notes..."
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">Set Status:</span>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value as SupportTicket['status'])}
                  className="px-2.5 py-1 bg-black/50 border border-white/10 rounded-lg text-xs text-white"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Send Reply'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
