"use client";

import React from 'react';
import { VerificationCodeInput, isDevAuthMode, DEV_OTP } from './VerificationCodeInput';

export { isDevAuthMode, DEV_OTP };
export const DEMO_OTP = DEV_OTP;
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
  return (
    <VerificationCodeInput
      length={6}
      recipient={recipient}
      recipientType={recipientType}
      autoFocus={true}
      onVerified={onVerified}
      onResendOtp={onResendOtp}
      onMaxAttemptsReached={onMaxAttemptsReached}
      showTearingAnimation={true}
    />
  );
}
