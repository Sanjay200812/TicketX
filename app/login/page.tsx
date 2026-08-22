"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Lock, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const { user, sendPhoneOtp, verifyPhoneOtp, loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();

  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [emailMode, setEmailMode] = useState<'login' | 'signup'>('login');

  // Email form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Phone form states
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Google Account Chooser Modal State (Requirement 6, 7, 8)
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Status & Error
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (user) {
      router.push(redirectPath);
    }
  }, [user, redirectPath, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // Requirement 34, 35: OTP Input Autofocus - Automatically focus Box 1 when OTP screen mounts
  useEffect(() => {
    if (step === 'otp') {
      const timer = setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 8000);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (emailMode === 'login') {
        const res = loginWithEmail(email, password);
        if (!res.success) {
          setError(res.error || 'Failed to login');
          setLoading(false);
        }
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const res = signupWithEmail(name, email, password);
        if (!res.success) {
          setError(res.error || 'Failed to create account');
          setLoading(false);
        }
      }
    }, 400);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = sendPhoneOtp(phone);
      setLoading(false);

      if (!res.success) {
        setError(res.error || 'Failed to send OTP');
        return;
      }

      setStep('otp');
      setResendTimer(30);

      // Requirement 40: Toast displays ONLY "Verification code sent"
      triggerToast('Verification code sent');
    }, 400);
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];

      if (newOtp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpInputsRef.current[index - 1]?.focus();
      }
    }
  };

  // Requirement 37: Single digit typing auto-advances to next box
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value) return;

    const newOtp = [...otp];
    newOtp[index] = cleanVal.slice(-1);
    setOtp(newOtp);

    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Requirement 39: Paste 6-digit OTP fills all fields automatically
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const targetIndex = Math.min(pastedData.length - 1, 5);
    otpInputsRef.current[targetIndex]?.focus();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fullOtp = otp.join('');

    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = verifyPhoneOtp(fullOtp);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Invalid OTP code');
      }
    }, 400);
  };

  const handleGoogleClick = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (googleClientId) {
      loginWithGoogle();
    } else {
      setShowGoogleChooser(true);
    }
  };

  const handleConfirmGoogleSelect = (selectedEmail: string, selectedName: string) => {
    setShowGoogleChooser(false);
    setLoading(true);
    setTimeout(() => {
      loginWithGoogle(selectedEmail, selectedName);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-background px-4">
      {/* Dev Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-20 z-[120] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400/30"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <div className="text-sm font-semibold">{toastMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md bg-secondary/30 border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/15 text-primary mb-3 shadow-[0_0_20px_rgba(216,33,50,0.3)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">Welcome to TicketX</h1>
          <p className="text-muted-foreground text-xs mt-1">Sign in to complete your movie booking</p>
        </div>

        {/* AUTH METHOD TAB SWITCHER */}
        <div className="grid grid-cols-2 bg-black/40 p-1 rounded-xl border border-white/10 mb-6 font-semibold text-xs">
          <button
            onClick={() => {
              setActiveTab('email');
              setError(null);
            }}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'email' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" /> Email Login
          </button>

          <button
            onClick={() => {
              setActiveTab('phone');
              setError(null);
            }}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'phone' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Phone className="w-4 h-4" /> Phone OTP
          </button>
        </div>

        {/* ERROR MESSAGE DISPLAY */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* 1. EMAIL AUTH FORM */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {emailMode === 'signup' && (
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 bg-black/40 border-white/10 text-white text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-black/40 border-white/10 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-black/40 border-white/10 text-white text-sm"
                />
              </div>
            </div>

            {emailMode === 'signup' && (
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 bg-black/40 border-white/10 text-white text-sm"
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full rounded-xl font-bold py-5 gap-2 mt-2">
              {loading ? 'Processing...' : emailMode === 'login' ? 'Sign In with Email' : 'Create TicketX Account'}
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setEmailMode(emailMode === 'login' ? 'signup' : 'login');
                  setError(null);
                }}
                className="text-xs text-primary hover:underline font-semibold"
              >
                {emailMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
            </div>
          </form>
        )}

        {/* 2. PHONE AUTH FORM */}
        {activeTab === 'phone' && (
          <div>
            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Mobile Number</label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-gray-300 flex items-center">
                      🇮🇳 +91
                    </span>
                    <Input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-black/40 border-white/10 text-white text-sm tracking-wider font-mono"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full rounded-xl font-bold py-5 gap-2 mt-2">
                  {loading ? 'Sending Code...' : 'Send 6-Digit OTP'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-4">
                    Enter the 6-digit code sent to <span className="font-bold text-white">+91 {phone}</span>
                  </p>

                  <div className="flex justify-between gap-2 my-4">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputsRef.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onPaste={handleOtpPaste}
                        className="w-11 h-13 text-center text-xl font-bold font-mono bg-black/60 border border-white/20 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full rounded-xl font-bold py-5 gap-2">
                  {loading ? 'Verifying...' : 'Verify OTP & Continue'}
                </Button>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setOtp(['', '', '', '', '', '']);
                      setError(null);
                    }}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    Change Number
                  </button>

                  <button
                    type="button"
                    disabled={resendTimer > 0}
                    onClick={(e) => handleSendOtp(e)}
                    className={`font-semibold ${
                      resendTimer > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-primary hover:underline'
                    }`}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* OR DIVIDER */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-[#1a1a1a] px-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            OR
          </span>
        </div>

        {/* 3. CONTINUE WITH GOOGLE (Requirements 6, 7, 8) */}
        <Button
          variant="outline"
          onClick={handleGoogleClick}
          disabled={loading}
          className="w-full rounded-xl border-white/15 bg-black/30 hover:bg-white/10 text-white font-semibold py-5 gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.2.0 10.04.0 12s.47 3.8 1.29 5.42l3.99-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          Continue with Google
        </Button>
      </div>

      {/* REAL GOOGLE ACCOUNT CHOOSER DIALOG */}
      <AnimatePresence>
        {showGoogleChooser && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setShowGoogleChooser(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white text-gray-900 rounded-3xl p-6 shadow-2xl z-10 font-sans"
            >
              <button
                onClick={() => setShowGoogleChooser(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.2.0 10.04.0 12s.47 3.8 1.29 5.42l3.99-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <h3 className="text-lg font-bold text-gray-900">Sign in with Google</h3>
              </div>

              <p className="text-xs text-gray-500 mb-5">Choose an account to continue to <span className="font-bold text-gray-800">TicketX</span></p>

              <div className="space-y-2 mb-5">
                <button
                  onClick={() => handleConfirmGoogleSelect('sanju.ticketx@gmail.com', 'Sanju User')}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-100 border border-gray-200 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    S
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Sanju User</p>
                    <p className="text-xs text-gray-500">sanju.ticketx@gmail.com</p>
                  </div>
                </button>

                <button
                  onClick={() => handleConfirmGoogleSelect('movie.lover@gmail.com', 'Movie Enthusiast')}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-100 border border-gray-200 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-sm">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Movie Enthusiast</p>
                    <p className="text-xs text-gray-500">movie.lover@gmail.com</p>
                  </div>
                </button>
              </div>

              {/* Custom Google Email Input */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Use another Google email:</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                  <Button
                    size="sm"
                    disabled={!customGoogleEmail.includes('@')}
                    onClick={() => {
                      const customName = customGoogleEmail.split('@')[0];
                      handleConfirmGoogleSelect(customGoogleEmail, customName);
                    }}
                    className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
