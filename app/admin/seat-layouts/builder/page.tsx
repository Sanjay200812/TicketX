"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Armchair,
  Ban,
  Accessibility,
  Columns,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminLoader } from '@/components/admin/AdminLoader';
import {
  getSeatLayoutById,
  saveSeatLayout,
  buildGridLayout,
  AdminSeatLayoutTemplate,
} from '@/services/seatLayouts.service';
import { getAllTheatres, AdminTheatreInput } from '@/services/theatres.service';
import { useAdminAuth } from '@/context/AdminAuthContext';


type ToolMode = 'available' | 'gap' | 'wheelchair' | 'disabled';

interface GridSeatItem {
  row: string;
  col: number;
  label: string;
  category: 'Silver' | 'Gold' | 'Premium' | 'Recliner' | 'VIP';
  status: 'available' | 'gap' | 'wheelchair' | 'disabled';
}

export default function SeatLayoutBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingLayoutId = searchParams.get('id');

  const [theatres, setTheatres] = useState<AdminTheatreInput[]>([]);
  const [templateName, setTemplateName] = useState('Standard Multiplex Seating');
  const [selectedTheatreId, setSelectedTheatreId] = useState('plateno-cinemas');
  const [selectedScreenId, setSelectedScreenId] = useState('screen-1');

  // Matrix Configuration
  const [rowsCount, setRowsCount] = useState(10);
  const [seatsPerRow, setSeatsPerRow] = useState(16);
  const [aisleAfterCol, setAisleAfterCol] = useState(8);

  // Category Pricing
  const [prices, setPrices] = useState({
    Silver: 150,
    Gold: 200,
    Premium: 250,
    Recliner: 295,
    VIP: 350,
  });

  // Selected Tool Mode
  const [activeTool, setActiveTool] = useState<ToolMode>('available');

  // Matrix State
  const [gridMatrix, setGridMatrix] = useState<GridSeatItem[][]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { admin } = useAdminAuth();

  // Generate Matrix Helper
  const generateMatrix = (numRows: number, numCols: number) => {
    const matrix: GridSeatItem[][] = [];
    for (let r = 0; r < numRows; r++) {
      const rowLetter = String.fromCharCode(65 + r);
      const rowSeats: GridSeatItem[] = [];

      // Categorize rows from back to front
      let cat: GridSeatItem['category'] = 'Gold';
      if (r < 2) cat = 'Recliner';
      else if (r < 5) cat = 'Premium';
      else if (r < 8) cat = 'Gold';
      else cat = 'Silver';

      for (let c = 1; c <= numCols; c++) {
        rowSeats.push({
          row: rowLetter,
          col: c,
          label: `${rowLetter}${c.toString().padStart(2, '0')}`,
          category: cat,
          status: 'available',
        });
      }
      matrix.push(rowSeats);
    }
    return matrix;
  };

  useEffect(() => {
    async function init() {
      setLoading(true);
      const thList = await getAllTheatres();
      setTheatres(thList);

      if (existingLayoutId) {
        const existing = await getSeatLayoutById(existingLayoutId);
        if (existing) {
          setTemplateName(existing.templateName || existing.id);
          setSelectedTheatreId(existing.theatreId);
          setSelectedScreenId(existing.screenId || 'screen-1');
        }
      }

      setGridMatrix(generateMatrix(rowsCount, seatsPerRow));
      setLoading(false);
    }
    init();
  }, [existingLayoutId, rowsCount, seatsPerRow]);

  const handleSeatClick = (rIdx: number, cIdx: number) => {
    setGridMatrix((prev) => {
      const copy = prev.map((r) => [...r]);
      const current = copy[rIdx][cIdx];

      // Cycle or apply active tool
      if (activeTool === 'gap') {
        current.status = current.status === 'gap' ? 'available' : 'gap';
      } else if (activeTool === 'wheelchair') {
        current.status = current.status === 'wheelchair' ? 'available' : 'wheelchair';
      } else if (activeTool === 'disabled') {
        current.status = current.status === 'disabled' ? 'available' : 'disabled';
      } else {
        // Toggle Category
        const cats: GridSeatItem['category'][] = ['Silver', 'Gold', 'Premium', 'Recliner', 'VIP'];
        const nextIdx = (cats.indexOf(current.category) + 1) % cats.length;
        current.category = cats[nextIdx];
        current.status = 'available';
      }

      return copy;
    });
  };

  const handleRegenerateGrid = () => {
    setGridMatrix(generateMatrix(rowsCount, seatsPerRow));
  };

  const handleSaveLayout = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSaving(true);

    try {
      // Calculate capacity (available + wheelchair)
      let calculatedCapacity = 0;
      gridMatrix.forEach((row) => {
        row.forEach((st) => {
          if (st.status !== 'gap' && st.status !== 'disabled') {
            calculatedCapacity++;
          }
        });
      });

      const thObj = theatres.find((t) => t.id === selectedTheatreId);

      // Construct standard TicketX layout model
      const generated = buildGridLayout({
        theatreId: selectedTheatreId,
        screenId: selectedScreenId,
        theatreName: thObj?.name || selectedTheatreId,
        rowsCount,
        seatsPerRow,
        aisleAfterSeat: aisleAfterCol,
        sections: [
          { name: 'Recliner Luxury', rows: 2, price: prices.Recliner },
          { name: 'Gold Class', rows: 4, price: prices.Gold },
          { name: 'Silver Economy', rows: Math.max(1, rowsCount - 6), price: prices.Silver },
        ],
      });

      const templatePayload: AdminSeatLayoutTemplate = {
        ...generated,
        id: existingLayoutId || `${selectedTheatreId}-layout-${Date.now().toString(36).substring(2, 6)}`,
        templateName,
        theatreId: selectedTheatreId,
        screenId: selectedScreenId,
        theatreName: thObj?.name || selectedTheatreId,
        capacity: calculatedCapacity,
      };

      await saveSeatLayout(
        templatePayload,
        admin ? { uid: admin.uid, name: admin.name } : undefined
      );

      setSuccessMsg('Seat layout template saved successfully!');
      setTimeout(() => router.push('/admin/seat-layouts'), 1200);
    } catch {
      setErrorMsg('Failed to save layout template.');
    } finally {
      setSaving(false);
    }
  };

  const getSeatColor = (item: GridSeatItem) => {
    if (item.status === 'gap') return 'opacity-0 pointer-events-none';
    if (item.status === 'disabled') return 'bg-red-500/20 text-red-400 border border-red-500/30';
    if (item.status === 'wheelchair') return 'bg-sky-500/20 text-sky-400 border border-sky-500/40';

    switch (item.category) {
      case 'Recliner':
        return 'bg-purple-600/30 border border-purple-500 text-purple-300 hover:bg-purple-600/50';
      case 'VIP':
        return 'bg-rose-600/30 border border-rose-500 text-rose-300 hover:bg-rose-600/50';
      case 'Premium':
        return 'bg-amber-500/30 border border-amber-400 text-amber-200 hover:bg-amber-500/50';
      case 'Gold':
        return 'bg-primary/30 border border-primary text-white hover:bg-primary/50';
      case 'Silver':
        return 'bg-gray-700/40 border border-gray-500 text-gray-300 hover:bg-gray-700/60';
    }
  };

  if (loading) {
    return <AdminLoader text="Launching visual layout builder..." />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Visual Seating Layout Builder"
        description="Click any seat to customize tiers, insert walkways, and configure pricing without writing code."
        backHref="/admin/seat-layouts"
        backLabel="Back to Layout Templates"
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

      {/* Builder Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 1 Col: Grid Configuration & Tools */}
        <div className="space-y-5">
          {/* Metadata */}
          <div className="p-5 bg-[#16191f] border border-white/10 rounded-2xl space-y-3">
            <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
              Auditorium Assignment
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Target Cinema
              </label>
              <select
                value={selectedTheatreId}
                onChange={(e) => setSelectedTheatreId(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none"
              >
                {theatres.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Matrix Controls */}
          <div className="p-5 bg-[#16191f] border border-white/10 rounded-2xl space-y-3">
            <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
              Dimensions &amp; Aisles
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1 font-mono">Rows Count</label>
                <input
                  type="number"
                  min="3"
                  max="26"
                  value={rowsCount}
                  onChange={(e) => setRowsCount(parseInt(e.target.value, 10) || 5)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1 font-mono">Seats / Row</label>
                <input
                  type="number"
                  min="4"
                  max="32"
                  value={seatsPerRow}
                  onChange={(e) => setSeatsPerRow(parseInt(e.target.value, 10) || 10)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1 font-mono">
                Central Aisle (Col #)
              </label>
              <input
                type="number"
                min="2"
                max={seatsPerRow - 1}
                value={aisleAfterCol}
                onChange={(e) => setAisleAfterCol(parseInt(e.target.value, 10) || 6)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <button
              type="button"
              onClick={handleRegenerateGrid}
              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-300 transition-colors"
            >
              Reset Matrix to Dimensions
            </button>
          </div>

          {/* Painting Tools */}
          <div className="p-5 bg-[#16191f] border border-white/10 rounded-2xl space-y-3">
            <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
              Click Paint Tool
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveTool('available')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTool === 'available'
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-black/40 border-white/10 text-gray-400'
                }`}
              >
                <Armchair className="w-4 h-4" />
                <span>Change Tier</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('gap')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTool === 'gap'
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-black/40 border-white/10 text-gray-400'
                }`}
              >
                <Columns className="w-4 h-4" />
                <span>Gap / Walkway</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('wheelchair')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTool === 'wheelchair'
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-black/40 border-white/10 text-gray-400'
                }`}
              >
                <Accessibility className="w-4 h-4" />
                <span>Wheelchair</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('disabled')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTool === 'disabled'
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-black/40 border-white/10 text-gray-400'
                }`}
              >
                <Ban className="w-4 h-4" />
                <span>Unavailable</span>
              </button>
            </div>
          </div>

          {/* Pricing Config */}
          <div className="p-5 bg-[#16191f] border border-white/10 rounded-2xl space-y-2">
            <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
              Tier Default Pricing (₹)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40">
                <span className="text-purple-400 font-bold">Recliner</span>
                <input
                  type="number"
                  value={prices.Recliner}
                  onChange={(e) => setPrices({ ...prices, Recliner: parseInt(e.target.value, 10) || 0 })}
                  className="w-16 bg-transparent text-right font-mono font-bold text-white outline-none"
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40">
                <span className="text-amber-400 font-bold">Premium</span>
                <input
                  type="number"
                  value={prices.Premium}
                  onChange={(e) => setPrices({ ...prices, Premium: parseInt(e.target.value, 10) || 0 })}
                  className="w-16 bg-transparent text-right font-mono font-bold text-white outline-none"
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40">
                <span className="text-primary font-bold">Gold</span>
                <input
                  type="number"
                  value={prices.Gold}
                  onChange={(e) => setPrices({ ...prices, Gold: parseInt(e.target.value, 10) || 0 })}
                  className="w-16 bg-transparent text-right font-mono font-bold text-white outline-none"
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40">
                <span className="text-gray-300 font-bold">Silver</span>
                <input
                  type="number"
                  value={prices.Silver}
                  onChange={(e) => setPrices({ ...prices, Silver: parseInt(e.target.value, 10) || 0 })}
                  className="w-16 bg-transparent text-right font-mono font-bold text-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 3 Cols: Visual Canvas */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-6 bg-[#16191f] border border-white/10 rounded-3xl space-y-6 shadow-2xl overflow-hidden">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-gray-400">
                  Total Rows: <strong className="text-white">{rowsCount}</strong>
                </span>
                <span className="text-gray-400">
                  Total Seats: <strong className="text-emerald-400">{rowsCount * seatsPerRow}</strong>
                </span>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleSaveLayout}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/25 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Seating Layout'}</span>
              </button>
            </div>

            {/* Interactive Grid Canvas */}
            <div className="p-6 bg-[#0a0c0f] border border-white/10 rounded-2xl overflow-x-auto">
              <div className="min-w-[650px] space-y-3 mx-auto flex flex-col items-center">
                {/* Seating Grid */}
                <div className="space-y-2 py-4">
                  {gridMatrix.map((row, rIdx) => (
                    <div key={`row-${rIdx}`} className="flex items-center justify-center gap-2">
                      {/* Left Row Identifier */}
                      <span className="w-6 text-center font-mono font-bold text-xs text-gray-500">
                        {row[0]?.row}
                      </span>

                      {/* Row Seats with Central Aisle Gap */}
                      <div className="flex items-center gap-1.5">
                        {row.map((seat, cIdx) => (
                          <React.Fragment key={`seat-${rIdx}-${cIdx}`}>
                            {cIdx === aisleAfterCol && (
                              <div className="w-8 flex items-center justify-center">
                                <span className="h-6 w-[1px] bg-white/10" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleSeatClick(rIdx, cIdx)}
                              className={`w-7 h-7 rounded-md text-[10px] font-mono font-bold flex items-center justify-center transition-all ${getSeatColor(
                                seat
                              )}`}
                              title={`${seat.label} • ${seat.category} (₹${prices[seat.category] || 0}) • ${seat.status}`}
                            >
                              {seat.status === 'wheelchair' ? (
                                <Accessibility className="w-3 h-3" />
                              ) : seat.status === 'disabled' ? (
                                <Ban className="w-3 h-3" />
                              ) : (
                                seat.col
                              )}
                            </button>
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Right Row Identifier */}
                      <span className="w-6 text-center font-mono font-bold text-xs text-gray-500">
                        {row[0]?.row}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Screen Curved Indicator */}
                <div className="w-full max-w-lg pt-8 pb-2 space-y-2 text-center">
                  <div className="h-2 w-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_0_20px_rgba(230,30,50,0.8)]" />
                  <div className="text-[11px] font-mono tracking-widest text-gray-400 uppercase font-bold">
                    SCREEN THIS WAY
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 flex-wrap text-xs pt-2 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-purple-600/30 border border-purple-500" />
                <span className="text-gray-300">Recliner (₹{prices.Recliner})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-amber-500/30 border border-amber-400" />
                <span className="text-gray-300">Premium (₹{prices.Premium})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-primary/30 border border-primary" />
                <span className="text-gray-300">Gold (₹{prices.Gold})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-gray-700/40 border border-gray-500" />
                <span className="text-gray-300">Silver (₹{prices.Silver})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-sky-500/20 border border-sky-500" />
                <span className="text-gray-300">Wheelchair</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
