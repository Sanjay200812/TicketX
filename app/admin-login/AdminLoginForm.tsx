"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, KeyRound, Eye, EyeOff, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export function AdminLoginForm() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessKey, setAccessKey] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showAccessKey, setShowAccessKey] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const accessKeyRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password || !accessKey.trim()) {
      setErrorMessage('Invalid administrative credentials.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password, accessKey);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid administrative credentials.');
        setLoading(false);
        return;
      }

      router.push('/admin');
    } catch {
      setErrorMessage('Invalid administrative credentials.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md bg-[#12141a]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative z-10 space-y-6"
    >
      {/* Brand & Subtitle */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-primary font-black mb-1 shadow-inner shadow-primary/20"
        >
          TX
        </motion.div>
        <h1 className="text-2xl font-black font-heading text-white tracking-wider">
          TicketX Admin
        </h1>
        <p className="text-xs text-gray-400 font-mono tracking-wide">
          Secure Administrative Access
        </p>
      </div>

      {/* Generic Error Message with smooth animation */}
      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-red-500/10"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Admin Email */}
        <div>
          <label className="text-xs font-bold text-gray-300 block mb-1.5 font-mono">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              ref={emailRef}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="boddukurisanjay@gmail.com"
              className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-primary transition-all font-sans"
            />
          </div>
        </div>

        {/* Step 2: Password */}
        <div>
          <label className="text-xs font-bold text-gray-300 block mb-1.5 font-mono">
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              ref={passwordRef}
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-primary transition-all font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Step 3: Admin Access Key */}
        <div>
          <label className="text-xs font-bold text-gray-300 block mb-1.5 font-mono">
            Admin Access Key
          </label>
          <div className="relative group">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <input
              ref={accessKeyRef}
              type={showAccessKey ? 'text' : 'password'}
              required
              autoComplete="off"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="••••"
              className="w-full pl-10 pr-10 py-2.5 bg-black/50 border border-primary/30 focus:border-primary rounded-xl text-sm text-white placeholder:text-gray-600 outline-none transition-all font-mono tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowAccessKey(!showAccessKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition-colors"
            >
              {showAccessKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Privileges...</span>
            </>
          ) : (
            <>
              <span>SIGN IN TO ADMIN</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Footer disclaimer */}
      <div className="text-center pt-2 border-t border-white/5">
        <p className="text-[11px] text-gray-400 font-mono">
          Authorized TicketX personnel only.
        </p>
      </div>
    </motion.div>
  );
}
