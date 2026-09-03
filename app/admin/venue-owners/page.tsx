"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, MapPin, ArrowRight } from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { VenueRegistrationRequest } from '@/lib/serverVenueStore';

export default function AdminVenueOwnersPage() {
  const [owners, setOwners] = useState<VenueRegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch('/api/register-venue');
        const data = await res.json();
        if (data.success && Array.isArray(data.requests)) {
          setOwners(data.requests);
        }
      } catch {
        // Fallback demo partner
        setOwners([
          {
            id: 'reg_pvr_01',
            contactName: 'Raghavendra Rao',
            businessName: 'VMax Cinemas Pvt Ltd',
            email: 'raghav@vmaxcinemas.com',
            phone: '+91 98480 11223',
            venueType: 'movie_theatre',
            bookingType: 'movies',
            address: 'Main Road, Arundelpet',
            city: 'Guntur',
            state: 'Andhra Pradesh',
            pincode: '522002',
            screensCount: 4,
            capacity: 920,
            facilities: ['4K Dolby Atmos', 'Recliner Seats', 'Cafeteria'],
            preferredContact: 'phone',
            status: 'approved',
            createdAt: '2026-08-10T10:00:00Z',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const columns: Column<VenueRegistrationRequest>[] = [
    {
      header: 'Partner & Business',
      accessor: 'businessName',
      sortable: true,
      render: (v) => (
        <div className="space-y-0.5">
          <div className="font-bold text-white text-xs">{v.businessName}</div>
          <div className="text-[11px] text-gray-400 font-mono">{v.contactName}</div>
        </div>
      ),
    },
    {
      header: 'Location & Venue',
      accessor: 'city',
      sortable: true,
      render: (v) => (
        <div className="space-y-0.5 text-xs font-mono">
          <div className="text-gray-300 font-bold flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary" />
            <span>{v.city}, {v.state}</span>
          </div>
          <div className="text-[10px] text-gray-500 uppercase">{v.venueType.replace('_', ' ')}</div>
        </div>
      ),
    },
    {
      header: 'Screens & Capacity',
      accessor: 'screensCount',
      sortable: true,
      render: (v) => (
        <div className="text-xs font-mono">
          <span className="font-bold text-primary">{v.screensCount || 1} Screens</span>
          <span className="text-gray-500 text-[11px] block">{v.capacity || 250} Seats</span>
        </div>
      ),
    },
    {
      header: 'Contact Point',
      accessor: 'phone',
      render: (v) => (
        <div className="space-y-0.5 text-xs font-mono text-gray-300">
          <div>{v.phone}</div>
          <div className="text-[11px] text-gray-500">{v.email}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (v) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${
            v.status === 'approved'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}
        >
          {v.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Venue Owners & Partners"
        description="Directory of cinema hall owners, event venue operators, and commercial partner accounts on TicketX."
        actions={
          <Link
            href="/admin/venue-applications"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold font-mono transition-all"
          >
            <span>Review Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {loading ? (
        <AdminLoader text="Loading partner accounts..." />
      ) : (
        <AdminDataTable
          data={owners}
          columns={columns}
          keyExtractor={(v) => v.id}
          searchPlaceholder="Search venue partners by business, contact, or city..."
          searchFields={['businessName', 'contactName', 'city', 'phone']}
          emptyIcon={Store}
          emptyTitle="No venue partner records"
          emptyDescription="Venue applications that receive approval will be listed here as active operators."
        />
      )}
    </div>
  );
}
