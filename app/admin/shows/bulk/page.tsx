"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminLoader } from '@/components/admin/AdminLoader';
import { getAllMovies, AdminMovieInput } from '@/services/movies.service';
import { getAllTheatres, AdminTheatreInput } from '@/services/theatres.service';
import { getScreensForTheatre, AdminScreen } from '@/services/screens.service';
import { bulkCreateShows, copySchedule } from '@/services/shows.service';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function BulkShowSchedulerPage() {
  const router = useRouter();
  const { admin } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<'create' | 'copy'>('create');

  // Datasets
  const [movies, setMovies] = useState<AdminMovieInput[]>([]);
  const [theatres, setTheatres] = useState<AdminTheatreInput[]>([]);
  const [screens, setScreens] = useState<AdminScreen[]>([]);
  const [loading, setLoading] = useState(true);

  // Bulk Create State
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedTheatreId, setSelectedTheatreId] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [showtimes, setShowtimes] = useState<string[]>([
    '10:30 AM',
    '02:30 PM',
    '06:30 PM',
    '10:00 PM',
  ]);
  const [newTimeInput, setNewTimeInput] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('2D');
  const [selectedLanguage, setSelectedLanguage] = useState('Telugu');
  const [prices, setPrices] = useState({
    Silver: 150,
    Gold: 200,
    Recliner: 295,
  });

  // Copy Schedule State
  const [copySourceDate, setCopySourceDate] = useState(new Date().toISOString().split('T')[0]);
  const [copyTargetDates, setCopyTargetDates] = useState<string[]>([]);
  const [newTargetDateInput, setNewTargetDateInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [mList, thList] = await Promise.all([getAllMovies(), getAllTheatres()]);
      setMovies(mList);
      setTheatres(thList);

      if (mList.length > 0) setSelectedMovieId(mList[0].id);
      if (thList.length > 0) {
        setSelectedTheatreId(thList[0].id);
        const scList = await getScreensForTheatre(thList[0].id);
        setScreens(scList);
        if (scList.length > 0) setSelectedScreenId(scList[0].id);
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleTheatreChange = async (thId: string) => {
    setSelectedTheatreId(thId);
    const scList = await getScreensForTheatre(thId);
    setScreens(scList);
    if (scList.length > 0) setSelectedScreenId(scList[0].id);
  };

  const addTime = () => {
    if (!newTimeInput.trim()) return;
    if (!showtimes.includes(newTimeInput.trim())) {
      setShowtimes([...showtimes, newTimeInput.trim()]);
    }
    setNewTimeInput('');
  };

  const removeTime = (t: string) => {
    setShowtimes(showtimes.filter((item) => item !== t));
  };

  const addTargetDate = () => {
    if (!newTargetDateInput) return;
    if (!copyTargetDates.includes(newTargetDateInput)) {
      setCopyTargetDates([...copyTargetDates, newTargetDateInput]);
    }
    setNewTargetDateInput('');
  };

  const removeTargetDate = (d: string) => {
    setCopyTargetDates(copyTargetDates.filter((item) => item !== d));
  };

  const generateDateRange = (startStr: string, endStr: string): string[] => {
    const dates: string[] = [];
    const current = new Date(startStr);
    const end = new Date(endStr);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleBulkCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (showtimes.length === 0) {
      setErrorMsg('Please add at least one showtime.');
      return;
    }

    const dateList = generateDateRange(startDate, endDate);
    if (dateList.length === 0) {
      setErrorMsg('Invalid date range.');
      return;
    }

    setSaving(true);
    try {
      const movieObj = movies.find((m) => m.id === selectedMovieId);
      const theatreObj = theatres.find((t) => t.id === selectedTheatreId);
      const screenObj = screens.find((s) => s.id === selectedScreenId);

      const created = await bulkCreateShows(
        {
          movieId: selectedMovieId,
          movieTitle: movieObj?.title,
          locationId: theatreObj?.locationId || 'guntur',
          theatreId: selectedTheatreId,
          theatreName: theatreObj?.name,
          screenId: selectedScreenId,
          screenName: screenObj?.name || 'Screen 1',
          seatLayoutId: screenObj?.seatLayoutId || selectedTheatreId,
          format: selectedFormat,
          language: selectedLanguage,
          dates: dateList,
          times: showtimes,
          categoryPrices: prices,
        },
        admin ? { uid: admin.uid, name: admin.name } : undefined
      );

      setSuccessMsg(`Successfully generated ${created.length} showtimes across ${dateList.length} days!`);
      setTimeout(() => router.push('/admin/shows'), 1500);
    } catch {
      setErrorMsg('Failed to create bulk shows.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (copyTargetDates.length === 0) {
      setErrorMsg('Please add at least one target destination date.');
      return;
    }

    setSaving(true);
    try {
      const count = await copySchedule(
        {
          sourceDate: copySourceDate,
          targetDates: copyTargetDates,
          theatreId: selectedTheatreId,
          screenId: selectedScreenId,
        },
        admin ? { uid: admin.uid, name: admin.name } : undefined
      );

      if (count === 0) {
        setErrorMsg(`No scheduled shows found on source date (${copySourceDate}) for this theatre.`);
      } else {
        setSuccessMsg(`Copied ${count} shows to ${copyTargetDates.length} target dates successfully!`);
        setTimeout(() => router.push('/admin/shows'), 1500);
      }
    } catch {
      setErrorMsg('Failed to copy schedule.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLoader text="Preparing scheduling wizard..." />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Showtime Operations Wizard"
        description="Bulk schedule multiple daily screening slots or clone an existing date's programming in 1-click."
        backHref="/admin/shows"
        backLabel="Back to Shows"
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

      {/* Tabs */}
      <div className="flex items-center gap-3 p-1.5 bg-[#16191f] border border-white/10 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'create'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Bulk Create Showtimes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('copy')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'copy'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Copy className="w-4 h-4" />
          <span>Copy Day Schedule</span>
        </button>
      </div>

      {activeTab === 'create' ? (
        <form onSubmit={handleBulkCreateSubmit} className="space-y-6">
          {/* Cinema & Feature Film Picker */}
          <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
              1. Film &amp; Auditorium Setup
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Select Movie *
                </label>
                <select
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-primary"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.languages?.join(', ') || m.language || 'Telugu'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Select Theatre *
                </label>
                <select
                  value={selectedTheatreId}
                  onChange={(e) => handleTheatreChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-primary"
                >
                  {theatres.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.locationId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Select Screen *
                </label>
                <select
                  value={selectedScreenId}
                  onChange={(e) => setSelectedScreenId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-primary"
                >
                  {screens.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name} ({sc.capacity} Seats)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Projection Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
                >
                  <option value="2D">2D Digital</option>
                  <option value="3D">3D Glasses</option>
                  <option value="4K">4K Barco Laser</option>
                  <option value="IMAX">IMAX Experience</option>
                  <option value="Dolby Cinema">Dolby Cinema</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Audio Language Track
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
                >
                  <option value="Telugu">Telugu</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="English">English</option>
                  <option value="Malayalam">Malayalam</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date Range & Showtimes */}
          <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
              2. Programming Dates &amp; Daily Showtime Slots
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2 font-mono">
                Daily Showtime Slots
              </label>

              <div className="flex flex-wrap gap-2 mb-3">
                {showtimes.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/20 border border-primary/40 text-primary font-mono text-xs font-bold"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => removeTime(t)}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="e.g. 11:15 PM"
                  value={newTimeInput}
                  onChange={(e) => setNewTimeInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={addTime}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-white"
                >
                  Add Time
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Config */}
          <div className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
              3. Category Pricing (₹)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Silver Class Price (₹)
                </label>
                <input
                  type="number"
                  value={prices.Silver}
                  onChange={(e) => setPrices({ ...prices, Silver: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Gold Class Price (₹)
                </label>
                <input
                  type="number"
                  value={prices.Gold}
                  onChange={(e) => setPrices({ ...prices, Gold: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                  Recliner Luxury Price (₹)
                </label>
                <input
                  type="number"
                  value={prices.Recliner}
                  onChange={(e) => setPrices({ ...prices, Recliner: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-primary/25 flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>{saving ? 'Scheduling Shows...' : 'Generate All Showtimes'}</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCopyScheduleSubmit} className="p-6 bg-[#16191f] border border-white/10 rounded-2xl space-y-6">
          <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
            Copy Friday / Weekend Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Target Theatre
              </label>
              <select
                value={selectedTheatreId}
                onChange={(e) => handleTheatreChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
              >
                {theatres.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Source Date (Copy from)
              </label>
              <input
                type="date"
                value={copySourceDate}
                onChange={(e) => setCopySourceDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-2 font-mono">
              Destination Dates (Copy to)
            </label>

            <div className="flex flex-wrap gap-2 mb-3">
              {copyTargetDates.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold"
                >
                  <span>{d}</span>
                  <button
                    type="button"
                    onClick={() => removeTargetDate(d)}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm">
              <input
                type="date"
                value={newTargetDateInput}
                onChange={(e) => setNewTargetDateInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono"
              />
              <button
                type="button"
                onClick={addTargetDate}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-white"
              >
                Add Date
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-primary/25 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>{saving ? 'Copying Schedule...' : 'Duplicate Schedule to Destination Dates'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
