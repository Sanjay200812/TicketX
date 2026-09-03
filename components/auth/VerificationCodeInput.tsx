"use client";

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VerificationCodeInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export function VerificationCodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
}: VerificationCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Array of digits
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus first empty box on mount
    const firstEmpty = digits.findIndex((d) => !d);
    const targetIdx = firstEmpty === -1 ? 0 : firstEmpty;
    inputRefs.current[targetIdx]?.focus();
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      // Cleared
      const newDigits = [...digits];
      newDigits[index] = '';
      const newVal = newDigits.join('');
      onChange(newVal);
      return;
    }

    const lastChar = rawVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = lastChar;
    const newVal = newDigits.join('');
    onChange(newVal);

    // Auto focus next box
    if (index < length - 1 && lastChar) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto complete callback if full
    if (newVal.length === length && onComplete) {
      onComplete(newVal);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current is already empty, go back and clear previous
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pastedData) return;

    onChange(pastedData);

    const focusIdx = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIdx]?.focus();

    if (pastedData.length === length && onComplete) {
      onComplete(pastedData);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, idx) => (
        <motion.input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
          disabled={disabled}
          value={digits[idx] || ''}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          whileFocus={{ scale: 1.05 }}
          className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl bg-black/50 border transition-all outline-none ${
            hasError
              ? 'border-red-500/60 text-red-400 bg-red-500/5 focus:border-red-500'
              : digits[idx]
              ? 'border-primary text-white bg-primary/10 shadow-[0_0_15px_rgba(216,33,50,0.2)]'
              : 'border-white/10 text-white hover:border-white/25 focus:border-primary'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}
