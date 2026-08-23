"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, Smartphone, UserPlus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, validateIndianPhone } from '@/context/AuthContext';
import { OtpInput } from '@/components/auth/OtpInput';
import { BouncingTicketLoader } from '@/components/shared/BouncingTicketLoader';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const {
    user,
    loginWithEmail,
    loginWithGoogle,
    resolvePostOtpAccount,
    checkAccountRegistered,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    isPasswordLocked,
    cooldownSeconds,
  } = useAuth();

  // Mode Selection: 'email' | 'phone' | 'email-otp' | 'forgot'
  const [authMode, setAuthMode] = useState<'email' | 'phone' | 'email-otp' | 'forgot'>('email');

  // Form Field States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone OTP States (Requirements 2, 3, 4, 12, 13, 14)
  const [phone, setPhone] = useState('');
  const [phoneOtpStep, setPhoneOtpStep] = useState<'input' | 'otp' | 'new-user-name'>('input');
  const [newUserName, setNewUserName] = useState('');

  // Email OTP States (Requirements 15, 16, 17)
  const [otpEmail, setOtpEmail] = useState('');
  const [emailOtpStep, setEmailOtpStep] = useState<'input' | 'otp' | 'new-user-name'>('input');

  // Forgot Password States
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'new-pass'>('email');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI Feedback States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Requirement 1, 20: Navigate away immediately if authenticated
  useEffect(() => {
    if (user) {
      router.replace(redirectPath);
    }
  }, [user, router, redirectPath]);

  // Requirement 21: Clear all temporary auth state
  const clearAllTempState = () => {
    setEmail('');
    setPassword('');
    setPhone('');
    setOtpEmail('');
    setForgotOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setNewUserName('');
    setError(null);
    setShowSignupPrompt(false);
    setSuccessMessage(null);
    setLoading(false);
    setPhoneOtpStep('input');
    setEmailOtpStep('input');
    setForgotStep('email');
  };

  const switchAuthMode = (mode: 'email' | 'phone' | 'email-otp' | 'forgot') => {
    setAuthMode(mode);
    clearAllTempState();
  };

  // Helper for navigating into site after successful authentication
  const handleAuthSuccess = () => {
    clearAllTempState();
    router.replace(redirectPath);
  };

  // 1. EMAIL + PASSWORD SIGN IN (Requirements 18)
  const isPasswordValid = password.length >= 6;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowSignupPrompt(false);

    if (isPasswordLocked) {
      setError(`Too many failed attempts. Try again in ${cooldownSeconds}s.`);
      return;
    }

    if (!isPasswordValid) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const isRegistered = await checkAccountRegistered(email, 'email');
    if (!isRegistered) {
      setLoading(false);
      setError('No account found. Sign up first.');
      setShowSignupPrompt(true);
      return;
    }

    const res = await loginWithEmail(email, password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Sign in failed.');
      if (res.error?.includes('No account found')) {
        setShowSignupPrompt(true);
      }
    } else {
      handleAuthSuccess();
    }
  };

  // 2. PHONE NUMBER SIGN IN (Requirements 2, 3, 4, 5, 12, 13, 14)
  const isPhoneValid = validateIndianPhone(phone);

  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPhoneValid) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Requirement 5: Instant OTP display without delay
    setPhoneOtpStep('otp');
  };

  const handlePhoneOtpVerified = async () => {
    setLoading(true);
    // Requirement 12, 13, 14: Account lookup ONLY AFTER OTP verify
    const res = await resolvePostOtpAccount({ identifier: phone, type: 'phone' });
    setLoading(false);

    if (res.isNewUser) {
      // Requirement 13: New user -> show Name prompt
      setPhoneOtpStep('new-user-name');
    } else if (res.success) {
      handleAuthSuccess();
    } else {
      setError(res.error || 'Phone login failed.');
    }
  };

  const handleCreatePhoneAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    const res = await resolvePostOtpAccount({
      identifier: phone,
      type: 'phone',
      name: newUserName.trim(),
    });
    setLoading(false);

    if (res.success) {
      handleAuthSuccess();
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  // 3. EMAIL OTP SIGN IN (Requirements 15, 16, 17)
  const handleSendEmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpEmail || !otpEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setEmailOtpStep('otp');
  };

  const handleEmailOtpVerified = async () => {
    setLoading(true);
    const res = await resolvePostOtpAccount({ identifier: otpEmail, type: 'email' });
    setLoading(false);

    if (res.isNewUser) {
      setEmailOtpStep('new-user-name');
    } else if (res.success) {
      handleAuthSuccess();
    } else {
      setError(res.error || 'Email OTP login failed.');
    }
  };

  const handleCreateEmailOtpAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    const res = await resolvePostOtpAccount({
      identifier: otpEmail,
      type: 'email',
      name: newUserName.trim(),
    });
    setLoading(false);

    if (res.success) {
      handleAuthSuccess();
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  // 4. GOOGLE SIGN IN (Requirement 19)
  const handleGoogleSubmit = async () => {
    setError(null);
    setShowSignupPrompt(false);
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);

    if (res.success) {
      handleAuthSuccess();
    } else {
      setError(res.error || 'Unable to sign in with Google. Please try again.');
    }
  };

  // 5. FORGOT PASSWORD FLOW
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await sendForgotPasswordOtp(email);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to send OTP.');
      if (res.error?.includes('No account found')) {
        setShowSignupPrompt(true);
      }
    } else {
      setForgotStep('otp');
    }
  };

  const handleVerifyForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotOtp.replace(/\D/g, '').length !== 6) {
      setError('Enter valid 6-digit verification code.');
      return;
    }
    setError(null);
    setForgotStep('new-pass');
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await verifyForgotPasswordOtp(email, forgotOtp, newPassword);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Password reset failed.');
    } else {
      setSuccessMessage('Password reset successfully! Please sign in with your new password.');
      switchAuthMode('email');
    }
  };

  return (
    <div className="w-full max-w-md bg-secondary/40 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 backdrop-blur-xl space-y-6">
      {/* Branding Header */}
      <div className="text-center space-y-1">
        <Link href="/" className="inline-block mb-2">
          <span className="text-3xl font-black font-heading tracking-widest text-white">
            TICKET<span className="text-primary">X</span>
          </span>
        </Link>
        <h1 className="text-xl font-bold font-heading text-white">
          {authMode === 'forgot' ? 'Reset Password' : 'Welcome Back'}
        </h1>
        <p className="text-xs text-muted-foreground">
          {authMode === 'forgot'
            ? 'Enter your registered email to receive an OTP'
            : 'Sign in to access your digital tickets & bookings'}
        </p>
      </div>

      {/* Global Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-destructive/20 border border-destructive/40 text-destructive text-xs font-bold space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            </div>

            {showSignupPrompt && (
              <div className="pt-2 border-t border-destructive/30 flex justify-end">
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-extrabold flex items-center gap-1 hover:bg-primary/90 transition-colors shadow-md"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Sign Up Now →
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORGOT PASSWORD FORM */}
      {authMode === 'forgot' && (
        <div className="space-y-4">
          {forgotStep === 'email' && (
            <form onSubmit={handleSendForgotOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Registered Email</label>
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

              <Button type="submit" disabled={loading} className="w-full rounded-xl font-bold py-5 gap-2">
                {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          {forgotStep === 'otp' && (
            <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Enter 6-Digit OTP</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="bg-black/40 border-white/10 text-white text-center font-mono text-lg font-bold tracking-widest"
                />
              </div>

              <Button type="submit" className="w-full rounded-xl font-bold py-5">
                Verify OTP
              </Button>
            </form>
          )}

          {forgotStep === 'new-pass' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">New Password (min 6 chars)</label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black/40 border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Confirm New Password</label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="bg-black/40 border-white/10 text-white text-sm"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full rounded-xl font-bold py-5">
                {loading ? 'Updating Password...' : 'Reset Password'}
              </Button>
            </form>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => switchAuthMode('email')}
              className="text-xs text-primary hover:underline font-semibold"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      )}

      {/* 1. EMAIL + PASSWORD SIGN IN */}
      {authMode === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-300">Password</label>
              <button
                type="button"
                onClick={() => switchAuthMode('forgot')}
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10 bg-black/40 border-white/10 text-white text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {password.length > 0 && !isPasswordValid && (
              <p className="text-[11px] text-amber-300 font-mono mt-1.5 font-bold">
                Password must be at least 6 characters.
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || isPasswordLocked}
            className="w-full rounded-xl font-bold py-5 gap-2 mt-2"
          >
            {loading ? 'Signing In...' : isPasswordLocked ? `Locked (${cooldownSeconds}s)` : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      )}

      {/* 2. PHONE NUMBER SIGN IN */}
      {authMode === 'phone' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">Phone Number</h3>

          {phoneOtpStep === 'input' ? (
            <form onSubmit={handleSendPhoneOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Mobile Phone (+91)</label>
                <div className="flex gap-2.5">
                  <span className="px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm font-bold text-gray-200 flex items-center shrink-0 font-mono">
                    +91
                  </span>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="bg-black/40 border-white/10 text-white text-sm tracking-wider font-mono"
                  />
                </div>
              </div>

              <Button type="submit" disabled={!isPhoneValid} className="w-full rounded-xl font-bold py-5 gap-2">
                Send OTP <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          ) : phoneOtpStep === 'otp' ? (
            <OtpInput
              recipient={phone}
              recipientType="phone"
              onVerified={handlePhoneOtpVerified}
              onResendOtp={() => {}}
              onMaxAttemptsReached={() => setPhoneOtpStep('input')}
            />
          ) : (
            loading ? (
              <BouncingTicketLoader message="Creating your TicketX digital pass..." />
            ) : (
              /* Requirement 13: Minimal New User Prompt */
              <form onSubmit={handleCreatePhoneAccount} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-1">
                  <p className="text-xs font-bold text-primary font-heading uppercase tracking-wider">
                    You&apos;re new to TicketX
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Enter your name to complete your digital pass profile.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="pl-9 bg-black/40 border-white/15 text-white text-sm"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={!newUserName.trim() || loading} className="w-full rounded-xl font-bold py-5 gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => switchAuthMode('email')}
              className="text-xs text-primary hover:underline font-semibold"
            >
              ← Back to Email Sign In
            </button>
          </div>
        </div>
      )}

      {/* 3. EMAIL OTP SIGN IN */}
      {authMode === 'email-otp' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">Email OTP</h3>

          {emailOtpStep === 'input' ? (
            <form onSubmit={handleSendEmailOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Registered Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    className="pl-9 bg-black/40 border-white/10 text-white text-sm"
                  />
                </div>
              </div>

              <Button type="submit" disabled={!otpEmail} className="w-full rounded-xl font-bold py-5 gap-2">
                Send OTP <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          ) : emailOtpStep === 'otp' ? (
            <OtpInput
              recipient={otpEmail}
              recipientType="email"
              onVerified={handleEmailOtpVerified}
              onResendOtp={() => {}}
              onMaxAttemptsReached={() => setEmailOtpStep('input')}
            />
          ) : (
            /* Requirement 17: Minimal New User Prompt */
            <form onSubmit={handleCreateEmailOtpAccount} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-1">
                <p className="text-xs font-bold text-primary font-heading uppercase tracking-wider">
                  You&apos;re new to TicketX
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Enter your name to complete your digital pass profile.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="pl-9 bg-black/40 border-white/15 text-white text-sm"
                  />
                </div>
              </div>

              <Button type="submit" disabled={!newUserName.trim() || loading} className="w-full rounded-xl font-bold py-5 gap-2">
                {loading ? 'Creating Account...' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => switchAuthMode('email')}
              className="text-xs text-primary hover:underline font-semibold"
            >
              ← Back to Email Sign In
            </button>
          </div>
        </div>
      )}

      {/* STANDALONE GOOGLE LOGIN & OTHER SIGN-IN OPTIONS */}
      {authMode !== 'forgot' && (
        <>
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 bg-[#16161b] text-[11px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
              OR
            </span>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleSubmit}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-white text-black hover:bg-gray-100 font-bold text-xs transition-colors flex items-center justify-center gap-2.5 shadow-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Other Sign-In Options */}
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block text-center font-mono">
              Other Sign-In Options
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => switchAuthMode('phone')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  authMode === 'phone'
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-black/30 border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-primary" />
                <span>Phone Number</span>
              </button>

              <button
                type="button"
                onClick={() => switchAuthMode('email-otp')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  authMode === 'email-otp'
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-black/30 border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Email OTP</span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary hover:underline font-bold">
                Sign Up
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-background flex items-center justify-center px-4">
      {/* Background glowing glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-md h-[400px] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
      <Suspense
        fallback={
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
