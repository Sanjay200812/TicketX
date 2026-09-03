"use client";

import React, { useState } from 'react';
import { VerificationCodeInput } from './VerificationCodeInput';

export const MAX_OTP_ATTEMPTS = 5;

interface OtpInputProps {
  recipient?: string;
  onVerified?: (code: string) => void | Promise<void>;
  onResendOtp?: () => void;
  disabled?: boolean;
}

export function OtpInput({
  onVerified,
  disabled = false,
}: OtpInputProps) {
  const [code, setCode] = useState('');

  return (
    <VerificationCodeInput
      length={6}
      value={code}
      onChange={setCode}
      onComplete={onVerified}
      disabled={disabled}
    />
  );
}
