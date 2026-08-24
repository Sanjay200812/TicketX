"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, validateIndianPhone, validateMinimumAge16 } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { signupWithEmail } = useAuth();

  // Field Refs for seamless keyboard navigation (Requirement 1)
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);
  const dobRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Single password rule — minimum 6 characters
  const isPasswordValid = password.length >= 6;
  const isPhoneValid = validateIndianPhone(phone);

  // DOB Age Validation
  const isDobAgeValid = dob ? validateMinimumAge16(dob) : false;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isPhoneValid) {
      setError('Enter a valid number');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!dob || !isDobAgeValid) {
      setError("Doesn't meet age requirements.");
      return;
    }

    setLoading(true);
    const res = await signupWithEmail({
      name,
      email,
      pass: password,
      phone,
      gender,
      dob,
    });
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to create account.');
    } else {
      setSuccess('Account created successfully! Redirecting to home...');
      setTimeout(() => {
        router.push('/');
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background flex items-center justify-center px-4">
      {/* Background glowing glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-md h-[400px] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg bg-secondary/40 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 backdrop-blur-xl space-y-6">
        <div className="text-center space-y-1">
          <Link href="/" className="inline-block mb-2">
            <span className="text-3xl font-black font-heading tracking-widest text-white">
              TICKET<span className="text-primary">X</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold font-heading text-white">Create Account</h1>
          <p className="text-xs text-muted-foreground">
            Join TicketX for seamless bookings, digital tickets &amp; faster movie access.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/20 border border-destructive/40 text-destructive text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={nameRef}
                type="text"
                autoComplete="name"
                enterKeyHint="next"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    emailRef.current?.focus();
                  }
                }}
                className="pl-9 bg-black/40 border-white/10 text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={emailRef}
                type="email"
                autoComplete="email"
                enterKeyHint="next"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    phoneRef.current?.focus();
                  }
                }}
                className="pl-9 bg-black/40 border-white/10 text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">Mobile Phone (+91) *</label>
            <div className="flex gap-2.5">
              <span className="px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm font-bold text-gray-200 flex items-center shrink-0 font-mono">
                +91
              </span>
              <Input
                ref={phoneRef}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                enterKeyHint="next"
                maxLength={10}
                required
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    passwordRef.current?.focus();
                  }
                }}
                className="bg-black/40 border-white/10 text-white text-sm tracking-wider font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  enterKeyHint="next"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      confirmPasswordRef.current?.focus();
                    }
                  }}
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

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={confirmPasswordRef}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  enterKeyHint="next"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      dobRef.current?.focus();
                    }
                  }}
                  className="pl-9 bg-black/40 border-white/10 text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-white font-semibold text-sm outline-none focus:border-primary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                Date of Birth *
              </label>
              <Input
                ref={dobRef}
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="bg-black/40 border-white/10 text-white text-sm"
              />
              {dob && !isDobAgeValid && (
                <p className="text-[10px] text-amber-300 font-bold mt-1">Doesn&apos;t meet age requirements.</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !isPhoneValid || !isPasswordValid || password !== confirmPassword || !isDobAgeValid}
            className="w-full rounded-xl font-bold py-5 gap-2 mt-4"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-white/10">
          <p className="text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
