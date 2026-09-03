"use client";

import React, { useState, useEffect } from 'react';
import {
  Save,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminLoader } from '@/components/admin/AdminLoader';
import {
  getSystemSettings,
  saveSystemSettings,
  seedStaticDataToFirestore,
  SeedReport,
} from '@/services/settings.service';
import { SystemSettings } from '@/types/admin';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedReport, setSeedReport] = useState<SeedReport | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { admin } = useAdminAuth();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getSystemSettings();
      setSettings(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await saveSystemSettings(settings, admin ? { uid: admin.uid, name: admin.name } : undefined);
      setSuccessMsg('Operational settings saved successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerSeed = async () => {
    const confirmed = window.confirm(
      'This will import all static movies, theatres, showtimes, locations, events, and seat layouts into your Firestore database. Do you wish to continue?'
    );
    if (!confirmed) return;

    setSeeding(true);
    setSeedReport(null);
    setErrorMsg(null);

    try {
      const report = await seedStaticDataToFirestore(
        admin ? { uid: admin.uid, name: admin.name } : undefined
      );
      setSeedReport(report);
      setSuccessMsg('Database seeding completed successfully!');
    } catch {
      setErrorMsg('Failed to execute database migration.');
    } finally {
      setSeeding(false);
    }
  };

  if (loading || !settings) {
    return <AdminLoader text="Loading operational parameters..." />;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <AdminPageHeader
        title="Platform Settings &amp; Data Migration"
        description="Configure ticket booking convenience fees, maintenance alerts, and populate Firestore from static catalogs."
      />

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

      {/* 1. One-Click Static-to-Firestore Seeder */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-purple-950/40 via-[#16191f] to-[#16191f] border border-purple-500/30 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              One-Click Static-to-Firestore Database Seeder
            </h3>
            <p className="text-xs text-gray-400">
              Populate live Firestore collections with TicketX movies, Andhra theatres, screens, and seating matrices.
            </p>
          </div>
        </div>

        <div className="p-4 bg-black/40 border border-white/10 rounded-2xl text-xs space-y-2">
          <div className="font-mono text-gray-300 font-bold">Catalog datasets to be synchronized:</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-gray-400 text-[11px]">
            <div>• 7 Regional Cities</div>
            <div>• 14 Partner Theatres</div>
            <div>• 14 Feature Movies</div>
            <div>• Real Screening Shows</div>
            <div>• 3 Live Events</div>
            <div>• Full Seat Layouts</div>
          </div>
        </div>

        {seedReport && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Migration Completed in {(seedReport.durationMs / 1000).toFixed(1)}s</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-gray-300">
              <div>Movies: {seedReport.movies}</div>
              <div>Theatres: {seedReport.theatres}</div>
              <div>Shows: {seedReport.shows}</div>
              <div>Locations: {seedReport.locations}</div>
              <div>Events: {seedReport.events}</div>
              <div>Layouts: {seedReport.seatLayouts}</div>
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={seeding}
          onClick={handleTriggerSeed}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all"
        >
          {seeding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Migrating Data into Firestore...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Populate Database from Static Catalog</span>
            </>
          )}
        </button>
      </div>

      {/* 2. General Operational Parameters */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
          <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
            Booking &amp; Commercial Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Platform / Convenience Fee (₹ per booking)
              </label>
              <input
                type="number"
                value={settings.platformFee}
                onChange={(e) =>
                  setSettings({ ...settings, platformFee: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                GST / Entertainment Tax (%)
              </label>
              <input
                type="number"
                value={settings.taxPercentage}
                onChange={(e) =>
                  setSettings({ ...settings, taxPercentage: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Customer Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail || ''}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Customer Support Helpline
              </label>
              <input
                type="text"
                value={settings.supportPhone || ''}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
        </div>

        {/* 3. Maintenance Mode */}
        <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
                System Maintenance Mode
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Temporarily pause public ticket bookings during major infrastructure upgrades.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })
              }
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                settings.maintenanceMode
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}
            >
              {settings.maintenanceMode ? 'ACTIVE (OFFLINE)' : 'INACTIVE (NORMAL)'}
            </button>
          </div>

          {settings.maintenanceMode && (
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Public Maintenance Notice
              </label>
              <input
                type="text"
                value={settings.maintenanceMessage || ''}
                onChange={(e) =>
                  setSettings({ ...settings, maintenanceMessage: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-primary"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save System Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
