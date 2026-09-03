"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { MovieForm } from '@/components/admin/movies/MovieForm';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { getMovieById, AdminMovieInput } from '@/services/movies.service';

export default function EditMoviePage() {
  const params = useParams();
  const movieId = params.id as string;
  const [movie, setMovie] = useState<AdminMovieInput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!movieId) return;
      setLoading(true);
      const data = await getMovieById(movieId);
      setMovie(data);
      setLoading(false);
    }
    load();
  }, [movieId]);

  if (loading) {
    return <AdminLoader text="Fetching movie details..." />;
  }

  if (!movie) {
    return (
      <div className="p-12 text-center text-gray-400">
        <h2 className="text-lg font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-xs">The movie ID &ldquo;{movieId}&rdquo; does not exist in the database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Edit Movie: ${movie.title}`}
        description="Update synopsis, cast, crew, poster assets, languages, and publication status."
        backHref="/admin/movies"
        backLabel="Back to Movie Catalog"
      />
      <MovieForm initialData={movie} isNew={false} />
    </div>
  );
}
