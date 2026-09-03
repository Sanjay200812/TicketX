"use client";

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { getAllCoupons, saveCoupon, deleteCoupon } from '@/services/coupons.service';
import { Coupon } from '@/types/admin';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { admin } = useAdminAuth();

  const loadCoupons = async () => {
    setLoading(true);
    const data = await getAllCoupons();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !editingCoupon.code.trim()) return;

    setIsSaving(true);
    await saveCoupon(editingCoupon, admin ? { uid: admin.uid, name: admin.name } : undefined);
    setIsSaving(false);
    setEditingCoupon(null);
    await loadCoupons();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteCoupon(deleteTarget.id, deleteTarget.code, admin ? { uid: admin.uid, name: admin.name } : undefined);
    setIsDeleting(false);
    setDeleteTarget(null);
    await loadCoupons();
  };

  const columns: Column<Coupon>[] = [
    {
      header: 'Coupon Code & Info',
      accessor: 'code',
      sortable: true,
      render: (c) => (
        <div className="space-y-0.5">
          <div className="font-mono font-extrabold text-primary text-sm tracking-wider">
            {c.code}
          </div>
          <div className="text-[11px] text-gray-400 max-w-xs truncate">{c.description}</div>
        </div>
      ),
    },
    {
      header: 'Discount',
      accessor: 'discountAmount',
      sortable: true,
      render: (c) => (
        <span className="font-mono font-bold text-emerald-400">
          {c.discountType === 'flat' ? `₹${c.discountAmount} FLAT` : `${c.discountAmount}% OFF`}
        </span>
      ),
    },
    {
      header: 'Min Booking',
      accessor: 'minBookingAmount',
      sortable: true,
      render: (c) => (
        <span className="font-mono text-xs text-gray-300">
          ₹{c.minBookingAmount || 0}
        </span>
      ),
    },
    {
      header: 'Redemptions',
      accessor: 'usageCount',
      sortable: true,
      render: (c) => (
        <span className="font-mono text-xs text-gray-300">
          {c.usageCount || 0} / {c.usageLimit || '∞'}
        </span>
      ),
    },
    {
      header: 'Expiry Date',
      accessor: 'validUntil',
      sortable: true,
      render: (c) => (
        <span className="font-mono text-xs text-gray-400">
          {c.validUntil}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (c) => <AdminStatusBadge status={c.status || 'active'} />,

    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setEditingCoupon(c)}
            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            title="Edit Coupon"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(c)}
            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
            title="Delete Coupon"
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
        title="Promotional Coupons &amp; Discounts"
        description="Configure discount promo codes, usage redemption thresholds, and marketing campaigns."
        actions={
          <button
            onClick={() =>
              setEditingCoupon({
                id: '',
                code: '',
                description: '',
                discountType: 'flat',
                discountAmount: 50,
                minBookingAmount: 200,
                validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                usageLimit: 500,
                usageCount: 0,
                status: 'active',
                createdAt: new Date().toISOString(),
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Promo Code</span>
          </button>
        }
      />

      {loading ? (
        <AdminLoader text="Loading discount codes..." />
      ) : (
        <AdminDataTable
          data={coupons}
          columns={columns}
          keyExtractor={(c) => c.id}
          searchPlaceholder="Search coupon code or description..."
          searchFields={['code', 'description']}
          emptyIcon={Tag}
          emptyTitle="No coupons found"
          emptyDescription="Create discount vouchers to promote movie ticket sales."
        />
      )}

      {/* Coupon Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveCoupon}
            className="w-full max-w-md bg-[#16191f] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">
              {editingCoupon.id ? `Edit Coupon ${editingCoupon.code}` : 'Create Promo Code'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code}
                  onChange={(e) =>
                    setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. MOVIE50"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Discount Type
                </label>
                <select
                  value={editingCoupon.discountType}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      discountType: e.target.value as 'flat' | 'percentage',
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
                >
                  <option value="flat">Flat ₹ (Rupees)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Discount Value *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editingCoupon.discountAmount}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      discountAmount: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Min Order Amount (₹)
                </label>
                <input
                  type="number"
                  value={editingCoupon.minBookingAmount || 0}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      minBookingAmount: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Redemption Limit
                </label>
                <input
                  type="number"
                  value={editingCoupon.usageLimit || 500}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      usageLimit: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={editingCoupon.validUntil}
                  onChange={(e) =>
                    setEditingCoupon({ ...editingCoupon, validUntil: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Short Description
              </label>
              <input
                type="text"
                value={editingCoupon.description || ''}
                onChange={(e) =>
                  setEditingCoupon({ ...editingCoupon, description: e.target.value })
                }
                placeholder="e.g. Save ₹50 on minimum 2 tickets"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25"
              >
                {isSaving ? 'Saving...' : 'Save Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Delete */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete Coupon "${deleteTarget?.code}"?`}
        message="Customers will immediately be unable to apply this promo code at checkout."
        confirmLabel="Delete Coupon"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
