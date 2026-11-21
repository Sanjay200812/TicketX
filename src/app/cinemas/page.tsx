'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, MapPin, Search } from 'lucide-react';
import { Page } from '@/components/Page';
import { Chip } from '@/components/ui';
import { useFavCinemas } from '@/lib/hooks';
import { useArea, useCinemas, useTicketX } from '@/context/TicketXContext';
import { useCatalog } from '@/context/CatalogContext';
import type { Amenity } from '@/lib/types';

const FILTERS: Amenity[] = ['Recliners', 'Dolby Atmos', '4K', 'RGB Laser', 'Wheelchair Access', 'Parking', 'Metro Nearby'];

export default function CinemasPage() {
  const area = useArea();
  const cinemas = useCinemas();
  const { openCityPicker } = useTicketX();
  const { city } = useCatalog();
  const { favs, toggle } = useFavCinemas();
  const [q, setQ] = useState('');
  const [am, setAm] = useState<Amenity[]>([]);
  const list = useMemo(
    () =>
      cinemas
        .filter((c) => (!q || `${c.name} ${c.address}`.toLowerCase().includes(q.toLowerCase())) && am.every((a) => c.amenities.includes(a)))
        .sort((a, b) => Number(favs.includes(b.id)) - Number(favs.includes(a.id))),
    [cinemas, q, am, favs],
  );

  return (
    <Page>
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Cinemas in {city.name}</h1>
        <button onClick={() => openCityPicker(true)} className="mt-1 text-sm text-muted hover:text-cream">
          {cinemas.length} cinemas · sorted by distance from {area.name} · <span className="text-marquee">change</span>
        </button>

        <div className="mt-6 flex h-11 items-center gap-2 rounded-lg border border-line-strong bg-panel px-3">
          <Search size={16} className="text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by cinema or area" className="w-full bg-transparent text-sm outline-none placeholder:text-faint" />
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <Chip key={f} active={am.includes(f)} onClick={() => setAm(am.includes(f) ? am.filter((x) => x !== f) : [...am, f])}>
              {f}
            </Chip>
          ))}
        </div>

        <motion.div layout className="mt-6 space-y-3">
          <AnimatePresence mode="popLayout">
            {list.map((c) => (
              <motion.div key={c.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                <div className="group flex items-start gap-4 rounded-xl border border-line bg-panel p-5 transition-colors hover:border-line-strong">
                  {c.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded-full bg-white object-contain p-0.5" />
                  ) : (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-panel-3 text-sm font-semibold text-muted">{c.chain.slice(0, 2)}</span>
                  )}
                  <button onClick={() => toggle(c.id)} aria-label="Favourite" className="order-last mt-0.5 text-faint hover:text-marquee">
                    <Heart size={17} className={favs.includes(c.id) ? 'fill-marquee text-marquee' : ''} />
                  </button>
                  <Link href={`/cinemas/${c.id}`} transitionTypes={['nav-forward']} className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-semibold group-hover:underline">{c.name}</h2>
                      <span className="shrink-0 text-xs text-faint">{c.distanceKm} km</span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-[13px] text-muted">
                      <MapPin size={12} /> {c.address}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.amenities.map((a) => (
                        <span key={a} className={clsx('rounded px-2 py-0.5 text-[11.5px]', am.includes(a) ? 'bg-cream/15 text-cream' : 'bg-white/[0.04] text-faint')}>
                          {a}
                        </span>
                      ))}
                    </div>
                    {c.highlight && <p className="mt-3 text-[13px] text-cream/75">{c.highlight}</p>}
                    <p className="mt-2 text-xs text-faint">
                      {c.screens.length > 0 ? `${c.screens.length} screen${c.screens.length > 1 ? 's' : ''} · ${Array.from(new Set(c.screens.flatMap((s) => s.formats))).join(', ')}` : c.area}
                    </p>
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {list.length === 0 && <p className="rounded-xl border border-dashed border-line py-16 text-center text-sm text-muted">No cinemas match your search.</p>}
        </motion.div>
      </div>
    </Page>
  );
}
