'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clapperboard, Film, Loader2, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { useTicketX, useArea, useCinemas } from '@/context/TicketXContext';
import { useCatalog } from '@/context/CatalogContext';
import { distanceKm } from '@/lib/catalog';
import { CITIES, cityCentre, getCity } from '@/lib/cities';
import type { Area } from '@/lib/types';
import { Button, Modal } from './ui';
import { Poster } from './Poster';

/* ---------------- City & area picker ---------------- */
export function CityPicker() {
  const { cityPickerOpen, openCityPicker, setCity, area, toast, switchingCity } = useTicketX();
  const { city: current } = useCatalog();
  const [step, setStep] = useState<'city' | 'area'>('city');
  const [cityId, setCityId] = useState(current.id);
  const [q, setQ] = useState('');
  const [locating, setLocating] = useState(false);
  const city = getCity(cityId);

  // Returning users land on their city's areas; first-time visitors choose a city first
  useEffect(() => {
    if (!cityPickerOpen) return;
    setCityId(current.id);
    setStep(area ? 'area' : 'city');
    setQ('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityPickerOpen]);

  const pickCity = (id: string) => {
    setCityId(id);
    setQ('');
    setStep('area');
    setCity(id);
  };
  const pickArea = (a: Area) => {
    setCity(cityId, a);
    openCityPicker(false);
  };
  const close = () => {
    if (!area) setCity(current.id, cityCentre(current));
    openCityPicker(false);
  };

  const locate = () => {
    if (!navigator.geolocation) return toast('Location is not available in this browser', 'error');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const nearest = CITIES.map((c) => ({ c, d: distanceKm(here, c) })).sort((a, b) => a.d - b.d)[0];
        if (nearest.d > 90) {
          toast(`No listed city near you yet. The nearest is ${nearest.c.name}.`, 'info');
          return;
        }
        setCity(nearest.c.id, { id: 'my-location', name: 'Your location', ...here });
        openCityPicker(false);
        toast(`Showing cinemas near you in ${nearest.c.name}`, 'success');
      },
      () => {
        setLocating(false);
        toast('Location permission was denied. Pick a city instead.', 'error');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
    );
  };

  const cities = CITIES.filter((c) => `${c.name} ${c.state}`.toLowerCase().includes(q.toLowerCase()));
  const areas = city.areas.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <Modal open={cityPickerOpen} onClose={close} title={step === 'city' ? 'Choose your city' : `Where in ${city.name}?`} labelledBy="city-title" width="max-w-xl">
      <div className="p-5">
        <button
          onClick={locate}
          disabled={locating}
          className="flex w-full items-center gap-3 rounded-xl border border-marquee/40 bg-marquee/[0.06] px-4 py-3 text-left transition-colors hover:bg-marquee/10"
        >
          {locating ? <Loader2 size={18} className="animate-spin text-marquee" /> : <LocateFixed size={18} className="text-marquee" />}
          <span>
            <span className="block text-sm font-semibold">{locating ? 'Finding you…' : 'Use my current location'}</span>
            <span className="block text-xs text-muted">Picks your city and sorts cinemas by real distance</span>
          </span>
        </button>

        <div className="mt-4 flex h-11 items-center gap-2 rounded-lg border border-line-strong bg-canvas px-3">
          <Search size={16} className="text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={step === 'city' ? 'Search city' : `Search area in ${city.name}`}
            className="w-full bg-transparent text-sm outline-none placeholder:text-faint"
          />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {step === 'city' ? (
            <motion.div
              key="cities"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3"
            >
              {cities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => pickCity(c.id)}
                  className={clsx(
                    'group relative overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-all duration-200 hover:-translate-y-0.5',
                    c.id === current.id ? 'border-marquee bg-marquee/10' : 'border-line bg-panel-2/40 hover:border-line-strong',
                  )}
                >
                  <span className="pointer-events-none absolute -right-1 -top-3 font-display text-5xl text-white/[0.05] transition-colors group-hover:text-marquee/15">
                    {c.name.charAt(0)}
                  </span>
                  <span className="relative block text-[14px] font-semibold">{c.name}</span>
                  <span className="relative block text-[11.5px] text-faint">{c.state}</span>
                </button>
              ))}
              {cities.length === 0 && <p className="col-span-full py-6 text-center text-sm text-muted">No city matches “{q}”.</p>}
            </motion.div>
          ) : (
            <motion.div key={`areas-${city.id}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}>
              <div className="mt-4 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setStep('city');
                    setQ('');
                  }}
                  className="inline-flex items-center gap-1 font-medium text-marquee hover:underline"
                >
                  <ArrowLeft size={13} /> All cities
                </button>
                {switchingCity && (
                  <span className="inline-flex items-center gap-1.5 text-faint">
                    <Loader2 size={12} className="animate-spin" /> Loading {city.name} showtimes
                  </span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <button
                  onClick={() => pickArea(cityCentre(city))}
                  className="col-span-full flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-left text-[13px] font-medium transition-colors hover:border-line-strong hover:bg-white/[0.02]"
                >
                  <MapPin size={13} className="shrink-0 text-marquee" /> Anywhere in {city.name}
                </button>
                {areas.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => pickArea(a)}
                    className={clsx(
                      'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-[13px] font-medium transition-colors',
                      area?.id === a.id ? 'border-marquee bg-marquee/10' : 'border-line hover:border-line-strong hover:bg-white/[0.02]',
                    )}
                  >
                    <MapPin size={13} className="shrink-0 text-faint" />
                    <span className="truncate">{a.name}</span>
                  </button>
                ))}
                {areas.length === 0 && <p className="col-span-full py-6 text-center text-sm text-muted">No area matches “{q}”.</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

/* ---------------- Sign in ---------------- */
export function SignInModal() {
  const { signInOpen, closeSignIn, signIn, toast } = useTicketX();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!signInOpen) {
      setStep('details');
      setOtp(['', '', '', '']);
      setError('');
    }
  }, [signInOpen]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendOtp = () => {
    const c = String(1000 + Math.floor(Math.random() * 9000));
    setCode(c);
    setResendIn(30);
    setOtp(['', '', '', '']);
  };

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError('Enter your name.');
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Enter a valid 10-digit mobile number.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email for your e-ticket.');
    setError('');
    setStep('otp');
    sendOtp();
  };

  const verify = (digits: string[]) => {
    if (digits.join('') === code) {
      signIn({ name: name.trim(), phone, email: email.trim() });
      toast(`Signed in as ${name.trim().split(' ')[0]}`, 'success');
    } else if (digits.every(Boolean)) {
      setError('That OTP is incorrect.');
    }
  };

  return (
    <Modal open={signInOpen} onClose={closeSignIn} title={step === 'details' ? 'Sign in to continue' : 'Verify your number'} labelledBy="signin-title">
      <AnimatePresence mode="wait" initial={false}>
        {step === 'details' ? (
          <motion.form
            key="details"
            onSubmit={submitDetails}
            className="space-y-4 p-5"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <Field label="Full name">
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="field" placeholder="As on your ID" />
            </Field>
            <Field label="Mobile number">
              <div className="flex">
                <span className="grid place-items-center rounded-l-lg border border-r-0 border-line-strong bg-panel-2 px-3 text-sm text-muted">+91</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  className="field !rounded-l-none"
                  placeholder="10-digit number"
                />
              </div>
            </Field>
            <Field label="Email" hint="Your e-ticket is sent here">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" className="field" placeholder="you@example.com" />
            </Field>
            {error && <p className="text-[13px] text-low">{error}</p>}
            <Button type="submit" size="lg" className="w-full">
              Get OTP
            </Button>
            <p className="text-center text-[11.5px] leading-relaxed text-faint">By continuing you agree to the Terms of Use and Privacy Policy.</p>
          </motion.form>
        ) : (
          <motion.div
            key="otp"
            className="space-y-5 p-5"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm text-muted">
              Enter the 4-digit code sent to <span className="font-medium text-cream">+91 {phone.slice(0, 5)} {phone.slice(5)}</span>.{' '}
              <button className="text-marquee hover:underline" onClick={() => setStep('details')}>
                Edit
              </button>
            </p>
            <div className="flex gap-3">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  value={d}
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  autoFocus={i === 0}
                  aria-label={`Digit ${i + 1}`}
                  onChange={(e) => {
                    // Accept typed, pasted or autofilled codes: spread every digit across the boxes
                    const digits = e.target.value.replace(/\D/g, '');
                    const fresh = digits.length > 1 && d && digits.startsWith(d) ? digits.slice(1) : digits;
                    const next = [...otp];
                    let pos = i;
                    if (!fresh) next[i] = '';
                    for (const ch of fresh) {
                      if (pos > 3) break;
                      next[pos++] = ch;
                    }
                    setOtp(next);
                    setError('');
                    if (fresh) refs.current[Math.min(pos, 3)]?.focus();
                    if (next.every(Boolean)) verify(next);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
                  }}
                  className={clsx(
                    'h-14 w-14 rounded-lg border bg-canvas text-center text-xl font-semibold outline-none transition-colors focus:border-cream',
                    error ? 'border-low' : 'border-line-strong',
                  )}
                />
              ))}
            </div>
            {error && <p className="text-[13px] text-low">{error}</p>}
            <p className="rounded-lg border border-dashed border-line-strong px-3 py-2 text-[12.5px] text-muted">
              Demo mode — no SMS is sent. Your code is <span className="font-mono font-semibold tracking-widest text-cream">{code}</span>
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-faint">Didn&apos;t get it?</span>
              <button disabled={resendIn > 0} onClick={sendOtp} className="font-medium text-marquee disabled:text-faint">
                {resendIn > 0 ? `Resend in 0:${String(resendIn).padStart(2, '0')}` : 'Resend OTP'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-muted">
        {label}
        {hint && <span className="text-[11.5px] font-normal text-faint">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/* ---------------- Search ---------------- */
export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useTicketX();
  const area = useArea();
  const cinemasAll = useCinemas();
  const { movies, getMovie, nowShowing } = useCatalog();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!searchOpen) {
      setQ('');
      setIdx(0);
    }
  }, [searchOpen]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const found = (term ? movies : nowShowing).filter(
      (m) =>
        !term ||
        m.title.toLowerCase().includes(term) ||
        m.genres.some((g) => g.toLowerCase().includes(term)) ||
        m.languages.some((l) => l.toLowerCase().includes(term)) ||
        m.cast.some((c) => c.name.toLowerCase().includes(term)) ||
        m.director.toLowerCase().includes(term),
    ).slice(0, term ? 6 : 5);
    const cinemas = cinemasAll
      .filter((c) => term && (c.name.toLowerCase().includes(term) || c.area.toLowerCase().includes(term)))
      .slice(0, 4);
    return [
      ...found.map((m) => ({ kind: 'movie' as const, id: m.id, href: `/movies/${m.id}` })),
      ...cinemas.map((c) => ({ kind: 'cinema' as const, id: c.id, href: `/cinemas/${c.id}`, c })),
    ];
  }, [q, movies, nowShowing, cinemasAll]);

  const go = (href: string) => {
    setSearchOpen(false);
    router.push(href);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div className="fixed inset-0 z-[85] flex justify-center px-4 pt-[10vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={() => setSearchOpen(false)} />
          <motion.div
            role="dialog"
            aria-label="Search"
            className="relative h-fit w-full max-w-xl overflow-hidden rounded-2xl border border-line-strong bg-panel shadow-2xl"
            initial={{ y: -12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <div className="flex h-14 items-center gap-3 border-b border-line px-4">
              <Search size={18} className="text-faint" />
              <input
                autoFocus
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setIdx(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setIdx((i) => Math.min(results.length - 1, i + 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setIdx((i) => Math.max(0, i - 1));
                  } else if (e.key === 'Enter' && results[idx]) go(results[idx].href);
                  else if (e.key === 'Escape') setSearchOpen(false);
                }}
                placeholder="Movies, actors, genres, cinemas"
                className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-faint"
              />
              <button onClick={() => setSearchOpen(false)} className="rounded p-1 text-faint hover:text-cream" aria-label="Close search">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!q && <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Now showing near {area.name}</p>}
              {results.map((r, i) => {
                if (r.kind === 'movie') {
                  const m = getMovie(r.id)!;
                  return (
                    <button
                      key={r.id}
                      onMouseEnter={() => setIdx(i)}
                      onClick={() => go(r.href)}
                      className={clsx('flex w-full items-center gap-3 rounded-lg p-2 text-left', idx === i && 'bg-white/[0.05]')}
                    >
                      <div className="w-9 shrink-0 overflow-hidden rounded">
                        <Poster movie={m} bare />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{m.title}</div>
                        <div className="truncate text-xs text-faint">
                          {m.certificate} · {m.genres.join(', ')} · {m.languages.slice(0, 3).join(', ')}
                        </div>
                      </div>
                      <Film size={14} className="text-faint" />
                    </button>
                  );
                }
                return (
                  <button
                    key={r.id}
                    onMouseEnter={() => setIdx(i)}
                    onClick={() => go(r.href)}
                    className={clsx('flex w-full items-center gap-3 rounded-lg p-2 text-left', idx === i && 'bg-white/[0.05]')}
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded bg-panel-3">
                      <Clapperboard size={16} className="text-muted" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{r.c.name}</div>
                      <div className="truncate text-xs text-faint">{r.c.address}</div>
                    </div>
                    <MapPin size={14} className="text-faint" />
                  </button>
                );
              })}
              {q && results.length === 0 && <p className="px-3 py-10 text-center text-sm text-muted">No matches for “{q}”.</p>}
            </div>
            <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-faint">
              <span>
                <kbd className="font-mono">↑↓</kbd> navigate
              </span>
              <span>
                <kbd className="font-mono">Enter</kbd> open
              </span>
              <span>
                <kbd className="font-mono">Esc</kbd> close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Trailer ---------------- */
export function TrailerModal() {
  const { trailerFor, playTrailer } = useTicketX();
  const { getMovie } = useCatalog();
  const movie = trailerFor ? getMovie(trailerFor) : null;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [trailerFor]);

  return (
    <Modal open={!!movie} onClose={() => playTrailer(null)} width="max-w-4xl">
      {movie && (
        <div className="relative bg-black">
          <button
            onClick={() => playTrailer(null)}
            className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-cream backdrop-blur hover:bg-black/80"
            aria-label="Close trailer"
          >
            <X size={18} />
          </button>
          {movie.trailerKey ? (
            <iframe
              key={movie.trailerKey}
              src={`https://www.youtube-nocookie.com/embed/${movie.trailerKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`${movie.title} trailer`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="aspect-video w-full bg-black"
            />
          ) : failed || movie.posterUrl ? (
            <div className="relative">
              <Poster movie={movie} variant="wide" bare />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 p-6 text-center">
                <p className="text-lg font-semibold">Trailer isn&apos;t available yet</p>
                <p className="mt-1 max-w-sm text-sm text-cream/70">
                  No official trailer has been published for this film yet.
                </p>
              </div>
            </div>
          ) : (
            <video
              key={movie.id}
              src={`/api/trailers/${movie.id}`}
              controls
              autoPlay
              playsInline
              onError={() => setFailed(true)}
              className="aspect-video w-full bg-black"
            />
          )}
          <div className="flex items-center justify-between gap-4 bg-panel px-5 py-4">
            <div>
              <div className="font-semibold">{movie.title} · Official Trailer</div>
              <div className="text-xs text-muted">
                {movie.languages[0]} · {movie.certificate}
              </div>
            </div>
            {movie.status === 'now_showing' && (
              <Link href={`/movies/${movie.id}/shows`} onClick={() => playTrailer(null)}>
                <Button size="sm">
                  Book tickets <ArrowRight size={14} />
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
