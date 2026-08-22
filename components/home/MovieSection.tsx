"use client";

import { motion } from 'framer-motion';
import { Movie } from '@/types/movie';
import { MovieCard } from '@/components/movies/MovieCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  viewAllLink?: string;
}

export function MovieSection({ title, movies, viewAllLink }: MovieSectionProps) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="py-8 md:py-16 relative z-10">
      <div className="container mx-auto px-4 md:px-6">
        {title && (
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-heading tracking-tight">{title}</h2>
            {viewAllLink && (
              <Button variant="link" className="text-primary hidden md:inline-flex" asChild>
                <Link href={viewAllLink}>View All →</Link>
              </Button>
            )}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
        >
          {movies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
          ))}
        </motion.div>

        {viewAllLink && (
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="rounded-full w-full" asChild>
              <Link href={viewAllLink}>View All {title}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
