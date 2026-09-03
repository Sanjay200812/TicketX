"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: 'primary' | 'amber' | 'emerald' | 'rose' | 'sky';
  href?: string;
  tone?: string;
}

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'primary',
  href,
}: AdminStatCardProps) {

  const getBadgeClass = () => {
    switch (badgeColor) {
      case 'amber':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'rose':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'sky':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      default:
        return 'bg-primary/15 text-primary border-primary/30';
    }
  };

  const content = (
    <div className="bg-[#16191f] border border-white/10 hover:border-white/20 p-5 rounded-2xl transition-all duration-200 shadow-xl group relative overflow-hidden flex flex-col justify-between">
      {/* Glow Effect */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all pointer-events-none" />

      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-gray-300 group-hover:text-primary group-hover:border-primary/40 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl md:text-3xl font-black font-heading text-white tracking-tight">
          {value}
        </div>
        <div className="flex items-center justify-between gap-2">
          {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
          {badge && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getBadgeClass()}`}
            >
              {badge}
            </span>
          )}
        </div>
      </div>

      {href && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-primary font-bold opacity-80 group-hover:opacity-100">
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
