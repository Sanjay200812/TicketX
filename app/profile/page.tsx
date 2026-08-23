"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Ticket, MapPin, ChevronRight, Edit3, CheckCircle2, AlertCircle, Trash2, Camera, ShieldCheck, Heart, KeyRound, Phone, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth, validateIndianPhone, validateMinimumAge16 } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageCropModal } from '@/components/profile/ImageCropModal';

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    updateProfileData,
    uploadProfilePicture,
    addPhoneToCurrentProfile,
    reauthenticateAndChangePassword,
    logout,
  } = useAuth();
  const { location, setIsCityModalOpen } = useLocation();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileForCrop, setSelectedFileForCrop] = useState<File | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Profile Edit Form state (Requirements 15, 16, 17, 18)
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Prefer not to say');

  // DOB 4-digit Year state
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  // Phone Linking Modal state (Requirements 8, 9)
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);

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

    setName(user.name || '');
    setGender(user.gender || 'Prefer not to say');

    if (user.dob) {
      const parts = user.dob.split('-');
      if (parts.length === 3) {
        setDobYear(parts[0] || '');
        setDobMonth(parts[1] || '');
        setDobDay(parts[2] || '');
      }
    }
  }, [user, router]);

  if (!user) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getFormattedDob = (): string => {
    if (!dobDay || !dobMonth || !dobYear || dobYear.length !== 4) return '';
    const formattedMonth = dobMonth.padStart(2, '0');
    const formattedDay = dobDay.padStart(2, '0');
    return `${dobYear}-${formattedMonth}-${formattedDay}`;
  };

  const formattedDob = getFormattedDob();
  const isDobAgeValid = formattedDob ? validateMinimumAge16(formattedDob) : true;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formattedDob && !isDobAgeValid) {
      setErrorMessage('You must be at least 16 years old.');
      return;
    }

    const res = await updateProfileData({
      name,
      gender,
      dob: formattedDob || user.dob || '',
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to update profile.');
      return;
    }

    setEditing(false);
    triggerToast('Profile details updated successfully.');
  };

  // Profile Picture File Selection -> Opens Crop Modal (Requirements 19, 20, 21)
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileForCrop(file);
    setIsCropModalOpen(true);
    e.target.value = ''; // Reset input
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

    triggerToast('Profile picture updated instantly!');
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    await updateProfileData({ photoURL: '', avatar: '' });
    setUploadingPhoto(false);
    triggerToast('Profile picture removed.');
  };

  // PHONE LINKING HANDLERS (Requirements 8, 9)
  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateIndianPhone(newPhoneInput)) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setPhoneStep('otp');
    triggerToast(`Verification code sent to +91 ${newPhoneInput}`);
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const code = phoneOtp.join('');
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setErrorMessage('Enter complete 6-digit numeric verification code.');
      return;
    }

    setLoading(true);
    const res = await addPhoneToCurrentProfile(newPhoneInput);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to link phone number.');
    } else {
      setShowPhoneModal(false);
      setPhoneStep('input');
      setNewPhoneInput('');
      setPhoneOtp(['', '', '', '', '', '']);
      triggerToast('Phone number verified and linked to your profile!');
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
      triggerToast('Password updated successfully!');
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
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/90 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Image Crop Modal (Requirements 19, 20) */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageFile={selectedFileForCrop}
        onCropComplete={handleCropComplete}
      />

      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Profile Card Header */}
        <div className="bg-secondary/40 border border-white/10 rounded-2xl p-6 md:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
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
                className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold"
                title="Change Profile Photo"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span>{uploadingPhoto ? 'Uploading...' : 'Crop & Change'}</span>
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
              <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
                <span>{user.name || 'TicketX Member'}</span>
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </h1>

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

        {/* Error message alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-bold flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 2: Clean PHONE NUMBER Not Added (+) card with rotating + icon */}
        {!user.phoneNumber && !user.displayPhone && (
          <div className="mb-6 p-4 md:p-5 rounded-2xl bg-secondary/40 border border-white/10 text-xs font-semibold flex items-center justify-between gap-3 shadow-xl">
            <div>
              <span className="text-white font-extrabold block text-xs tracking-wider uppercase font-mono mb-0.5">PHONE NUMBER</span>
              <span className="text-muted-foreground text-xs font-mono">Not Added</span>
            </div>
            <motion.button
              type="button"
              onClick={() => setShowPhoneModal(true)}
              aria-label="Add phone number"
              title="Add phone number"
              whileTap={{ rotate: 90, scale: 1.15 }}
              whileHover={{ rotate: 45, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-9 h-9 rounded-full bg-primary text-white font-black text-lg flex items-center justify-center shadow-[0_0_15px_rgba(216,33,50,0.4)] shrink-0 cursor-pointer"
            >
              +
            </motion.button>
          </div>
        )}

        {/* EDIT PROFILE FORM CARD */}
        {editing && (
          <form onSubmit={handleSaveProfile} className="bg-secondary/40 border border-white/10 rounded-2xl p-6 md:p-8 mb-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="font-bold text-lg text-white font-heading">Edit Profile Details</h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs text-muted-foreground hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Full Name</label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/40 border-white/15 text-white font-semibold text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white font-semibold text-sm outline-none focus:border-primary"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* DOB 4-DIGIT YEAR & AGE 16+ CHECK (Requirements 15, 16, 17) */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Date of Birth (DD / MM / YYYY)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    placeholder="DD"
                    value={dobDay}
                    onChange={(e) => setDobDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    className="bg-black/40 border-white/15 text-white text-center font-mono text-sm"
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    placeholder="MM"
                    value={dobMonth}
                    onChange={(e) => setDobMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    className="bg-black/40 border-white/15 text-white text-center font-mono text-sm"
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="YYYY"
                    value={dobYear}
                    onChange={(e) => setDobYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="bg-black/40 border-white/15 text-white text-center font-mono text-sm font-bold"
                  />
                </div>
                {formattedDob && !isDobAgeValid && (
                  <p className="text-[11px] text-amber-300 font-bold mt-1.5">Doesn&apos;t meet age requirements.</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={!isDobAgeValid} className="rounded-xl font-bold px-6 text-xs">
                SAVE PROFILE DETAILS
              </Button>
            </div>
          </form>
        )}

        {/* CHANGE PASSWORD CARD */}
        {showChangePassword && (
          <form onSubmit={handleChangePasswordSubmit} className="bg-secondary/40 border border-white/10 rounded-2xl p-6 md:p-8 mb-8 space-y-4 shadow-2xl">
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

            {isGoogleOnly || isDemoPhoneAccount ? (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-muted-foreground">
                Password management is managed via your identity provider ({isGoogleOnly ? 'Google Sign-In' : 'Demo Phone Authentication'}).
              </div>
            ) : (
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
            )}
          </form>
        )}

        {/* DEMO PHONE LINKING MODAL (Requirements 8, 9) */}
        {showPhoneModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#141418] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-lg text-white font-heading flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" /> {user.phoneNumber ? 'Change Mobile Number' : 'Add Mobile Number'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowPhoneModal(false);
                    setPhoneStep('input');
                  }}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  Cancel
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
                        placeholder="6987654321"
                        value={newPhoneInput}
                        onChange={(e) => setNewPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="bg-black/40 border-white/10 text-white text-sm tracking-wider font-mono"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={!validateIndianPhone(newPhoneInput)} className="w-full rounded-xl font-bold py-5">
                    Send OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                  <p className="text-xs text-gray-300">
                    Verification code sent to <strong className="text-white">+91 {newPhoneInput}</strong>:
                  </p>

                  <div className="flex justify-between gap-2 my-4">
                    {phoneOtp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/\D/g, '').slice(0, 1);
                          const arr = [...phoneOtp];
                          arr[idx] = clean;
                          setPhoneOtp(arr);
                        }}
                        className="w-11 h-12 text-center text-lg font-bold font-mono rounded-xl bg-black/50 border border-white/20 text-white focus:border-primary focus:outline-none"
                      />
                    ))}
                  </div>

                  <Button type="submit" disabled={loading || phoneOtp.join('').length !== 6} className="w-full rounded-xl font-bold py-5">
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* QUICK LINKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link
            href="/my-bookings"
            className="bg-secondary/30 border border-white/10 hover:border-primary/40 rounded-2xl p-5 flex items-center justify-between transition-all group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-bold text-white group-hover:text-amber-400 transition-colors text-sm">My Bookings</p>
                <p className="text-xs text-muted-foreground">Upcoming, Past &amp; Archived</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/favorites"
            className="bg-secondary/30 border border-white/10 hover:border-rose-500/40 rounded-2xl p-5 flex items-center justify-between transition-all group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <div>
                <p className="font-bold text-white group-hover:text-rose-400 transition-colors text-sm">Saved Movies</p>
                <p className="text-xs text-muted-foreground">Favorites list</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={() => setIsCityModalOpen(true)}
            className="bg-secondary/30 border border-white/10 hover:border-primary/40 rounded-2xl p-5 flex items-center justify-between transition-all group text-left shadow-lg"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-bold text-white group-hover:text-emerald-400 transition-colors text-sm">Saved Location</p>
                <p className="text-xs text-muted-foreground">{location.city.name}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* ACCOUNT INFORMATION DISPLAY */}
        <div className="bg-secondary/30 border border-white/10 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-lg text-white font-heading">
              Account Information
            </h3>
            {!isGoogleOnly && !isDemoPhoneAccount && (
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" /> Change Password
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono">
            {/* EMAIL (Requirements Section 1) */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-1 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-bold">Email Address</span>
                <span className="font-bold text-white block truncate">{user.email || 'Not Added'}</span>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-primary hover:underline font-bold px-3 py-1.5 bg-primary/10 rounded-xl border border-primary/20 shrink-0"
              >
                {user.email ? 'Edit Email' : 'Add Email'}
              </button>
            </div>

            {/* MOBILE PHONE SECTION (Requirements Section 2) */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-1 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-bold">Phone Number</span>
                {user.phoneNumber || user.displayPhone ? (
                  <div>
                    <span className="font-bold text-white block font-mono">
                      {user.displayPhone || user.phoneNumber}
                    </span>
                    <span className={`text-[10px] font-bold block mt-0.5 ${user.phoneVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {user.phoneVerified ? '✓ Verified' : 'Not Verified'}
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-gray-400 block">Not Added</span>
                )}
              </div>
              <motion.button
                onClick={() => setShowPhoneModal(true)}
                whileTap={{ rotate: 90, scale: 1.15 }}
                whileHover={{ rotate: 45, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-8 h-8 rounded-full bg-primary text-white font-black text-base flex items-center justify-center shadow-[0_0_12px_rgba(216,33,50,0.4)] shrink-0 cursor-pointer"
                title={user.phoneNumber || user.displayPhone ? 'Change Phone' : 'Add Phone'}
              >
                +
              </motion.button>
            </div>

            {/* GENDER (Requirements Section 1) */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-1 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-bold">Gender</span>
                <span className="font-bold text-white block">{user.gender || 'Not Added'}</span>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-primary hover:underline font-bold px-3 py-1.5 bg-primary/10 rounded-xl border border-primary/20 shrink-0"
              >
                {user.gender ? 'Edit Gender' : 'Add Gender'}
              </button>
            </div>

            {/* DATE OF BIRTH (Requirements Section 1) */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-1 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-bold">Date of Birth</span>
                <span className="font-bold text-white block">{user.dob || 'Not Added'}</span>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-primary hover:underline font-bold px-3 py-1.5 bg-primary/10 rounded-xl border border-primary/20 shrink-0"
              >
                {user.dob ? 'Edit DOB' : 'Add Date of Birth'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
