"use client";

import React, { useState, useEffect } from 'react';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminLoader } from '@/components/admin/AdminLoader';
import {
  getHomepageBanners,
  saveHomepageBanner,
  deleteHomepageBanner,
  getHomepageSections,
  saveHomepageSections,
} from '@/services/homepage.service';
import { HomepageBanner, HomepageSectionConfig } from '@/types/admin';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminHomepageCMSPage() {
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [sections, setSections] = useState<HomepageSectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<HomepageBanner | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { admin } = useAdminAuth();

  const loadData = async () => {
    setLoading(true);
    const [bList, sList] = await Promise.all([getHomepageBanners(), getHomepageSections()]);
    setBanners(bList);
    setSections(sList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleBanner = async (banner: HomepageBanner) => {
    const updated = { ...banner, isActive: !banner.isActive };
    await saveHomepageBanner(updated, admin ? { uid: admin.uid, name: admin.name } : undefined);
    await loadData();
  };

  const handleDeleteBanner = async (id: string) => {
    await deleteHomepageBanner(id, admin ? { uid: admin.uid, name: admin.name } : undefined);
    await loadData();
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    setSaving(true);
    await saveHomepageBanner(editingBanner, admin ? { uid: admin.uid, name: admin.name } : undefined);
    setSaving(false);
    setEditingBanner(null);
    await loadData();
  };

  const handleToggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    setSections((prev) => {
      const copy = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= copy.length) return prev;
      const temp = copy[idx];
      copy[idx] = copy[target];
      copy[target] = temp;
      return copy.map((s, i) => ({ ...s, displayOrder: i + 1 }));
    });
  };

  const handleSaveSections = async () => {
    setSaving(true);
    await saveHomepageSections(sections, admin ? { uid: admin.uid, name: admin.name } : undefined);
    setSaving(false);
    setSuccessMsg('Homepage sections arrangement saved!');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  if (loading) {
    return <AdminLoader text="Loading homepage CMS configuration..." />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Homepage CMS &amp; Layout Manager"
        description="Control top billboard hero banners, feature film highlights, and reorder public sections."
        actions={
          <button
            type="button"
            onClick={() =>
              setEditingBanner({
                id: '',
                title: '',
                subtitle: '',
                tagline: '',
                image: '',
                ctaText: 'Book Tickets',
                ctaLink: '/movies',
                isActive: true,
                displayOrder: banners.length + 1,
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hero Banner</span>
          </button>
        }
      />

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Hero Banners Carousel */}
      <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
        <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
          Top Hero Billboard Banners ({banners.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-black/40 border border-white/10 flex gap-4 items-start relative overflow-hidden group"
            >
              <div className="w-24 h-32 rounded-xl bg-black overflow-hidden border border-white/10 shrink-0">
                {b.image ? (
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white truncate">{b.title}</h4>
                  <button
                    onClick={() => handleToggleBanner(b)}
                    className={`p-1 rounded-md text-xs ${
                      b.isActive ? 'text-emerald-400' : 'text-gray-500'
                    }`}
                    title={b.isActive ? 'Active on Homepage' : 'Hidden'}
                  >
                    {b.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 truncate">{b.subtitle || 'No subtitle'}</p>
                <div className="text-[11px] font-mono text-primary pt-1">
                  CTA: {b.ctaText} → {b.ctaLink}
                </div>

                <div className="flex items-center gap-2 pt-3">
                  <button
                    onClick={() => setEditingBanner(b)}
                    className="px-3 py-1 rounded-lg border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    className="px-3 py-1 rounded-lg border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Homepage Sections Ordering & Visibility */}
      <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
            Public Homepage Sections Arrangement
          </h3>
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveSections}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Order'}</span>
          </button>
        </div>

        <div className="space-y-2">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                sec.enabled
                  ? 'bg-black/40 border-white/10'
                  : 'bg-black/20 border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-20"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(idx, 1)}
                    disabled={idx === sections.length - 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-20"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="font-mono text-xs font-bold text-gray-500 w-6">#{idx + 1}</span>

                <div>
                  <div className="text-sm font-bold text-white">{sec.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{sec.title}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleSection(sec.id)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
                  sec.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-white/5 text-gray-500 border-white/10'
                }`}
              >
                {sec.enabled ? 'Visible' : 'Hidden'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Banner Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveBanner}
            className="w-full max-w-md bg-[#16191f] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">
              {editingBanner.id ? 'Edit Hero Banner' : 'New Hero Banner'}
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Title *</label>
              <input
                type="text"
                required
                value={editingBanner.title}
                onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                placeholder="e.g. OG, Debba Debba"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">Subtitle</label>
              <input
                type="text"
                value={editingBanner.subtitle || ''}
                onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                placeholder="e.g. In Cinemas Now"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Backdrop Image URL
              </label>
              <input
                type="text"
                required
                value={editingBanner.image}
                onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
                placeholder="/posters/og.jpg or https://..."
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">CTA Text</label>
                <input
                  type="text"
                  value={editingBanner.ctaText || 'Book Tickets'}
                  onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">CTA Link</label>
                <input
                  type="text"
                  value={editingBanner.ctaLink || '/movies'}
                  onChange={(e) => setEditingBanner({ ...editingBanner, ctaLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25"
              >
                {saving ? 'Saving...' : 'Save Banner'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
