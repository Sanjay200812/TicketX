"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { AuthEntryGate } from '@/components/auth/AuthEntryGate';

const TARGET_WORD = "TICKETX";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function CinematicIntro() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [introState, setIntroState] = useState<'intro' | 'gate' | 'ready'>('intro');
  const [displayText, setDisplayText] = useState<string[]>(Array(TARGET_WORD.length).fill(' '));
  const [lockedCount, setLockedCount] = useState(0);

  // If directly navigating to login, register, or auth routes, do not mount intro overlay
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isAuthRoute) {
      setIntroState('ready');
      return;
    }

    try {
      const introSeen = sessionStorage.getItem('ticketx_intro_seen') === 'true';
      const guestExplore = sessionStorage.getItem('ticketx_guest_explore') === 'true';

      if (introSeen) {
        if (user || guestExplore) {
          setIntroState('ready');
          return;
        }
      }
    } catch {
      // sessionStorage error fallback
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      try {
        sessionStorage.setItem('ticketx_intro_seen', 'true');
      } catch {}

      if (user) {
        setIntroState('ready');
      } else {
        const guestExplore = sessionStorage.getItem('ticketx_guest_explore') === 'true';
        setIntroState(guestExplore ? 'ready' : 'gate');
      }
      return;
    }

    setIntroState('intro');
  }, [user, isAuthRoute]);

  // Run the scramble reveal animation (~2.2-2.8s)
  useEffect(() => {
    if (introState !== 'intro' || isAuthRoute) return;

    let currentLocked = 0;
    const totalChars = TARGET_WORD.length;

    const scrambleInterval = setInterval(() => {
      setDisplayText(
        TARGET_WORD.split('').map((targetChar, index) => {
          if (index < currentLocked) {
            return targetChar;
          }
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
      );
    }, 45);

    // Letter-by-letter lock interval (~250ms per letter)
    const lockInterval = setInterval(() => {
      currentLocked += 1;
      setLockedCount(currentLocked);

      if (currentLocked >= totalChars) {
        clearInterval(lockInterval);
        clearInterval(scrambleInterval);

        setDisplayText(TARGET_WORD.split(''));

        // Short dramatic pause then transition to Gate or Ready
        setTimeout(() => {
          try {
            sessionStorage.setItem('ticketx_intro_seen', 'true');
          } catch {}

          if (user) {
            setIntroState('ready');
          } else {
            const guestExplore = typeof window !== 'undefined' && sessionStorage.getItem('ticketx_guest_explore') === 'true';
            if (guestExplore) {
              setIntroState('ready');
            } else {
              setIntroState('gate');
            }
          }
        }, 500);
      }
    }, 250);

    return () => {
      clearInterval(scrambleInterval);
      clearInterval(lockInterval);
    };
  }, [introState, user, isAuthRoute]);

  const handleExploreUs = () => {
    try {
      sessionStorage.setItem('ticketx_guest_explore', 'true');
    } catch {}
    setIntroState('ready');
  };

  if (isAuthRoute || introState === 'ready') return null;

  return (
    <AnimatePresence mode="wait">
      {introState === 'intro' ? (
        <motion.div
          key="intro-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#09090b] flex flex-col items-center justify-center pointer-events-auto select-none overflow-hidden"
        >
          {/* Subtle cinematic red background glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.15, 0.35, 0.25], scale: [0.8, 1.1, 1] }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="absolute w-[550px] h-[320px] bg-primary/30 rounded-full blur-[140px] pointer-events-none"
          />

          {/* Ambient Top & Bottom Film Bars */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-black/90 z-10 border-b border-white/5" />
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/90 z-10 border-t border-white/5" />

          <div className="relative z-20 flex flex-col items-center space-y-4">
            {/* Scramble Text */}
            <div className="flex items-center justify-center tracking-[0.25em] md:tracking-[0.4em] font-heading font-black text-4xl sm:text-6xl md:text-7xl">
              {displayText.map((char, idx) => {
                const isLocked = idx < lockedCount;
                const isLastChar = idx === TARGET_WORD.length - 1;

                return (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0.6, y: 5 }}
                    animate={{
                      opacity: isLocked ? 1 : 0.7,
                      y: 0,
                      scale: isLocked ? [1.1, 1] : 1,
                    }}
                    transition={{ duration: 0.15 }}
                    className={`inline-block transition-colors duration-150 ${
                      isLocked
                        ? isLastChar
                          ? 'text-primary drop-shadow-[0_0_25px_rgba(216,33,50,0.8)]'
                          : 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                        : 'text-gray-500 blur-[0.3px]'
                    }`}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </div>

            {/* Subtitle Slogan */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={{ opacity: lockedCount >= 4 ? 0.7 : 0, letterSpacing: '0.3em' }}
              transition={{ duration: 0.8 }}
              className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground font-semibold"
            >
              Your Seat • Your Show
            </motion.p>
          </div>

          {/* Minimal Bottom Loading Line */}
          <div className="absolute bottom-16 w-32 h-[2px] bg-white/10 overflow-hidden rounded-full">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent"
            />
          </div>
        </motion.div>
      ) : (
        <AuthEntryGate key="auth-gate" onExplore={handleExploreUs} />
      )}
    </AnimatePresence>
  );
}
