'use client';

import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Horizontally scrolling row with snap and desktop arrow controls. */
export function Rail({ children, itemClass = 'w-[42vw] sm:w-[200px] lg:w-[212px]' }: { children: React.ReactNode[]; itemClass?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [children.length]);

  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <div className="relative">
      <div ref={ref} onScroll={update} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 sm:gap-5">
        {children.map((c, i) => (
          <div key={i} className={clsx('shrink-0 snap-start', itemClass)}>
            {c}
          </div>
        ))}
      </div>
      {(['start', 'end'] as const).map((side) => (
        <button
          key={side}
          onClick={() => scroll(side === 'start' ? -1 : 1)}
          aria-label={side === 'start' ? 'Scroll left' : 'Scroll right'}
          className={clsx(
            'absolute top-[34%] hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-panel/90 text-cream shadow-xl backdrop-blur transition-opacity duration-200 md:grid',
            side === 'start' ? '-left-4' : '-right-4',
            edge[side] ? 'pointer-events-none opacity-0' : 'opacity-100 hover:bg-panel-3',
          )}
        >
          {side === 'start' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      ))}
    </div>
  );
}
