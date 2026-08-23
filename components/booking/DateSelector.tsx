"use client";

import { motion } from 'framer-motion';

interface DateSelectorProps {
  dates: string[];
  selectedDate: string;
  onSelect: (date: string) => void;
}

export function DateSelector({ dates, selectedDate, onSelect }: DateSelectorProps) {
  const parseSafeDate = (dateStr: string) => {
    return new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
  };

  const formatDateLabel = (dateStr: string) => {
    const date = parseSafeDate(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const getDayName = (dateStr: string) => {
    return parseSafeDate(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 pt-2 hide-scrollbar">
      {dates.map((dateStr) => {
        const isSelected = selectedDate === dateStr;
        return (
          <button
            key={dateStr}
            onClick={() => onSelect(dateStr)}
            className={`relative flex flex-col items-center justify-center min-w-[72px] h-[84px] rounded-xl transition-all duration-300 ${
              isSelected ? 'text-white' : 'text-muted-foreground bg-secondary hover:bg-secondary/80'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="activeDate"
                className="absolute inset-0 bg-primary rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 text-xs uppercase tracking-wider mb-1 font-medium">
              {getDayName(dateStr)}
            </span>
            <span className={`relative z-10 font-bold ${isSelected ? 'text-lg' : 'text-base'}`}>
              {formatDateLabel(dateStr).split(' ')[0]}
            </span>
            {formatDateLabel(dateStr).includes(' ') && (
               <span className="relative z-10 text-xs font-medium uppercase mt-0.5">
               {formatDateLabel(dateStr).split(' ')[1]}
             </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
