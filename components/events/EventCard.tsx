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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col justify-between bg-secondary/30 rounded-3xl p-4 md:p-5 border border-white/10 hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(216,33,50,0.25)] transition-all duration-300 backdrop-blur-md"
    >
      <div>
        <Link
          href={`/events/${event.id}`}
          className="block relative aspect-[16/9] overflow-hidden rounded-2xl bg-secondary mb-4 border border-white/5 shadow-lg group"
        >
          {!imgError ? (
            <motion.img
              src={event.poster || event.image}
              alt={event.name || event.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a0a0d] via-[#121217] to-[#0a0a0e] flex flex-col items-center justify-center p-4 text-center">
              <Building2 className="w-8 h-8 text-primary/70 mb-2 animate-bounce" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">{event.name || event.title}</span>
              <span className="text-[10px] text-muted-foreground mt-1">TicketX Event Pass</span>
            </div>
          )}

          {/* Glowing Event Type Badge */}
          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-primary border border-primary/40 uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{event.eventType || 'Event'}</span>
          </div>
        </Link>

        <h3 className="font-bold text-lg leading-snug text-white group-hover:text-primary transition-colors mb-2 line-clamp-1">
          {event.name || event.title}
        </h3>

        <div className="space-y-2 text-xs text-muted-foreground mb-4 font-medium">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-gray-300">
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
          <p className="font-black text-xl text-emerald-400 font-mono tracking-tight">₹{startPrice.toLocaleString()}</p>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href={`/events/${event.id}`}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-primary text-white text-xs font-extrabold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(216,33,50,0.4)] group/btn"
          >
            <span>Book Tickets</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
