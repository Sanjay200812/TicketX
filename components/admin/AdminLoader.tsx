"use client";

import React from 'react';

export function AdminLoader({ text = 'Loading TicketX Admin data...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-16 space-y-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      <span className="text-xs font-mono text-gray-400">{text}</span>
    </div>
  );
}
