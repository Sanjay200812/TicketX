"use client";

import { Check } from 'lucide-react';

interface BookingProgressProps {
  currentStep: 'showtime' | 'seats' | 'checkout';
}

export function BookingProgress({ currentStep }: BookingProgressProps) {
  const steps = [
    { id: 'showtime', label: 'Showtime' },
    { id: 'seats', label: 'Seats' },
    { id: 'checkout', label: 'Checkout' },
  ];

  const getStepStatus = (stepId: string) => {
    if (stepId === currentStep) return 'active';
    const order = ['showtime', 'seats', 'checkout'];
    if (order.indexOf(stepId) < order.indexOf(currentStep)) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 py-2">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  status === 'completed'
                    ? 'bg-emerald-500 text-black'
                    : status === 'active'
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-white/10 text-muted-foreground'
                }`}
              >
                {status === 'completed' ? <Check className="w-3 h-3 stroke-[3]" /> : index + 1}
              </div>
              <span
                className={`text-xs font-medium tracking-wide ${
                  status === 'active'
                    ? 'text-white font-semibold'
                    : status === 'completed'
                    ? 'text-emerald-400'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-6 md:w-10 h-px bg-white/10" />
            )}
          </div>
        );
      })}
    </div>
  );
}
