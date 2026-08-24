"use client";

import { motion } from 'framer-motion';
import { getTodayDateStr, getTomorrowDateStr } from '@/lib/date';

interface DateSelectorProps {
  dates: string[];
  selectedDate: string;
  onSelect: (date: string) => void;
}

export function DateSelector({ dates, selectedDate, onSelect }: DateSelectorProps) {
  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();

  const parseSafeDate = (dateStr: string) => {
    return new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
  };

  const getTopLabel = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';
    return parseSafeDate(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayAndMonth = (dateStr: string) => {
    const d = parseSafeDate(dateStr);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return { day, month };
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 pt-2 hide-scrollbar">
      {dates.map((dateStr) => {
        const isSelected = selectedDate === dateStr;
        const topLabel = getTopLabel(dateStr);
        const { day, month } = getDayAndMonth(dateStr);

        return (
          <button
            key={dateStr}
            onClick={() => onSelect(dateStr)}
            className={`relative flex flex-col items-center justify-center min-w-[76px] h-[88px] rounded-2xl transition-all duration-300 border ${
              isSelected
                ? 'text-white border-primary shadow-[0_0_20px_rgba(216,33,50,0.35)]'
                : 'text-muted-foreground bg-secondary/40 border-white/5 hover:border-white/20 hover:bg-secondary/70'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="activeDate"
                className="absolute inset-0 bg-primary rounded-2xl"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 text-[11px] uppercase tracking-wider mb-1 font-bold">
              {topLabel}
            </span>
            <span className={`relative z-10 font-extrabold font-mono ${isSelected ? 'text-xl text-white' : 'text-lg text-gray-200'}`}>
              {day}
            </span>
            <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-white/80">
              {month}
            </span>
          </button>
        );
      })}
    </div>
  );
}
