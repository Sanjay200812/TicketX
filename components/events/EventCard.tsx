"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { TicketXEvent } from '@/types/event';

interface EventCardProps {
  event: TicketXEvent;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const [imgError, setImgError] = useState(false);
  const startPrice = event.startingPrice || event.priceFrom || 2000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col justify-between bg-secondary/30 rounded-2xl p-4 border border-white/10 hover:border-primary/40 transition-all shadow-xl"
    >
      <div>
        <Link
          href={`/events/${event.id}`}
          className="block relative aspect-[16/9] overflow-hidden rounded-xl bg-secondary mb-4 border border-white/5"
        >
          {!imgError ? (
            <motion.img
              src={event.poster || event.image}
              alt={event.name || event.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a0a0d] via-[#121217] to-[#0a0a0e] flex flex-col items-center justify-center p-4 text-center">
              <Building2 className="w-8 h-8 text-primary/70 mb-2" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">{event.name || event.title}</span>
              <span className="text-[10px] text-muted-foreground mt-1">TicketX Event Pass</span>
            </div>
          )}

          <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-primary border border-primary/30 uppercase tracking-wider flex items-center gap-1 shadow-lg">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{event.eventType || 'Event'}</span>
          </div>
        </Link>

        <h3 className="font-bold text-lg leading-snug text-white group-hover:text-primary transition-colors mb-2">
          {event.name || event.title}
        </h3>

        <div className="space-y-1.5 text-xs text-muted-foreground mb-4 font-medium">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} • {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 font-semibold truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Starting from</p>
          <p className="font-black text-lg text-emerald-400 font-mono">₹{startPrice.toLocaleString()}</p>
        </div>

        <Link
          href={`/events/${event.id}`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-[0_0_12px_rgba(216,33,50,0.3)]"
        >
          <span>Book Tickets</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
