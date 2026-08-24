"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, AlertCircle, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DEV_OTP = "123456";
export const MAX_OTP_ATTEMPTS = 5;

// Check if dev auth mode is active
export function isDevAuthMode(): boolean {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEV_AUTH_MODE !== undefined) {
    return process.env.NEXT_PUBLIC_DEV_AUTH_MODE === 'true';
  }
  return process.env.NODE_ENV !== 'production';
}

export type VerificationStatus =
  | 'entering'
  | 'verifying'
  | 'checking-account'
  | 'preparing-experience'
  | 'redirecting'
  | 'success'
  | 'failed';

interface VerificationCodeInputProps {
  length?: number;
  recipient?: string;
  recipientType?: 'phone' | 'email';
  autoFocus?: boolean;
  onVerified: () => void | Promise<void>;
  onResendOtp?: () => void;
  onMaxAttemptsReached?: () => void;
  showTearingAnimation?: boolean;
}

export function VerificationCodeInput({
  length = 6,
  recipient,
  recipientType = 'phone',
  autoFocus = true,
  onVerified,
  onResendOtp,
  onMaxAttemptsReached,
}: VerificationCodeInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const [attemptsLeft, setAttemptsLeft] = useState<number>(MAX_OTP_ATTEMPTS);
  const [status, setStatus] = useState<VerificationStatus>('entering');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShake, setIsShake] = useState(false);
  const [resendTimer, setResendTimer] = useState<number>(30);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first box on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Auto-advance on input
  const handleChange = (index: number, value: string) => {
    const cleanDigit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanDigit;
    setDigits(newDigits);
    setErrorMsg(null);

    if (cleanDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify if last digit is filled and all are complete
    if (cleanDigit && index === length - 1) {
      const fullCode = newDigits.join('');
      if (fullCode.length === length) {
        handleVerifyCode(fullCode);
      }
    }
  };

  // Robust digit-by-digit Backspace deletion logic (Requirements 29, 30, 31, 32)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];

      if (newDigits[index]) {
        // Clear current digit and remain focused on this box
        newDigits[index] = '';
        setDigits(newDigits);
        inputRefs.current[index]?.focus();
        return;
      }

      // If current box is already empty, clear previous box and shift focus back
      if (index > 0) {
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const fullCode = digits.join('');
      if (fullCode.length === length) {
        handleVerifyCode(fullCode);
      }
    }
  };

  // Handle Paste 6 digits
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pastedData) return;

    const newDigits = Array(length).fill('');
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);
    setErrorMsg(null);

    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pastedData.length === length) {
      handleVerifyCode(pastedData);
    }
  };

  // Verification and staged 3-4s transition sequence (Requirements 33, 34, 35, 36)
  const handleVerifyCode = async (code: string) => {
    if (code.length !== length) {
      setErrorMsg(`Enter valid ${length}-digit verification code.`);
      return;
    }

    setErrorMsg(null);
    setStatus('verifying');

    const devMode = isDevAuthMode();
    const isDevValid = devMode && code === DEV_OTP;
    const isProdValid = !devMode;

    if (isDevValid || isProdValid) {
      try {
        // Step 1 (0–1.2s): Checking your TicketX account...
        setStatus('checking-account');
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Step 2 (1.2–2.6s): Preparing your TicketX experience...
        setStatus('preparing-experience');
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Step 3 (2.6–3.6s): Redirecting to TicketX...
        setStatus('redirecting');
        await new Promise((resolve) => setTimeout(resolve, 800));

        await onVerified();
      } catch (err: unknown) {
        setStatus('entering');
        const msg = err instanceof Error ? err.message : 'Verification failed. Please try again.';
        setErrorMsg(msg);
        inputRefs.current[length - 1]?.focus();
      }
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);

      setStatus('entering');
      setErrorMsg('Invalid verification code');

      // Requirement 31: Auto-focus the last populated box so user can immediately Backspace or re-type
      const lastFilledIndex = digits.reduce((last, val, idx) => (val ? idx : last), length - 1);
      setTimeout(() => {
        inputRefs.current[lastFilledIndex]?.focus();
      }, 50);

      if (remaining <= 0) {
        setStatus('failed');
        setErrorMsg('Too many failed attempts. Please request a new code.');
        if (onMaxAttemptsReached) onMaxAttemptsReached();
      }
    }
  };

  const handleResendClick = () => {
    if (resendTimer > 0) return;
    setDigits(Array(length).fill(''));
    setAttemptsLeft(MAX_OTP_ATTEMPTS);
    setStatus('entering');
    setErrorMsg(null);
    setResendTimer(30);
    if (onResendOtp) onResendOtp();
    inputRefs.current[0]?.focus();
  };

  const isComplete = digits.join('').length === length;

  // Staged Transition Full Screen / Overlay Box
  const isPostVerificationSequence =
    status === 'checking-account' ||
    status === 'preparing-experience' ||
    status === 'redirecting';

  return (
    <div className="space-y-5">
      {/* Header notice */}
      {recipient && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/50 border border-white/10">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5 font-heading">
              <span>Verification code sent</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">
              Sent to {recipientType === 'phone' ? (recipient.startsWith('+91') ? recipient : `+91 ${recipient}`) : recipient}
            </p>
          </div>
        </div>
      )}

      {/* Post-Verification Sequence Screen (Requirements 33-36) */}
      <AnimatePresence>
        {isPostVerificationSequence && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 rounded-3xl bg-secondary/80 border border-white/10 text-center space-y-4 shadow-2xl backdrop-blur-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary mx-auto">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>

            <div className="space-y-1">
              <motion.h4
                key={status}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-bold text-base text-white font-heading"
              >
                {status === 'checking-account' && 'Checking your TicketX account...'}
                {status === 'preparing-experience' && 'Preparing your TicketX experience...'}
                {status === 'redirecting' && 'Redirecting to TicketX...'}
              </motion.h4>
              <p className="text-xs text-muted-foreground font-mono">Setting up your secure session</p>
            </div>

            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-rose-400 rounded-full"
                animate={{
                  width:
                    status === 'checking-account'
                      ? '35%'
                      : status === 'preparing-experience'
                      ? '75%'
                      : '100%',
                }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isPostVerificationSequence && (
        <>
          {/* 6-DIGIT OTP BOXES */}
          <div
            className={`flex items-center justify-between gap-2 sm:gap-3 ${
              isShake ? 'animate-shake' : ''
            }`}
          >
            {digits.map((digit, index) => {
              const isFilled = digit !== '';
              const isCurrent = digits.findIndex((d) => d === '') === index;

              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-1"
                >
                  <input
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={status === 'verifying' || attemptsLeft <= 0}
                    className={`w-full h-14 sm:h-16 text-center font-mono text-2xl font-black rounded-2xl border transition-all select-none outline-none ${
                      errorMsg
                        ? 'border-destructive/60 bg-destructive/10 text-destructive focus:border-destructive'
                        : isFilled
                        ? 'border-primary/60 bg-primary/10 text-white shadow-[0_0_15px_rgba(216,33,50,0.2)]'
                        : isCurrent
                        ? 'border-white/40 bg-secondary/80 text-white ring-2 ring-primary/30'
                        : 'border-white/10 bg-secondary/40 text-white'
                    }`}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* ERROR ALERT */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* VERIFY BUTTON */}
          <Button
            type="button"
            onClick={() => handleVerifyCode(digits.join(''))}
            disabled={!isComplete || status === 'verifying' || attemptsLeft <= 0}
            className="w-full h-13 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(216,33,50,0.35)] flex items-center justify-center gap-2 text-sm"
          >
            {status === 'verifying' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>VERIFY &amp; PROCEED</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {/* RESEND OTP SECTION */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>Didn&apos;t receive code?</span>
            {resendTimer > 0 ? (
              <span className="font-mono text-muted-foreground">
                Resend in <span className="text-white font-bold">{resendTimer}s</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendClick}
                className="text-primary hover:underline font-bold"
              >
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
