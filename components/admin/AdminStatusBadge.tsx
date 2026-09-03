"use client";

import React from 'react';

interface AdminStatusBadgeProps {
  status: string;
  className?: string;
}

export function AdminStatusBadge({ status, className = '' }: AdminStatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/\s+/g, '_');

  let colorClasses = 'bg-gray-500/15 text-gray-300 border-gray-500/30';

  switch (normalized) {
    case 'published':
    case 'active':
    case 'confirmed':
    case 'approved':
    case 'open':
    case 'paid':
    case 'available':
      colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      break;

    case 'scheduled':
    case 'under_review':
    case 'processing':
      colorClasses = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      break;

    case 'draft':
    case 'pending':
    case 'requested':
    case 'paused':
      colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      break;

    case 'sold_out':
    case 'coming_soon':
    case 'coming-soon':
      colorClasses = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      break;

    case 'archived':
    case 'closed':
    case 'completed':
    case 'refunded':
      colorClasses = 'bg-gray-500/15 text-gray-400 border-white/10';
      break;

    case 'cancelled':
    case 'rejected':
    case 'failed':
    case 'disabled':
    case 'suspended':
      colorClasses = 'bg-red-500/15 text-red-400 border-red-500/30';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider border uppercase ${colorClasses} ${className}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
