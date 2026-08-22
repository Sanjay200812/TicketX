"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Ticket, Heart } from 'lucide-react';
import { Movie } from '@/types/movie';
import { MoviePoster } from '@/components/shared/MoviePoster';
import { useFavorites } from '@/context/FavoritesContext';

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(movie.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col justify-between bg-secondary/40 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(216,33,50,0.3)] transition-all duration-300"
    >
      <Link href={`/movies/${movie.id}`} className="block relative aspect-[2/3] w-full overflow-hidden">
        <MoviePoster
          src={movie.poster}
          title={movie.title}
          rating={movie.rating}
          className="w-full h-full transform group-hover:scale-105 transition-transform duration-500"
        />

        {/* Favorite Save Button Top Left (Requirement 1) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(movie.id);
          }}
          className={`absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-lg border ${
            saved
              ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.8)]'
              : 'bg-black/70 backdrop-blur-md text-gray-300 border-white/20 hover:text-white hover:border-white/40'
          }`}
          title={saved ? 'Remove from Saved' : 'Save Movie'}
        >
          <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-white text-white' : 'text-gray-300'}`} />
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-primary text-white">
              {movie.language || 'Telugu'}
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Ticket className="w-3.5 h-3.5 text-primary" />
              <span>Book Showtimes</span>
            </div>
          </div>
        </div>

        {/* Rating Pill Top Right */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-400 text-xs font-bold border border-amber-500/20">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{movie.rating || 8.0}</span>
        </div>
      </Link>

      <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
        <div>
          <Link href={`/movies/${movie.id}`}>
            <h3 className="font-bold text-base text-white group-hover:text-primary transition-colors line-clamp-1">
              {movie.title}
            </h3>
          </Link>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span className="truncate">{movie.genres?.join(', ') || 'Feature Film'}</span>
            {movie.duration && <span className="shrink-0 font-mono text-[11px]">{movie.duration}</span>}
          </div>
        </div>

        {movie.cinemaCount !== undefined && (
          <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-center">
            Available at {movie.cinemaCount} {movie.cinemaCount === 1 ? 'theatre' : 'theatres'}
          </div>
        )}

        <Link
          href={`/shows/${movie.id}`}
          className="w-full py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 text-xs font-bold text-center transition-all duration-200 block"
        >
          Book Tickets →
        </Link>
      </div>
    </motion.div>
  );
}
