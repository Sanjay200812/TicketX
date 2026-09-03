"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { EventForm } from '@/components/admin/events/EventForm';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { getEventById, AdminEventInput } from '@/services/events.service';

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [eventData, setEventData] = useState<AdminEventInput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!eventId) return;
      setLoading(true);
      const data = await getEventById(eventId);
      setEventData(data);
      setLoading(false);
    }
    load();
  }, [eventId]);

  if (loading) {
    return <AdminLoader text="Fetching event details..." />;
  }

  if (!eventData) {
    return (
      <div className="p-12 text-center text-gray-400">
        <h2 className="text-lg font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-xs">The requested event &ldquo;{eventId}&rdquo; could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Edit Event: ${eventData.name}`}
        description="Update dates, venue, ticket tiers, and capacity."
        backHref="/admin/events"
        backLabel="Back to Events"
      />
      <EventForm initialData={eventData} isNew={false} />
    </div>
  );
}
