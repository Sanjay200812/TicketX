"use client";

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Trash2, Copy, Check, Search, AlertCircle } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { getAllMedia, uploadMediaFile, deleteMediaItem, MediaItem } from '@/services/media.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

const CATEGORIES = [
  { id: 'all', label: 'All Files' },
  { id: 'movie_poster', label: 'Movie Posters' },
  { id: 'movie_banner', label: 'Movie Banners' },
  { id: 'event_poster', label: 'Event Posters' },
  { id: 'theatre_image', label: 'Theatres' },
  { id: 'promotional_banner', label: 'Promotions' },
  { id: 'general', label: 'General' },
];

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { admin } = useAdminAuth();

  const loadMedia = async () => {
    setLoading(true);
    const items = await getAllMedia();
    setMediaList(items);
    setLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          setErrorMsg('Only image files (JPG, PNG, WebP) are supported.');
          continue;
        }

        const cat = selectedCategory !== 'all' ? (selectedCategory as MediaItem['category']) : 'general';
        await uploadMediaFile(
          file,
          cat,
          admin ? { uid: admin.uid, name: admin.name } : undefined
        );
      }
      await loadMedia();
    } catch {
      setErrorMsg('Failed to upload one or more files.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteMediaItem(
      deleteTarget,
      admin ? { uid: admin.uid, name: admin.name } : undefined
    );
    setIsDeleting(false);
    setDeleteTarget(null);
    await loadMedia();
  };

  const filteredMedia = mediaList.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Media Library &amp; Asset Storage"
        description="Upload posters, banners, and cinema artwork stored on Firebase Storage CDN."
      />

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div className="p-8 bg-[#16191f] border-2 border-dashed border-white/15 hover:border-primary/50 rounded-3xl text-center space-y-3 transition-colors relative">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          disabled={uploading}
        />
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
          <Upload className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">
            {uploading ? 'Uploading to Firebase Storage...' : 'Drop images here or click to browse'}
          </h3>
          <p className="text-xs text-gray-400">
            Supports WebP, PNG, and JPG. Files are automatically compressed and indexed.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#16191f] p-3 md:p-4 rounded-2xl border border-white/10">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by filename..."
            className="w-full pl-9 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <AdminLoader text="Loading media assets..." />
      ) : filteredMedia.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group bg-[#16191f] border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-white/20 transition-all flex flex-col"
            >
              <div className="aspect-[3/4] relative bg-black overflow-hidden flex items-center justify-center">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleCopyUrl(item)}
                    className="p-2 rounded-xl bg-black/80 border border-white/20 text-white hover:text-primary transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-2 rounded-xl bg-black/80 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 space-y-1 bg-black/20">
                <div className="text-xs font-bold text-white truncate" title={item.name}>
                  {item.name}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span>{formatFileSize(item.sizeBytes)}</span>
                  <span className="capitalize">{item.category.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-[#16191f]/50 border border-white/10 rounded-2xl space-y-3">
          <ImageIcon className="w-10 h-10 mx-auto text-gray-600" />
          <h3 className="text-sm font-bold text-white">No media files found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Upload images by dropping them into the upload box above.
          </p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.name}"?`}
        message="This asset will be permanently removed from Firebase Storage. Any pages using this URL will lose the image."
        confirmLabel="Delete Asset"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
