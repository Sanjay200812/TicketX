"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Film, Plus, Edit2, Copy, Trash2, Eye, Globe } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { AdminLoader } from '@/components/admin/AdminLoader';
import {
  getAllMovies,
  deleteMovie,
  updateMovieStatus,
  saveMovie,
  AdminMovieInput,
} from '@/services/movies.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<AdminMovieInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminMovieInput | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { admin } = useAdminAuth();


  const loadMovies = async () => {
    setLoading(true);
    const data = await getAllMovies();
    setMovies(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleDuplicate = async (movie: AdminMovieInput) => {
    const newId = `${movie.id}-copy-${Date.now().toString(36).substring(2, 6)}`;
    const duplicated: AdminMovieInput = {
      ...movie,
      id: newId,
      slug: newId,
      title: `${movie.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveMovie(duplicated, admin ? { uid: admin.uid, name: admin.name } : undefined);
    await loadMovies();
  };

  const handleTogglePublish = async (movie: AdminMovieInput) => {
    const nextStatus = movie.status === 'published' ? 'draft' : 'published';
    await updateMovieStatus(
      movie.id,
      nextStatus,
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
    await loadMovies();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteMovie(
      deleteTarget.id,
      deleteTarget.title,
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
    setIsDeleting(false);
    setDeleteTarget(null);
    await loadMovies();
  };

  const columns: Column<AdminMovieInput>[] = [
    {
      header: 'Poster & Title',
      accessor: 'title',
      sortable: true,
      render: (m) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-10 h-14 rounded-lg bg-black/60 border border-white/10 overflow-hidden shrink-0">
            {m.poster ? (
              <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                No Img
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/admin/movies/${m.id}/edit`}
              className="font-bold text-white hover:text-primary transition-colors truncate block"
            >
              {m.title}
            </Link>
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 flex-wrap">
              <span>{m.languages?.join(', ') || m.language || 'Telugu'}</span>
              <span>•</span>
              <span>{m.certificate || 'U/A'}</span>
              <span>•</span>
              <span>{m.duration || '2h 15m'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Release Date',
      accessor: 'releaseDate',
      sortable: true,
      render: (m) => (
        <span className="font-mono text-gray-300">
          {m.releaseDate ? new Date(m.releaseDate).toLocaleDateString() : 'TBA'}
        </span>
      ),
    },
    {
      header: 'Rating',
      accessor: 'rating',
      sortable: true,
      render: (m) => (
        <span className="font-mono font-bold text-amber-400">
          {m.rating ? `★ ${m.rating}` : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (m) => <AdminStatusBadge status={m.status || 'published'} />,
    },
    {
      header: 'Featured',
      accessor: 'featured',
      render: (m) =>
        m.featured ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/30">
            Featured
          </span>
        ) : (
          <span className="text-gray-500 text-xs">—</span>
        ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Toggle Publish */}
          <button
            onClick={() => handleTogglePublish(m)}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
              m.status === 'published'
                ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
            }`}
            title={m.status === 'published' ? 'Unpublish to Draft' : 'Publish Movie'}
          >
            <Globe className="w-3.5 h-3.5" />
          </button>

          {/* Edit */}
          <Link
            href={`/admin/movies/${m.id}/edit`}
            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            title="Edit Movie"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>

          {/* Duplicate */}
          <button
            onClick={() => handleDuplicate(m)}
            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            title="Duplicate Movie"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Public Preview */}
          <Link
            href={`/movies/${m.id}`}
            target="_blank"
            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            title="Public Page Preview"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          {/* Delete */}
          <button
            onClick={() => setDeleteTarget(m)}
            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
            title="Delete Movie"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Movie Catalog Management"
        description="Search, filter, edit, schedule, publish and manage feature films on TicketX."
        actions={
          <Link
            href="/admin/movies/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Movie</span>
          </Link>
        }
      />

      {loading ? (
        <AdminLoader text="Loading movie catalog from database..." />
      ) : (
        <AdminDataTable
          data={movies}
          columns={columns}
          keyExtractor={(m) => m.id}
          searchPlaceholder="Search by title, language, director..."
          searchFields={['title', 'language', 'certificate']}
          filters={[
            {
              label: 'Status',
              key: 'status',
              options: [
                { label: 'Published', value: 'published' },
                { label: 'Draft', value: 'draft' },
                { label: 'Scheduled', value: 'scheduled' },
                { label: 'Archived', value: 'archived' },
              ],
            },
          ]}
          bulkActions={[
            {
              label: 'Bulk Publish',
              action: async (ids) => {
                for (const id of ids) {
                  await updateMovieStatus(id, 'published', admin ? { uid: admin.uid, name: admin.name } : undefined);
                }
                await loadMovies();
              },
            },
            {
              label: 'Bulk Archive',
              action: async (ids) => {
                for (const id of ids) {
                  await updateMovieStatus(id, 'archived', admin ? { uid: admin.uid, name: admin.name } : undefined);
                }
                await loadMovies();
              },
            },
          ]}
          emptyIcon={Film}
          emptyTitle="No movies found"
          emptyDescription="Start by adding your first movie to publish it across the TicketX public platform."
          emptyActionHref="/admin/movies/new"
          emptyActionLabel="Add Movie"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.title}"?`}
        message="This action will remove this movie from public listings and unassign any active screenings. This cannot be undone."
        confirmLabel="Delete Movie"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
