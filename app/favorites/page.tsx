"use client";

import Link from 'next/link';
import { Heart, ArrowLeft, Ticket } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { MovieCard } from '@/components/movies/MovieCard';
import { Button } from '@/components/ui/button';

import { TicketXHeading } from '@/components/shared/TicketXHeading';

export default function FavoritesPage() {
  const { favoriteMovies } = useFavorites();

  return (
    <div className="min-h-screen bg-background text-foreground py-10 md:py-14">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-white mb-3">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Movies
            </Link>
            <TicketXHeading
              subtitle="Your saved collection of upcoming blockbusters and favorite shows."
              size="lg"
              icon={<Heart className="w-7 h-7 fill-primary text-primary" />}
            >
              Saved Movies
            </TicketXHeading>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-secondary border border-white/10 text-emerald-400 self-start md:self-auto">
            {favoriteMovies.length} {favoriteMovies.length === 1 ? 'Movie Saved' : 'Movies Saved'}
          </span>
        </div>

        {favoriteMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {favoriteMovies.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} />
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto my-16 text-center bg-secondary/30 border border-white/10 rounded-2xl p-8 md:p-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-500">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-heading text-white">No Saved Movies Yet</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore movies on TicketX and tap the <span className="text-rose-500 font-bold">Save</span> heart icon on any movie card to add it to your favorites list.
            </p>
            <Button asChild className="rounded-full px-6 font-bold text-xs gap-2">
              <Link href="/">
                <Ticket className="w-4 h-4" /> Browse Now Showing
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
