"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Edit3,
  User,
  Calendar,
  Sparkles,
} from 'lucide-react';

import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth, validateIndianPhone, formatIndianPhone } from '@/context/AuthContext';
import { VerificationCodeInput } from '@/components/auth/VerificationCodeInput';

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const { user, sendPhoneOtp, verifyPhoneOtp, completeCustomerOnboarding } = useAuth();

  // Steps: 'phone' | 'otp' | 'onboarding'
  const [step, setStep] = useState<'phone' | 'otp' | 'onboarding'>('phone');

  // Input states
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Onboarding states
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Prefer not to say');

  // UI Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // If already authenticated and not in onboarding, redirect
  useEffect(() => {
    if (user && step !== 'onboarding') {
      router.replace(redirectPath);
    }
  }, [user, step, router, redirectPath]);

  // Focus phone on initial mount
  useEffect(() => {
    if (step === 'phone') {
      phoneInputRef.current?.focus();
    } else if (step === 'onboarding') {
      nameInputRef.current?.focus();
    }
  }, [step]);

  // Resend Countdown Timer
  useEffect(() => {
    if (step !== 'otp' || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Clean reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {}
      }
    };
  }, []);

  const getOrCreateRecaptchaVerifier = () => {
    if (typeof window === 'undefined') return null;

    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {}
    }

    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          setError('Security verification expired. Please resend the code.');
        },
      });
      recaptchaVerifierRef.current = verifier;
      return verifier;
    } catch (err) {
      console.error('RecaptchaVerifier init error:', err);
      return null;
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const clean = phone.replace(/\D/g, '');
    if (!validateIndianPhone(clean)) {
      setError('Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setLoading(true);

    try {
      const verifier = getOrCreateRecaptchaVerifier();
      if (!verifier) {
        setError('Could not initialize security verification. Please refresh.');
        setLoading(false);
        return;
      }

      const res = await sendPhoneOtp(clean, verifier);
      if (!res.success || !res.confirmationResult) {
        setError(res.error || 'Failed to send OTP.');
        setLoading(false);
        return;
      }

      setConfirmationResult(res.confirmationResult);
      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
      setOtpCode('');
      setLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    setError(null);

    if (code.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (!confirmationResult) {
      setError('Session expired. Please request a new OTP.');
      setStep('phone');
      return;
    }

    setLoading(true);

    try {
      const res = await verifyPhoneOtp(confirmationResult, code);
      if (!res.success) {
        setError(res.error || 'Invalid verification code.');
        setLoading(false);
        return;
      }

      if (res.isNewUser) {
        // First-time customer onboarding
        setLoading(false);
        setStep('onboarding');
      } else {
        // Existing user verified! Record login activity
        if (auth.currentUser) {
          fetch('/api/auth/record-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: auth.currentUser.uid,
              phone: auth.currentUser.phoneNumber || phone,
              isNewUser: false,
              userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            }),
          }).catch(() => {});
        }

        setIsSuccess(true);
        setTimeout(() => {
          router.replace(redirectPath);
        }, 500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  // Step 3: Complete Onboarding
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your name to complete your profile.');
      return;
    }

    setLoading(true);

    try {
      const res = await completeCustomerOnboarding({
        name: fullName.trim(),
        dob: dob || undefined,
        gender: gender || undefined,
      });

      if (!res.success) {
        setError(res.error || 'Failed to complete registration.');
        setLoading(false);
        return;
      }

      // Record first-time login activity
      if (auth.currentUser) {
        fetch('/api/auth/record-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: auth.currentUser.uid,
            name: fullName.trim(),
            phone: auth.currentUser.phoneNumber || phone,
            dob,
            gender,
            isNewUser: true,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          }),
        }).catch(() => {});
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.replace(redirectPath);
      }, 500);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not complete onboarding.';
      setError(msg);
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center relative overflow-hidden bg-[#0a0a0c]">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-80 h-80 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#12141a]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative z-10 space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-primary font-black mb-1 shadow-inner shadow-primary/20">
            TX
          </div>
          <h1 className="text-3xl font-black font-heading tracking-wider text-white">
            TICKET<span className="text-primary">X</span>
          </h1>
          <p className="text-xs font-bold text-gray-200">
            Welcome to TicketX
          </p>
          <p className="text-[11px] text-gray-400">
            Book Movies. Discover Events. Own Your Experience.
          </p>
        </div>

        {/* Global Error Banner */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-red-500/10"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Banner */}
        <AnimatePresence mode="wait">
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Verified! Redirecting to TicketX...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 1: MOBILE NUMBER INPUT */}
        {step === 'phone' && (
          <motion.form
            key="phone-step"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleSendOtp}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5 font-mono">
                Mobile Number
              </label>
              <div className="relative flex items-center bg-black/50 border border-white/10 rounded-xl overflow-hidden focus-within:border-primary transition-all">
                <span className="px-3.5 py-3 text-xs font-mono font-bold text-gray-400 bg-white/5 border-r border-white/10 select-none">
                  +91
                </span>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(raw);
                    if (error) setError(null);
                  }}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-3 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none font-mono tracking-wider"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1 font-mono">
                We will send a 6-digit OTP for instant login.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SENDING OTP...</span>
                </>
              ) : (
                <>
                  <span>SEND OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
        {step === 'otp' && (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-5"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300 font-mono">
                  Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setError(null);
                  }}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-bold"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Change Number</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                Code sent to <span className="text-white font-bold">{formatIndianPhone(phone)}</span>
              </p>
            </div>

            {/* 6-box OTP component */}
            <VerificationCodeInput
              length={6}
              value={otpCode}
              onChange={(val) => {
                setOtpCode(val);
                if (error) setError(null);
              }}
              onComplete={(completedCode) => {
                handleVerifyOtp(completedCode);
              }}
              disabled={loading || isSuccess}
              hasError={Boolean(error)}
            />

            {/* Verify & Continue Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={loading || otpCode.length !== 6 || isSuccess}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>VERIFYING...</span>
                </>
              ) : (
                <>
                  <span>VERIFY &amp; CONTINUE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {/* Resend OTP Timer / Action */}
            <div className="text-center pt-1">
              {canResend ? (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={loading}
                  className="text-xs text-primary hover:underline font-bold transition-colors"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-[11px] text-gray-500 font-mono">
                  Resend OTP in <span className="text-gray-300 font-bold">{resendTimer}s</span>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 3: FIRST-TIME USER ONBOARDING */}
        {step === 'onboarding' && (
          <motion.form
            key="onboarding-step"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleCompleteOnboarding}
            className="space-y-4"
          >
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/25 text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-primary uppercase">
                <Sparkles className="w-3 h-3" />
                <span>New TicketX Member</span>
              </div>
              <h2 className="text-base font-bold text-white font-heading">
                What should we call you?
              </h2>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Full Name <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={nameInputRef}
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ashu Chinthapalli"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-primary transition-all font-sans"
                />
              </div>
            </div>

            {/* Date of Birth (Optional) */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Date of Birth <span className="text-gray-500 text-[10px] font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-primary transition-all font-sans"
                />
              </div>
            </div>

            {/* Gender (Optional) */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 font-mono">
                Gender <span className="text-gray-500 text-[10px] font-normal">(Optional)</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary transition-all font-sans"
              >
                <option value="Male" className="bg-[#12141a]">Male</option>
                <option value="Female" className="bg-[#12141a]">Female</option>
                <option value="Other" className="bg-[#12141a]">Other</option>
                <option value="Prefer not to say" className="bg-[#12141a]">Prefer not to say</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !fullName.trim()}
              className="w-full mt-2 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>CREATING PROFILE...</span>
                </>
              ) : (
                <>
                  <span>CONTINUE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>
        )}

        {/* SUBTLE ADMIN LOGIN LINK AT ABSOLUTE BOTTOM */}
        <div className="text-center pt-3 border-t border-white/5">
          <Link
            href="/admin-login"
            className="text-[11px] text-gray-500 hover:text-primary transition-colors font-mono tracking-wide"
          >
            Administrative Access
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0c]" />}>
      <CustomerLoginForm />
    </Suspense>
  );
}
