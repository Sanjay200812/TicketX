"use client";

import { useState } from 'react';
import { Film } from 'lucide-react';

interface MoviePosterProps {
  src?: string;
  title: string;
  className?: string;
  aspectRatio?: string;
  rating?: number;
}

export function MoviePoster({ src, title, className = "", rating }: MoviePosterProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || error) {
    return (
      <div className={`relative bg-gradient-to-br from-[#241116] via-[#16161a] to-[#0d0d11] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between p-4 shadow-xl select-none ${className}`}>
        <div className="flex justify-between items-start">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
            <Film className="w-4 h-4" />
          </div>
          {rating && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-amber-400 border border-amber-500/20">
              ★ {rating}
            </span>
          )}
        </div>

        <div className="space-y-1 my-auto text-center py-4">
          <h3 className="font-bold text-white text-base leading-snug line-clamp-2">{title}</h3>
          <span className="text-[10px] text-primary uppercase font-bold tracking-widest">TICKETX</span>
        </div>

        <div className="text-[10px] text-muted-foreground text-center border-t border-white/5 pt-2 font-mono">
          Cinema Release
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-secondary/30 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-secondary/50 animate-pulse flex items-center justify-center text-muted-foreground/30">
          <Film className="w-6 h-6" />
        </div>
      )}
      <img
        src={src}
        alt={title}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
