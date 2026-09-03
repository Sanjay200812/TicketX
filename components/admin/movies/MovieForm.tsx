"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Film,
  Upload,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';

import { AdminMovieInput, saveMovie } from '@/services/movies.service';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { uploadMediaFile } from '@/services/media.service';

const ALL_LANGUAGES = ['Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada', 'English'];
const ALL_GENRES = ['Action', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Sci-Fi', 'Devotional', 'Horror', 'Family', 'Crime'];
const ALL_LOCATIONS = [
  { id: 'guntur', name: 'Guntur' },
  { id: 'vijayawada', name: 'Vijayawada' },
  { id: 'nrt', name: 'Narasaraopeta' },
  { id: 'sattenapalli', name: 'Sattenapalli' },
  { id: 'edlapadu', name: 'Edlapadu' },
  { id: 'martur', name: 'Martur' },
  { id: 'hyderabad', name: 'Hyderabad' },
];

interface MovieFormProps {
  initialData?: AdminMovieInput | null;
  isNew?: boolean;
}

export function MovieForm({ initialData, isNew = false }: MovieFormProps) {
  const router = useRouter();
  const { admin } = useAdminAuth();

  const [form, setForm] = useState<AdminMovieInput>(() => ({
    id: initialData?.id || '',
    slug: initialData?.slug || '',
    title: initialData?.title || '',
    shortDescription: initialData?.shortDescription || '',
    description: initialData?.description || '',
    poster: initialData?.poster || '',
    backdrop: initialData?.backdrop || '',
    trailerUrl: initialData?.trailerUrl || '',
    language: initialData?.language || 'Telugu',
    languages: initialData?.languages || (initialData?.language ? [initialData.language] : ['Telugu']),
    genres: initialData?.genres || ['Action'],
    duration: initialData?.duration || '2h 15m',
    certificate: initialData?.certificate || 'U/A',
    releaseDate: initialData?.releaseDate || new Date().toISOString().split('T')[0],
    rating: initialData?.rating || 8.5,
    status: initialData?.status || 'draft',
    featured: initialData?.featured || false,
    trending: initialData?.trending || false,
    comingSoon: initialData?.comingSoon || false,
    nowShowing: initialData?.nowShowing ?? true,
    availableLocations: initialData?.availableLocations || ['guntur', 'vijayawada', 'nrt'],
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    cast: initialData?.cast || [
      { id: 'c1', name: 'Lead Actor', character: 'Hero', image: '' },
    ],
    crew: initialData?.crew || [
      { id: 'cr1', name: 'Director Name', role: 'Director' },
      { id: 'cr2', name: 'Producer Name', role: 'Producer' },
      { id: 'cr3', name: 'Music Composer', role: 'Music' },
    ],
  }));

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false);

  // Sync title to slug automatically on new movies
  const handleTitleChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: isNew
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : prev.slug,
    }));
  };

  const handleLanguageToggle = (lang: string) => {
    setForm((prev) => {
      const existing = prev.languages || [];
      const updated = existing.includes(lang)
        ? existing.filter((l) => l !== lang)
        : [...existing, lang];
      return {
        ...prev,
        languages: updated,
        language: updated[0] || 'Telugu',
      };
    });
  };

  const handleGenreToggle = (g: string) => {
    setForm((prev) => {
      const existing = prev.genres || [];
      const updated = existing.includes(g)
        ? existing.filter((item) => item !== g)
        : [...existing, g];
      return { ...prev, genres: updated };
    });
  };

  const handleLocationToggle = (locId: string) => {
    setForm((prev) => {
      const existing = prev.availableLocations || [];
      const updated = existing.includes(locId)
        ? existing.filter((id) => id !== locId)
        : [...existing, locId];
      return { ...prev, availableLocations: updated };
    });
  };

  // Cast Handlers
  const addCastMember = () => {
    setForm((prev) => ({
      ...prev,
      cast: [
        ...(prev.cast || []),
        { id: `c_${Date.now()}`, name: '', character: '', image: '' },
      ],
    }));
  };

  const updateCastMember = (idx: number, field: string, val: string) => {
    setForm((prev) => {
      const list = [...(prev.cast || [])];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, cast: list };
    });
  };

  const removeCastMember = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      cast: (prev.cast || []).filter((_, i) => i !== idx),
    }));
  };

  const moveCastMember = (idx: number, dir: -1 | 1) => {
    setForm((prev) => {
      const list = [...(prev.cast || [])];
      const target = idx + dir;
      if (target < 0 || target >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[target];
      list[target] = temp;
      return { ...prev, cast: list };
    });
  };

  // Crew Handlers
  const addCrewMember = () => {
    setForm((prev) => ({
      ...prev,
      crew: [
        ...(prev.crew || []),
        { id: `cr_${Date.now()}`, name: '', role: 'Director' },
      ],
    }));
  };

  const updateCrewMember = (idx: number, field: string, val: string) => {
    setForm((prev) => {
      const list = [...(prev.crew || [])];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, crew: list };
    });
  };

  const removeCrewMember = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      crew: (prev.crew || []).filter((_, i) => i !== idx),
    }));
  };

  const moveCrewMember = (idx: number, dir: -1 | 1) => {
    setForm((prev) => {
      const list = [...(prev.crew || [])];
      const target = idx + dir;
      if (target < 0 || target >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[target];
      list[target] = temp;
      return { ...prev, crew: list };
    });
  };

  // Direct File Upload to Firebase Storage
  const handleFileUpload = async (file: File, type: 'poster' | 'backdrop') => {
    try {
      if (type === 'poster') setUploadingPoster(true);
      if (type === 'backdrop') setUploadingBackdrop(true);

      const media = await uploadMediaFile(
        file,
        type === 'poster' ? 'movie_poster' : 'movie_banner',
        admin ? { uid: admin.uid, name: admin.name } : undefined
      );

      setForm((prev) => ({
        ...prev,
        [type]: media.url,
      }));
    } catch (err) {
      console.error('File upload error:', err);
      setErrorMsg('Failed to upload image file to storage.');
    } finally {
      if (type === 'poster') setUploadingPoster(false);
      if (type === 'backdrop') setUploadingBackdrop(false);
    }
  };

  const handleSave = async (statusOverride?: 'draft' | 'published') => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!form.title.trim()) {
      setErrorMsg('Movie title is required.');
      return;
    }

    setSaving(true);

    try {
      const payload: AdminMovieInput = {
        ...form,
        status: statusOverride || form.status,
      };

      const savedId = await saveMovie(
        payload,
        admin ? { uid: admin.uid, name: admin.name } : undefined
      );

      setSuccessMsg(`Movie saved successfully as ${payload.status?.toUpperCase()}.`);

      if (isNew) {
        setTimeout(() => {
          router.push(`/admin/movies/${savedId}/edit`);
        }, 1000);
      }
    } catch (err) {
      console.error('Save movie error:', err);
      setErrorMsg('Failed to save movie to database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#16191f] border border-white/10 rounded-2xl">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-white">
            {isNew ? 'Create New Movie' : `Editing: ${form.title || 'Untitled'}`}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 uppercase text-gray-300">
            {form.status}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-xs font-bold text-gray-300 flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 flex items-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{saving ? 'Publishing...' : 'Publish Movie'}</span>
          </button>
        </div>
      </div>

      {/* Form Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Info, Descriptions, Cast & Crew */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">
              General Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Movie Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. OG, Debba Debba"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. og-they-call-him-og"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm font-mono text-gray-300 placeholder:text-gray-600 outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Short Description / Tagline
              </label>
              <input
                type="text"
                value={form.shortDescription || ''}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="Brief commercial pitch or tagline"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Full Synopsis / Description
              </label>
              <textarea
                rows={4}
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Full plot synopsis and details..."
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-primary leading-relaxed"
              />
            </div>
          </div>

          {/* Languages & Genres */}
          <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">
              Languages &amp; Categorization
            </h2>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2 font-mono">
                Audio Languages
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_LANGUAGES.map((lang) => {
                  const selected = form.languages?.includes(lang);
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => handleLanguageToggle(lang)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        selected
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'bg-black/40 border border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2 font-mono">
                Film Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_GENRES.map((g) => {
                  const selected = form.genres?.includes(g);
                  return (
                    <button
                      type="button"
                      key={g}
                      onClick={() => handleGenreToggle(g)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        selected
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                          : 'bg-black/40 border border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dynamic Cast Editor */}
          <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">
                Cast Members ({form.cast?.length || 0})
              </h2>
              <button
                type="button"
                onClick={addCastMember}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-primary/20 border border-primary/40 text-primary text-xs font-bold hover:bg-primary/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Cast Member</span>
              </button>
            </div>

            <div className="space-y-3">
              {form.cast?.map((member, idx) => (
                <div
                  key={member.id || idx}
                  className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveCastMember(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCastMember(idx, 1)}
                      disabled={idx === (form.cast?.length || 1) - 1}
                      className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Actor Name"
                    value={member.name}
                    onChange={(e) => updateCastMember(idx, 'name', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white"
                  />

                  <input
                    type="text"
                    placeholder="Character / Role (e.g. Ojas Gambheera)"
                    value={member.character || ''}
                    onChange={(e) => updateCastMember(idx, 'character', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white"
                  />

                  <input
                    type="text"
                    placeholder="Photo Image URL"
                    value={member.image || ''}
                    onChange={(e) => updateCastMember(idx, 'image', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white"
                  />

                  <button
                    type="button"
                    onClick={() => removeCastMember(idx)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Crew Editor */}
          <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">
                Crew &amp; Technical Department ({form.crew?.length || 0})
              </h2>
              <button
                type="button"
                onClick={addCrewMember}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-primary/20 border border-primary/40 text-primary text-xs font-bold hover:bg-primary/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Crew Member</span>
              </button>
            </div>

            <div className="space-y-3">
              {form.crew?.map((member, idx) => (
                <div
                  key={member.id || idx}
                  className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveCrewMember(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCrewMember(idx, 1)}
                      disabled={idx === (form.crew?.length || 1) - 1}
                      className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Crew Member Name"
                    value={member.name}
                    onChange={(e) => updateCrewMember(idx, 'name', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white"
                  />

                  <select
                    value={member.role}
                    onChange={(e) => updateCrewMember(idx, 'role', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white outline-none"
                  >
                    <option value="Director">Director</option>
                    <option value="Producer">Producer</option>
                    <option value="Writer">Writer</option>
                    <option value="Music">Music Director</option>
                    <option value="Cinematography">Cinematography</option>
                    <option value="Editor">Editor</option>
                    <option value="Action Director">Action Director</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => removeCrewMember(idx)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Status, Media Uploaders, Specs & Flags */}
        <div className="space-y-6">
          {/* Status & Publication */}
          <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">
              Publication Status
            </h2>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as AdminMovieInput['status'],
                  })
                }
                className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published (Public)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded border-white/20 bg-black/40 text-primary"
                />
                <span className="font-bold">Featured on Homepage</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.trending}
                  onChange={(e) => setForm({ ...form, trending: e.target.checked })}
                  className="rounded border-white/20 bg-black/40 text-primary"
                />
                <span className="font-bold">Trending Tag</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.comingSoon}
                  onChange={(e) => setForm({ ...form, comingSoon: e.target.checked })}
                  className="rounded border-white/20 bg-black/40 text-primary"
                />
                <span className="font-bold">Coming Soon Section</span>
              </label>
            </div>
          </div>

          {/* Media & Artwork */}
          <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">
              Artwork &amp; Trailers
            </h2>

            {/* Poster Uploader */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Vertical Poster URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.poster || ''}
                  onChange={(e) => setForm({ ...form, poster: e.target.value })}
                  placeholder="/posters/og.jpg or https://..."
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                />
                <label className="px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingPoster ? 'Uploading...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'poster');
                    }}
                  />
                </label>
              </div>
              {form.poster && (
                <div className="mt-2 w-20 h-28 rounded-lg border border-white/10 overflow-hidden bg-black">
                  <img src={form.poster} alt="Poster" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Backdrop Uploader */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Landscape Backdrop URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.backdrop || ''}
                  onChange={(e) => setForm({ ...form, backdrop: e.target.value })}
                  placeholder="/banners/og-backdrop.jpg"
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                />
                <label className="px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingBackdrop ? 'Uploading...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'backdrop');
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Trailer URL */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                YouTube Trailer URL
              </label>
              <input
                type="text"
                value={form.trailerUrl || ''}
                onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Film Specifications */}
          <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">
              Specifications
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Duration
                </label>
                <input
                  type="text"
                  value={form.duration || ''}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="2h 25m"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Certificate
                </label>
                <select
                  value={form.certificate}
                  onChange={(e) => setForm({ ...form, certificate: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
                >
                  <option value="U">U (Universal)</option>
                  <option value="U/A">U/A (12+)</option>
                  <option value="A">A (Adults Only)</option>
                  <option value="R">R (Restricted)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Release Date
                </label>
                <input
                  type="date"
                  value={form.releaseDate || ''}
                  onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Rating (0 - 10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={form.rating || 8.5}
                  onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Regional Availability */}
          <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-3">
            <h2 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">
              City Availability
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {ALL_LOCATIONS.map((loc) => (
                <label
                  key={loc.id}
                  className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.availableLocations?.includes(loc.id)}
                    onChange={() => handleLocationToggle(loc.id)}
                    className="rounded border-white/20 bg-black/40 text-primary"
                  />
                  <span>{loc.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#16191f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-xs font-mono font-bold text-primary uppercase">
                Public Movie Card Preview
              </span>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-32 h-44 rounded-2xl bg-black border border-white/10 overflow-hidden shrink-0 shadow-xl">
                {form.poster ? (
                  <img src={form.poster} alt={form.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    No Poster
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <h3 className="text-2xl font-black font-heading text-white">{form.title || 'Untitled Movie'}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-white/10 font-bold">{form.certificate}</span>
                  <span>{form.languages?.join(', ')}</span>
                  <span>•</span>
                  <span>{form.duration}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold font-mono">★ {form.rating}/10</span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                  {form.description || 'No description provided.'}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Now Showing
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-black/40 border-t border-white/10 text-right">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
