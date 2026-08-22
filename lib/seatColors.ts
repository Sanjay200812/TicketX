export type SeatColorType = 'silver' | 'gold' | 'luxury-red' | 'premium-red';

export interface SeatStyleDefinition {
  label: string;
  badgeClass: string;
  availableClass: string;
  selectedClass: string;
  bookedClass: string;
}

export function getSeatCategoryType(categoryName: string): SeatColorType {
  const norm = categoryName.toLowerCase().trim();

  if (norm.includes('silver')) {
    return 'silver';
  }

  if (norm.includes('gold')) {
    return 'gold';
  }

  if (norm.includes('premium')) {
    return 'premium-red';
  }

  if (norm.includes('land') || norm.includes('luxury') || norm.includes('recliner') || norm.includes('sofa')) {
    return 'luxury-red';
  }

  return 'silver';
}

export function getSeatStyleClasses(categoryName: string, isEvent = false): SeatStyleDefinition {
  const colorType = getSeatCategoryType(categoryName);

  const bookedClass =
    'bg-neutral-800/90 border-neutral-700/50 text-neutral-500 cursor-not-allowed opacity-50 select-none';

  switch (colorType) {
    case 'silver':
      return {
        label: 'Silver',
        badgeClass: 'bg-slate-900/80 text-slate-200 border-slate-400/40',
        availableClass:
          'bg-slate-700/70 border-slate-400/60 text-slate-100 hover:border-slate-300 hover:bg-slate-600/90 shadow-[0_2px_8px_rgba(148,163,184,0.15)]',
        selectedClass:
          'bg-slate-600 border-2 border-white text-white font-black scale-105 shadow-[0_0_15px_rgba(255,255,255,0.6)] ring-2 ring-primary/80',
        bookedClass,
      };

    case 'gold':
      return {
        label: isEvent ? 'Gold (Balcony)' : 'Gold',
        badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
        availableClass:
          'bg-amber-600/75 border-amber-400/75 text-amber-100 hover:border-amber-300 hover:bg-amber-500/90 shadow-[0_2px_10px_rgba(245,158,11,0.25)]',
        selectedClass:
          'bg-amber-500 border-2 border-white text-white font-black scale-105 shadow-[0_0_15px_rgba(245,158,11,0.7)] ring-2 ring-primary/80',
        bookedClass,
      };

    case 'luxury-red':
      return {
        label: 'On Land',
        badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
        availableClass:
          'bg-rose-600/85 border-rose-400/85 text-white hover:border-rose-300 hover:bg-rose-500 shadow-[0_3px_12px_rgba(225,29,72,0.35)]',
        selectedClass:
          'bg-rose-500 border-2 border-white text-white font-black scale-105 shadow-[0_0_18px_rgba(225,29,72,0.8)] ring-2 ring-primary/80',
        bookedClass,
      };

    case 'premium-red':
    default:
      return {
        label: 'Premium',
        badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
        availableClass:
          'bg-rose-600/85 border-rose-400/85 text-white hover:border-rose-300 hover:bg-rose-500 shadow-[0_3px_12px_rgba(225,29,72,0.35)]',
        selectedClass:
          'bg-rose-500 border-2 border-white text-white font-black scale-105 shadow-[0_0_18px_rgba(225,29,72,0.8)] ring-2 ring-primary/80',
        bookedClass,
      };
  }
}
