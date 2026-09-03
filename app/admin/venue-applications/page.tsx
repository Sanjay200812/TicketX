"use client";

import React, { useState, useEffect } from 'react';
import { Building2, Check, X, Eye, MapPin, CheckCircle2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import {
  getAllVenueApplications,
  updateVenueApplicationStatus,
  approveAndOnboardVenue,
  VenueApplication,
} from '@/services/venues.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminVenueApplicationsPage() {
  const [applications, setApplications] = useState<VenueApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<VenueApplication | null>(null);
  const [onboardingTarget, setOnboardingTarget] = useState<VenueApplication | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { admin } = useAdminAuth();

  const loadApplications = async () => {
    setLoading(true);
    const data = await getAllVenueApplications();
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleApprove = async () => {
    if (!onboardingTarget) return;
    setIsOnboarding(true);

    try {
      const thId = await approveAndOnboardVenue(
        onboardingTarget,
        admin ? { uid: admin.uid, name: admin.name } : undefined
      );
      setSuccessMsg(`Successfully approved "${onboardingTarget.theatreName}" and created partner cinema ID: ${thId}!`);
      setOnboardingTarget(null);
      await loadApplications();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      // Error handling
    } finally {
      setIsOnboarding(false);
    }
  };

  const handleStatusChange = async (app: VenueApplication, status: VenueApplication['status']) => {
    await updateVenueApplicationStatus(
      app.id,
      status,
      undefined,
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
    if (selectedApp && selectedApp.id === app.id) {
      setSelectedApp({ ...selectedApp, status });
    }
    await loadApplications();
  };

  const columns: Column<VenueApplication>[] = [
    {
      header: 'Cinema & City',
      accessor: 'theatreName',
      sortable: true,
      render: (a) => (
        <div className="space-y-0.5 min-w-[180px]">
          <div className="font-bold text-white truncate">{a.theatreName}</div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary shrink-0" />
            <span>{a.city}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Owner / Contact',
      accessor: 'ownerName',
      sortable: true,
      render: (a) => (
        <div className="space-y-0.5">
          <div className="font-bold text-gray-200">{a.ownerName || 'Cinema Owner'}</div>
          <div className="text-[11px] text-gray-400 font-mono">{a.phone}</div>
        </div>
      ),
    },
    {
      header: 'Auditorium Scale',
      accessor: 'seatingCapacity',
      sortable: true,
      render: (a) => (
        <div className="text-xs font-mono">
          <div className="text-emerald-400 font-bold">{a.seatingCapacity} Seats</div>
          <div className="text-gray-400 text-[10px]">{a.screensCount} Screen(s)</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (a) => <AdminStatusBadge status={a.status} />,
    },
    {
      header: 'Submitted',
      accessor: 'createdAt',
      sortable: true,
      render: (a) => (
        <span className="text-gray-400 font-mono text-[11px]">
          {new Date(a.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedApp(a)}
            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {a.status !== 'approved' && (
            <button
              onClick={() => setOnboardingTarget(a)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1"
              title="1-Click Approve & Onboard"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Partner Venue Applications"
        description="Review inbound cinema onboarding requests submitted through /partners/register-venue and onboard halls into TicketX."
      />

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <AdminLoader text="Loading venue applications..." />
      ) : (
        <AdminDataTable
          data={applications}
          columns={columns}
          keyExtractor={(a) => a.id}
          searchPlaceholder="Search by cinema name, owner, city, phone..."
          searchFields={['theatreName', 'ownerName', 'city', 'phone', 'email']}
          filters={[
            {
              label: 'Application Status',
              key: 'status',
              options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Under Review', value: 'under_review' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
              ],
            },
          ]}
          emptyIcon={Building2}
          emptyTitle="No applications found"
          emptyDescription="Partner hall registration requests submitted through /partners/register-venue will appear here."
        />
      )}

      {/* Application Detail View Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#16191f] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-primary font-bold uppercase">
                  Application Details
                </span>
                <h3 className="text-lg font-bold text-white">{selectedApp.theatreName}</h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1">
                <span className="text-gray-500 font-mono text-[10px] uppercase">Contact Information</span>
                <div className="font-bold text-white">{selectedApp.ownerName}</div>
                <div className="text-gray-300 font-mono">{selectedApp.email} • {selectedApp.phone}</div>
              </div>

              <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1">
                <span className="text-gray-500 font-mono text-[10px] uppercase">Physical Address</span>
                <div className="text-gray-200">{selectedApp.address || 'Address not provided'}</div>
                <div className="text-gray-400 font-mono">City: {selectedApp.city}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1">
                  <span className="text-gray-500 font-mono text-[10px] uppercase">Auditoriums</span>
                  <div className="font-bold text-white font-mono">{selectedApp.screensCount} Screens</div>
                </div>
                <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1">
                  <span className="text-gray-500 font-mono text-[10px] uppercase">Capacity</span>
                  <div className="font-bold text-emerald-400 font-mono">{selectedApp.seatingCapacity} Seats</div>
                </div>
              </div>

              {selectedApp.facilities && selectedApp.facilities.length > 0 && (
                <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
                  <span className="text-gray-500 font-mono text-[10px] uppercase">Amenities</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedApp.facilities.map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-gray-300 font-mono"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedApp, 'under_review')}
                  className="px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-bold"
                >
                  Under Review
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedApp, 'rejected')}
                  className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold"
                >
                  Reject
                </button>
              </div>

              {selectedApp.status !== 'approved' && (
                <button
                  type="button"
                  onClick={() => {
                    setOnboardingTarget(selectedApp);
                    setSelectedApp(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/25"
                >
                  Approve &amp; Onboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for 1-Click Onboard */}
      <AdminConfirmDialog
        isOpen={Boolean(onboardingTarget)}
        title={`Approve & Onboard "${onboardingTarget?.theatreName}"?`}
        message="This will automatically register this property as a live cinema in TicketX, enabling screen creation and showtime scheduling."
        confirmLabel="Approve & Onboard"
        isDestructive={false}
        isLoading={isOnboarding}
        onConfirm={handleApprove}
        onCancel={() => setOnboardingTarget(null)}
      />
    </div>
  );
}
