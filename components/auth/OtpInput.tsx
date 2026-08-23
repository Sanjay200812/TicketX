"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DEMO_OTP = "123456";
export const MAX_OTP_ATTEMPTS = 5;

export type OtpStatus =
  | 'entering'
  | 'verifying'
  | 'tearing-animation'
  | 'verified-just-a-sec'
  | 'success'
  | 'failed';

interface OtpInputProps {
  recipient: string;
  recipientType: 'phone' | 'email';
  onVerified: () => void | Promise<void>;
  onResendOtp: () => void;
  onMaxAttemptsReached: () => void;
}

export function OtpInput({
  recipient,
  recipientType,
  onVerified,
  onResendOtp,
  onMaxAttemptsReached,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(MAX_OTP_ATTEMPTS);
  const [status, setStatus] = useState<OtpStatus>('entering');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShake, setIsShake] = useState(false);
  const [resendTimer, setResendTimer] = useState<number>(30);

  const inputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  // Auto-focus first box on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle single-box digit input & auto-advance (Requirement 4)
  const handleChange = (index: number, value: string) => {
    const cleanDigit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanDigit;
    setDigits(newDigits);
    setErrorMsg(null);

    if (cleanDigit && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Requirements 1, 2, 3: Single-press Backspace deletion logic
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];

      if (newDigits[index]) {
        newDigits[index] = '';
        setDigits(newDigits);
        inputRefs[index].current?.focus();
        return;
      }

      if (index > 0) {
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs[index - 1].current?.focus();
      }
    }
  };

  // Handle Paste 6 digits (Requirement 5)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);
    setErrorMsg(null);

    const focusIndex = Math.min(pastedData.length - 1, 5);
    inputRefs[focusIndex].current?.focus();
  };

  // Requirements 6, 7, 8, 15: Verification animation and "Just a sec..." status
  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length !== 6) return;

    setErrorMsg(null);
    setStatus('tearing-animation');

    // 600ms Cinema Ticket Tear / Split Opening Animation
    setTimeout(async () => {
      if (code === DEMO_OTP) {
        setStatus('verified-just-a-sec');
        // Instantly call onVerified callback
        await onVerified();
      } else {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        setIsShake(true);
        setTimeout(() => setIsShake(false), 500);

        if (remaining <= 0) {
          setStatus('failed');
          setErrorMsg('Too many failed attempts. Request a new code.');
          onMaxAttemptsReached();
        } else {
          setStatus('entering');
          setErrorMsg(`Incorrect code. ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining.`);
        }
      }
    }, 600);
  };

  const handleResendClick = () => {
    if (resendTimer > 0) return;
    setDigits(['', '', '', '', '', '']);
    setAttemptsLeft(MAX_OTP_ATTEMPTS);
    setStatus('entering');
    setErrorMsg(null);
    setResendTimer(30);
    onResendOtp();
    inputRefs[0].current?.focus();
  };

  const isComplete = digits.join('').length === 6;

  return (
    <div className="space-y-5">
      {/* Header notice */}
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
            Sent to {recipientType === 'phone' ? `+91 ${recipient}` : recipient}
          </p>
        </div>
      </div>

      {/* Cinema Ticket Tearing Animation & Verified Badge Container */}
      <AnimatePresence mode="wait">
        {status === 'tearing-animation' ? (
          <motion.div
            key="ticket-tearing"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="py-6 flex flex-col items-center justify-center space-y-3 bg-black/40 border border-primary/30 rounded-2xl relative overflow-hidden"
          >
            {/* Split Ticket Top Half */}
            <motion.div
              animate={{ y: [-2, -12], rotate: [-2, -6] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-24 h-8 bg-gradient-to-r from-rose-950 via-primary to-rose-900 rounded-t-xl border-b border-dashed border-amber-400/80 flex items-center justify-center shadow-lg"
            >
              <Ticket className="w-4 h-4 text-white" />
            </motion.div>

            {/* Split Ticket Bottom Half */}
            <motion.div
              animate={{ y: [2, 12], rotate: [2, 6] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-24 h-8 bg-gradient-to-r from-rose-950 via-primary to-rose-900 rounded-b-xl border-t border-dashed border-amber-400/80 flex items-center justify-center shadow-lg"
            >
              <span className="text-[9px] font-black text-amber-300 tracking-widest font-mono">TICKETX</span>
            </motion.div>

            <p className="text-xs font-bold text-amber-300 font-mono animate-pulse pt-1">
              Verifying Code...
            </p>
          </motion.div>
        ) : status === 'verified-just-a-sec' ? (
          /* Requirements 7, 8: Minimal Verified ✓ + Just a sec... Status */
          <motion.div
            key="verified-just-a-sec"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-4 px-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-1 shadow-xl"
          >
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
              <span>Verified ✓</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono animate-pulse">
              Just a sec... on the way to TicketX
            </p>
          </motion.div>
        ) : (
          /* 6 Controlled Input Boxes (Requirements 1, 2, 3, 4, 5) */
          <motion.div
            key="otp-boxes"
            animate={isShake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex justify-between gap-2 my-2"
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={status !== 'entering' || attemptsLeft <= 0}
                className={`w-11 h-13 md:w-12 md:h-14 text-center text-xl font-extrabold font-mono rounded-xl border transition-all ${
                  status === 'failed' || errorMsg
                    ? 'bg-destructive/20 border-destructive text-destructive'
                    : digit
                    ? 'bg-primary/10 border-primary text-white shadow-[0_0_10px_rgba(216,33,50,0.2)]'
                    : 'bg-black/50 border-white/15 text-white focus:border-primary focus:outline-none'
                }`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error / Attempt Warning Message */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-bold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verify Button */}
      {status !== 'verified-just-a-sec' && status !== 'tearing-animation' && (
        <Button
          type="button"
          disabled={!isComplete || attemptsLeft <= 0}
          onClick={handleVerify}
          className="w-full h-12 text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(216,33,50,0.3)] gap-2"
        >
          Verify Code <ArrowRight className="w-4 h-4" />
        </Button>
      )}

      {/* Resend Code Link */}
      <div className="text-center pt-1">
        <button
          type="button"
          disabled={resendTimer > 0 || attemptsLeft <= 0 || status === 'verified-just-a-sec'}
          onClick={handleResendClick}
          className="text-xs text-muted-foreground hover:text-white disabled:opacity-50 font-semibold transition-colors"
        >
          {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Verification Code'}
        </button>
      </div>
    </div>
  );
}
