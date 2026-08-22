"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Star, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Movie } from '@/types/movie';
import { Button } from '@/components/ui/button';

interface HeroBannerProps {
  movies: Movie[];
}

export function HeroBanner({ movies }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const heroMovies = movies.length > 0 ? movies : [
    {
      id: "irumudi",
      title: "Irumudi",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800",
      backdrop: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=1920",
      rating: 8.8,
      language: "Telugu",
      genres: ["Drama", "Action"],
      duration: "2h 25m",
      releaseDate: "2026-08-20",
      description: "A devotional action thriller following a sacred journey filled with high stakes, destiny, and deep emotions."
    }
  ];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroMovies.length);
  }, [heroMovies.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
  }, [heroMovies.length]);

  useEffect(() => {
    if (isPaused || heroMovies.length <= 1) return;
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [handleNext, isPaused, heroMovies.length]);

  const currentMovie = heroMovies[currentIndex] || heroMovies[0];

  return (
    <div
      className="relative w-full h-[520px] md:h-[600px] bg-black overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated Backdrop Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.55, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={currentMovie.backdrop || currentMovie.poster}
            alt={currentMovie.title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Modern Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />

      {/* Content Overlay */}
      <div className="container relative z-10 mx-auto px-4 md:px-6 h-full flex items-end pb-12 md:pb-16">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMovie.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{currentMovie.rating || 8.5}</span>
                </span>

                {currentMovie.language && (
                  <span className="px-3 py-1 rounded-full bg-secondary/80 text-gray-200 border border-white/10">
                    {currentMovie.language}
                  </span>
                )}

                {currentMovie.genres?.slice(0, 2).map((g) => (
                  <span key={g} className="px-3 py-1 rounded-full bg-white/10 text-white border border-white/10">
                    {g}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-extrabold font-heading text-white tracking-tight leading-none drop-shadow-lg">
                {currentMovie.title}
              </h1>

              {/* Synopsis */}
              {currentMovie.description && (
                <p className="text-sm md:text-base text-gray-300 line-clamp-2 max-w-xl leading-relaxed">
                  {currentMovie.description}
                </p>
              )}

              {/* Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <Button asChild size="lg" className="rounded-full font-bold px-8 gap-2 shadow-[0_0_20px_rgba(216,33,50,0.4)]">
                  <Link href={`/shows/${currentMovie.id}`}>
                    <Ticket className="w-4 h-4" /> Book Tickets Now
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10 gap-2">
                  <Link href={`/movies/${currentMovie.id}`}>
                    <Play className="w-4 h-4 fill-white" /> View Details
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Next / Prev Controls */}
      {heroMovies.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {heroMovies.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
