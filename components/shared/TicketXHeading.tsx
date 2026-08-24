"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface TicketXHeadingProps {
  children: React.ReactNode;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  highlight?: string;
  icon?: React.ReactNode;
}

export function TicketXHeading({
  children,
  subtitle,
  size = 'lg',
  className,
  as: Component = 'h1',
  icon,
}: TicketXHeadingProps) {
  const sizeClasses = {
    sm: 'text-lg md:text-xl tracking-wider',
    md: 'text-xl md:text-2xl tracking-wide',
    lg: 'text-2xl md:text-4xl tracking-wide',
    xl: 'text-3xl md:text-5xl tracking-widest',
  };

  return (
    <div className="space-y-1.5">
      <Component
        className={cn(
          'ticketx-page-title text-white flex items-center gap-3 drop-shadow-sm',
          sizeClasses[size],
          className
        )}
      >
        {icon && <span className="text-primary shrink-0">{icon}</span>}
        <span>{children}</span>
      </Component>
      {subtitle && (
        <p className="text-xs md:text-sm text-muted-foreground font-sans font-medium max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
