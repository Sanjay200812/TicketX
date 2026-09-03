"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { TheatreForm } from '@/components/admin/theatres/TheatreForm';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { getTheatreById, AdminTheatreInput } from '@/services/theatres.service';

export default function EditTheatrePage() {
  const params = useParams();
  const theatreId = params.id as string;
  const [theatre, setTheatre] = useState<AdminTheatreInput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!theatreId) return;
      setLoading(true);
      const data = await getTheatreById(theatreId);
      setTheatre(data);
      setLoading(false);
    }
    load();
  }, [theatreId]);

  if (loading) {
    return <AdminLoader text="Fetching theatre records..." />;
  }

  if (!theatre) {
    return (
      <div className="p-12 text-center text-gray-400">
        <h2 className="text-lg font-bold text-white mb-2">Theatre Not Found</h2>
        <p className="text-xs">The theatre ID &ldquo;{theatreId}&rdquo; does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Edit Theatre: ${theatre.name}`}
        description="Update location, physical address, facilities, and screening formats."
        backHref="/admin/theatres"
        backLabel="Back to Theatres"
      />
      <TheatreForm initialData={theatre} isNew={false} />
    </div>
  );
}
