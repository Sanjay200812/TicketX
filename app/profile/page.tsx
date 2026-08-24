"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Ticket,
  MapPin,
  ChevronRight,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Camera,
  ShieldCheck,
  Heart,
  KeyRound,
  Phone,
  Mail,
  User,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { useAuth, validateIndianPhone, validateMinimumAge16 } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageCropModal } from '@/components/profile/ImageCropModal';
import { VerificationCodeInput } from '@/components/auth/VerificationCodeInput';

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    updateProfileData,
    uploadProfilePicture,
    addPhoneToCurrentProfile,
    updateProfileEmail,
    reauthenticateAndChangePassword,
    logout,
  } = useAuth();
  const { location, setIsCityModalOpen } = useLocation();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileForCrop, setSelectedFileForCrop] = useState<File | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Edit Name Modal / Form
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // Phone Linking / Updating Modal (Requirements 10, 11, 12, 44, 45)
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');

  // Email Linking / Updating Modal (Requirements 13, 14, 15)
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailStep, setEmailStep] = useState<'input' | 'otp'>('input');

  // Gender Modal / Editing (Requirement 16)
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [genderInput, setGenderInput] = useState('Prefer not to say');

  // DOB Modal / Editing (Requirement 17)
  const [showDobModal, setShowDobModal] = useState(false);
  const [dobInput, setDobInput] = useState('');

  // Change Password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    setNameInput(user.name || user.displayName || '');
    setGenderInput(user.gender || 'Prefer not to say');
    setDobInput(user.dob || '');
  }, [user, router]);

  if (!user) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // User-friendly formatted DOB (Requirement 17: e.g. "24 Aug 2006")
  const getFormattedDisplayDob = (isoStr?: string | null): string => {
    if (!isoStr) return 'Not added';
    try {
      const parts = isoStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      return isoStr;
    } catch {
      return isoStr;
    }
  };

  // Name Update Handler
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setLoading(true);
    const res = await updateProfileData({ name: nameInput.trim(), displayName: nameInput.trim() });
    setLoading(false);

    if (res.success) {
      setShowNameModal(false);
      triggerToast('Saved successfully');
    } else {
      setErrorMessage(res.error || 'Failed to update name');
    }
  };

  // Profile Picture File Selection -> Opens Adjust/Crop Modal (Requirements 19, 20, 21)
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileForCrop(file);
    setIsCropModalOpen(true);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    setUploadingPhoto(true);
    setErrorMessage(null);

    const res = await uploadProfilePicture(croppedFile);
    setUploadingPhoto(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Unable to update profile picture.');
      return;
    }

    triggerToast('Saved successfully');
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    await updateProfileData({ photoURL: '', avatar: '' });
    setUploadingPhoto(false);
    triggerToast('Profile picture removed.');
  };

  // PHONE UPDATE / LINKING FLOW (Requirements 10, 11, 12, 44, 45)
  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateIndianPhone(phoneInput)) {
      setErrorMessage('Enter a valid number');
      return;
    }

    setPhoneStep('otp');
  };

  const handlePhoneOtpVerified = async () => {
    setLoading(true);
    const res = await addPhoneToCurrentProfile(phoneInput);
    setLoading(false);

    if (res.success) {
      setShowPhoneModal(false);
      setPhoneStep('input');
      setPhoneInput('');
      triggerToast('Saved successfully');
    } else {
      setErrorMessage(res.error || 'Failed to update phone number.');
    }
  };

  // EMAIL UPDATE / LINKING FLOW (Requirements 13, 14, 15)
  const handleSendEmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clean = emailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setErrorMessage('Enter a valid email address');
      return;
    }

    setEmailStep('otp');
  };

  const handleEmailOtpVerified = async () => {
    setLoading(true);
    const res = await updateProfileEmail(emailInput);
    setLoading(false);

    if (res.success) {
      setShowEmailModal(false);
      setEmailStep('input');
      setEmailInput('');
      triggerToast('Saved successfully');
    } else {
      setErrorMessage(res.error || 'Failed to update email address.');
    }
  };

  // GENDER UPDATE HANDLER (Requirement 16)
  const handleSaveGender = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfileData({ gender: genderInput });
    setLoading(false);

    if (res.success) {
      setShowGenderModal(false);
      triggerToast('Saved successfully');
    } else {
      setErrorMessage(res.error || 'Failed to update gender.');
    }
  };

  // DOB UPDATE HANDLER (Requirement 17)
  const handleSaveDob = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (dobInput && !validateMinimumAge16(dobInput)) {
      setErrorMessage("Doesn't meet age requirements.");
      return;
    }

    setLoading(true);
    const res = await updateProfileData({ dob: dobInput });
    setLoading(false);

    if (res.success) {
      setShowDobModal(false);
      triggerToast('Saved successfully');
    } else {
      setErrorMessage(res.error || 'Failed to update date of birth.');
    }
  };

  // CHANGE PASSWORD HANDLER
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await reauthenticateAndChangePassword(oldPassword, newPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to change password.');
    } else {
      setShowChangePassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      triggerToast('Saved successfully');
    }
  };

  const isGoogleOnly =
    user.authMethods?.includes('google.com') && !user.authMethods?.includes('password');
  const isDemoPhoneAccount = user.uid.startsWith('phone:');
  const avatarUrl = user.photoURL || user.avatar;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/95 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Image Crop Modal with Adjust Mode (Requirements 19, 20, 21) */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageFile={selectedFileForCrop}
        onCropComplete={handleCropComplete}
      />

      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Profile Card Header */}
        <div className="bg-secondary/40 border border-white/10 rounded-3xl p-6 md:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-5">
            {/* Avatar Photo with Upload Trigger */}
            <div className="relative group shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary/60 shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-rose-700 to-black text-white font-extrabold flex items-center justify-center text-2xl border-2 border-primary/50 shadow-xl font-heading">
                  {(user.name || user.email || user.phoneNumber || 'U').charAt(0).toUpperCase()}
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                title="Change & Adjust Profile Photo"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span>{uploadingPhoto ? 'Uploading...' : 'Adjust Photo'}</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelected}
                className="hidden"
              />
            </div>

            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold">Welcome Back</p>
              <div className="flex items-center gap-2">
                <h1 className="ticketx-page-title text-2xl md:text-3xl text-white">
                  {user.name || user.displayName || 'ASHU CHINTHAPALLI'}
                </h1>
                <button
                  type="button"
                  onClick={() => setShowNameModal(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

              {/* Verification Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-xs">
                {user.phoneVerified || user.phoneNumber ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Phone Verified
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-400" /> Phone Verification Required
                  </span>
                )}

                {user.email && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      user.emailVerified
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {user.emailVerified ? '✓ Email Verified' : 'Email Verification Pending'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {avatarUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemovePhoto}
                className="rounded-xl border-white/10 text-gray-400 hover:text-white text-xs h-9 px-3"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Remove
              </Button>
            )}

            <Button
              variant="outline"
              onClick={async () => {
                await logout();
                router.push('/');
              }}
              className="rounded-xl border-white/10 text-gray-300 hover:text-white hover:bg-white/5 gap-2 font-bold text-xs h-9 px-4"
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-bold flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-destructive hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* QUICK LINKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/my-bookings"
            className="bg-secondary/30 border border-white/10 hover:border-primary/40 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-bold text-white group-hover:text-amber-400 transition-colors text-sm">My Bookings</p>
                <p className="text-[11px] text-muted-foreground">Past, Archived &amp; Upcoming</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/favorites"
            className="bg-secondary/30 border border-white/10 hover:border-rose-500/40 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <div>
                <p className="font-bold text-white group-hover:text-rose-400 transition-colors text-sm">Saved Movies</p>
                <p className="text-[11px] text-muted-foreground">Favorites list</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={() => setIsCityModalOpen(true)}
            className="bg-secondary/30 border border-white/10 hover:border-primary/40 rounded-2xl p-4 flex items-center justify-between transition-all group text-left shadow-lg"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-bold text-white group-hover:text-emerald-400 transition-colors text-sm">Saved Location</p>
                <p className="text-[11px] text-muted-foreground">{location.city.name}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* ACCOUNT INFORMATION — UNIFIED VISUAL STRUCTURE (Requirement 18) */}
        <div className="bg-secondary/30 border border-white/10 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="font-bold text-lg text-white font-heading">
                Account Information
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage your verified contact details and personal information
              </p>
            </div>
            {!isGoogleOnly && !isDemoPhoneAccount && (
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" /> Change Password
              </button>
            )}
          </div>

          {/* 4 Consistent Rows: Phone Number, Email, Gender, Date of Birth */}
          <div className="space-y-3 pt-2">
            {/* ROW 1: PHONE NUMBER */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 transition-all hover:border-white/15">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Phone Number
                  </span>
                  <span className={`text-sm font-mono font-bold truncate block ${user.phoneNumber || user.displayPhone ? 'text-white' : 'text-gray-400'}`}>
                    {user.displayPhone || user.phoneNumber || 'Not added'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setPhoneInput(user.phoneNumber ? user.phoneNumber.replace('+91', '') : '');
                  setPhoneStep('input');
                  setShowPhoneModal(true);
                }}
                className="text-xs text-primary hover:underline font-bold px-3.5 py-1.5 bg-primary/10 rounded-xl border border-primary/20 shrink-0 flex items-center gap-1 hover:bg-primary/20 transition-all"
              >
                <span>{user.phoneNumber || user.displayPhone ? 'Edit' : 'Add'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* ROW 2: EMAIL ADDRESS */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 transition-all hover:border-white/15">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Email Address
                  </span>
                  <span className={`text-sm font-mono font-bold truncate block ${user.email ? 'text-white' : 'text-gray-400'}`}>
                    {user.email || 'Not added'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setEmailInput(user.email || '');
                  setEmailStep('input');
                  setShowEmailModal(true);
                }}
                className="text-xs text-primary hover:underline font-bold px-3.5 py-1.5 bg-primary/10 rounded-xl border border-primary/20 shrink-0 flex items-center gap-1 hover:bg-primary/20 transition-all"
              >
                <span>{user.email ? 'Edit' : 'Add'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* ROW 3: GENDER */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 transition-all hover:border-white/15">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Gender
                  </span>
                  <span className={`text-sm font-bold truncate block ${user.gender ? 'text-white' : 'text-gray-400'}`}>
                    {user.gender || 'Not added'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setGenderInput(user.gender || 'Prefer not to say');
                  setShowGenderModal(true);
                }}
                className="text-xs text-primary hover:underline font-bold px-3.5 py-1.5 bg-primary/10 rounded-xl border border-primary/20 shrink-0 flex items-center gap-1 hover:bg-primary/20 transition-all"
              >
                <span>{user.gender ? 'Edit' : 'Add'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* ROW 4: DATE OF BIRTH */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 transition-all hover:border-white/15">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Date of Birth
                  </span>
                  <span className={`text-sm font-bold truncate block ${user.dob ? 'text-white' : 'text-gray-400'}`}>
                    {getFormattedDisplayDob(user.dob)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setDobInput(user.dob || '');
                  setShowDobModal(true);
                }}
                className="text-xs text-primary hover:underline font-bold px-3.5 py-1.5 bg-primary/10 rounded-xl border border-primary/20 shrink-0 flex items-center gap-1 hover:bg-primary/20 transition-all"
              >
                <span>{user.dob ? 'Edit' : 'Add'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* CHANGE PASSWORD CARD */}
        {showChangePassword && (
          <form onSubmit={handleChangePasswordSubmit} className="mt-8 bg-secondary/40 border border-white/10 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="font-bold text-lg text-white font-heading flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" /> Change Account Password
              </h3>
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="text-xs text-muted-foreground hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Current (Old) Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showOldPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="pl-9 pr-10 bg-black/40 border-white/15 text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 pr-10 bg-black/40 border-white/15 text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showConfirmNewPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="pl-9 pr-10 bg-black/40 border-white/15 text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading} className="rounded-xl font-bold px-6 text-xs">
                  {loading ? 'Updating Password...' : 'UPDATE PASSWORD'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* EDIT DISPLAY NAME MODAL */}
      <AnimatePresence>
        {showNameModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#141418] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-lg text-white font-heading flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Edit Display Name
                </h3>
                <button onClick={() => setShowNameModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveName} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Full Name</label>
                  <Input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-black/40 border-white/15 text-white text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" type="button" onClick={() => setShowNameModal(false)} className="flex-1 rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !nameInput.trim()} className="flex-1 rounded-xl font-bold">
                    Save Name
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* PHONE UPDATE / VERIFICATION MODAL (Requirements 10, 11, 12, 44, 45) */}
      <AnimatePresence>
        {showPhoneModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#141418] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-lg text-white font-heading flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" /> {user.phoneNumber ? 'Update Phone Number' : 'Add Phone Number'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowPhoneModal(false);
                    setPhoneStep('input');
                  }}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {phoneStep === 'input' ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1.5">Enter 10-Digit Mobile Number (+91)</label>
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
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="bg-black/40 border-white/10 text-white text-sm tracking-wider font-mono"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={!validateIndianPhone(phoneInput)} className="w-full rounded-xl font-bold py-5">
                    Send OTP
                  </Button>
                </form>
              ) : (
                <VerificationCodeInput
                  recipient={phoneInput}
                  recipientType="phone"
                  autoFocus
                  onVerified={handlePhoneOtpVerified}
                  onResendOtp={() => {}}
                  onMaxAttemptsReached={() => setPhoneStep('input')}
                  showTearingAnimation={false}
                />
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* EMAIL UPDATE / VERIFICATION MODAL (Requirements 13, 14, 15) */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#141418] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-lg text-white font-heading flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-400" /> {user.email ? 'Update Email Address' : 'Add Email Address'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailStep('input');
                  }}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {emailStep === 'input' ? (
                <form onSubmit={handleSendEmailOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1.5">Enter Email Address</label>
                    <Input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="bg-black/40 border-white/10 text-white text-sm"
                    />
                  </div>

                  <Button type="submit" disabled={!emailInput || !emailInput.includes('@')} className="w-full rounded-xl font-bold py-5">
                    Send Verification Code
                  </Button>
                </form>
              ) : (
                <VerificationCodeInput
                  recipient={emailInput}
                  recipientType="email"
                  autoFocus
                  onVerified={handleEmailOtpVerified}
                  onResendOtp={() => {}}
                  onMaxAttemptsReached={() => setEmailStep('input')}
                  showTearingAnimation={false}
                />
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* GENDER SELECTION MODAL (Requirement 16) */}
      <AnimatePresence>
        {showGenderModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#141418] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-lg text-white font-heading flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-400" /> Select Gender
                </h3>
                <button onClick={() => setShowGenderModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGender} className="space-y-4">
                <div className="space-y-2">
                  {['Male', 'Female', 'Other', 'Prefer not to say'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        genderInput === opt
                          ? 'bg-primary/15 border-primary text-white font-bold'
                          : 'bg-black/30 border-white/10 text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{opt}</span>
                      <input
                        type="radio"
                        name="gender"
                        value={opt}
                        checked={genderInput === opt}
                        onChange={(e) => setGenderInput(e.target.value)}
                        className="accent-primary"
                      />
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" type="button" onClick={() => setShowGenderModal(false)} className="flex-1 rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 rounded-xl font-bold">
                    Save Gender
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* DATE OF BIRTH MODAL (Requirement 17) */}
      <AnimatePresence>
        {showDobModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#141418] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-lg text-white font-heading flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" /> Date of Birth
                </h3>
                <button onClick={() => setShowDobModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDob} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Select Date of Birth</label>
                  <Input
                    type="date"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    value={dobInput}
                    onChange={(e) => setDobInput(e.target.value)}
                    className="bg-black/40 border-white/15 text-white text-sm"
                  />
                  {dobInput && !validateMinimumAge16(dobInput) && (
                    <p className="text-[11px] text-amber-300 font-bold mt-1.5">Doesn&apos;t meet age requirements (16+).</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" type="button" onClick={() => setShowDobModal(false)} className="flex-1 rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !dobInput || !validateMinimumAge16(dobInput)} className="flex-1 rounded-xl font-bold">
                    Save DOB
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
