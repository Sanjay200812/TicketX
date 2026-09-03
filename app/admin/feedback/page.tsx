"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, Star } from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminLoader } from '@/components/admin/AdminLoader';

interface FeedbackItem {
  id: string;
  type: string;
  rating: number;
  title: string;
  message: string;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/feedback');
      const data = await res.json();
      if (data.success && Array.isArray(data.feedback)) {
        setFeedback(data.feedback);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const columns: Column<FeedbackItem>[] = [
    {
      header: 'Rating',
      accessor: 'rating',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1 text-amber-400 font-bold font-mono text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{item.rating} / 5</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'type',
      sortable: true,
      render: (item) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
          {item.type}
        </span>
      ),
    },
    {
      header: 'Feedback Details',
      accessor: 'title',
      render: (item) => (
        <div className="space-y-0.5 max-w-md">
          <div className="font-bold text-white text-xs">{item.title}</div>
          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{item.message}</p>
        </div>
      ),
    },
    {
      header: 'Submitted',
      accessor: 'createdAt',
      sortable: true,
      render: (item) => (
        <span className="text-[11px] font-mono text-gray-400">
          {new Date(item.createdAt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customer Feedback"
        description="Review ratings, comments, and experience feedback submitted by public TicketX users."
      />

      {loading ? (
        <AdminLoader text="Loading customer feedback..." />
      ) : (
        <AdminDataTable
          data={feedback}
          columns={columns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search feedback by topic or category..."
          searchFields={['title', 'type', 'message']}
          emptyIcon={MessageSquare}
          emptyTitle="No feedback records found"
          emptyDescription="Customer ratings and comments will appear here as they are submitted."
        />
      )}
    </div>
  );
}
