"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Ticket,
  ChevronRight,
  Edit3,
  Trash2,
  Camera,
  ShieldCheck,
  Phone,
  User,
  Calendar,
  X,
  HelpCircle,
} from 'lucide-react';
import { useAuth, formatIndianPhone, validateMinimumAge16 } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ImageCropModal } from '@/components/profile/ImageCropModal';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfileData, uploadProfilePicture, logout } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileForCrop, setSelectedFileForCrop] = useState<File | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Edit Modals
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const [showGenderModal, setShowGenderModal] = useState(false);
  const [genderInput, setGenderInput] = useState('Prefer not to say');

  const [showDobModal, setShowDobModal] = useState(false);
  const [dobInput, setDobInput] = useState('');

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileForCrop(file);
      setIsCropModalOpen(true);
    }
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    setIsCropModalOpen(false);
    setSelectedFileForCrop(null);
    setUploadingPhoto(true);

    try {
      const res = await uploadProfilePicture(croppedFile);

      if (res.success) {
        showToast('Profile photo updated successfully!');
      } else {
        setErrorMessage(res.error || 'Failed to upload photo.');
      }
    } catch {
      setErrorMessage('Could not update profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setLoading(true);
    try {
      await updateProfileData({ photoURL: null, avatar: null });
      showToast('Profile photo removed.');
    } catch {
      setErrorMessage('Could not remove photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      setErrorMessage('Name cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      await updateProfileData({ name: nameInput.trim(), displayName: nameInput.trim() });
      setShowNameModal(false);
      showToast('Name updated successfully!');
    } catch {
      setErrorMessage('Failed to update name.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGender = async () => {
    setLoading(true);
    try {
      await updateProfileData({ gender: genderInput });
      setShowGenderModal(false);
      showToast('Gender updated successfully!');
    } catch {
      setErrorMessage('Failed to update gender.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDob = async () => {
    if (dobInput && !validateMinimumAge16(dobInput)) {
      setErrorMessage('You must be at least 16 years old.');
      return;
    }
    setLoading(true);
    try {
      await updateProfileData({ dob: dobInput || null });
      setShowDobModal(false);
      showToast('Date of birth updated successfully!');
    } catch {
      setErrorMessage('Failed to update date of birth.');
    } finally {
      setLoading(false);
    }
  };

  const avatarUrl = user.photoURL || user.avatar;
  const userInitials = (user.name || 'T')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const formattedMemberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent Member';

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-6 bg-[#0a0a0c]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-24 right-6 z-50 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-2xl backdrop-blur-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-bold flex items-center justify-between shadow-lg">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-destructive hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* HERO HEADER CARD */}
        <div className="bg-[#12141a]/90 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar with Upload button */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden border-2 border-primary/50 shadow-xl bg-black/60 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl md:text-3xl font-black text-primary font-heading">
                    {userInitials}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 rounded-3xl flex flex-col items-center justify-center text-white text-[11px] font-bold transition-all"
              >
                <Camera className="w-5 h-5 mb-1" />
                <span>{uploadingPhoto ? 'Uploading...' : 'Change'}</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelected}
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                TicketX Member
              </p>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl md:text-3xl font-black font-heading text-white">
                  {user.name || 'TicketX Customer'}
                </h1>
                <button
                  type="button"
                  onClick={() => setShowNameModal(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1.5 font-mono text-xs justify-center sm:justify-start">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Mobile Verified</span>
                </span>
                <span className="text-gray-400 text-[11px]">
                  Member since {formattedMemberSince}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {avatarUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemovePhoto}
                className="rounded-xl border-white/10 text-gray-400 hover:text-white text-xs h-9 px-3"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Remove</span>
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
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* QUICK NAVIGATION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/my-bookings"
            className="bg-[#12141a]/90 border border-white/10 hover:border-primary/40 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white group-hover:text-amber-400 transition-colors text-sm">
                  My Bookings
                </p>
                <p className="text-[11px] text-gray-400">View active tickets and history</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/support/contact"
            className="bg-[#12141a]/90 border border-white/10 hover:border-primary/40 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white group-hover:text-emerald-400 transition-colors text-sm">
                  Help &amp; Support
                </p>
                <p className="text-[11px] text-gray-400">Instant answers and contact</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ACCOUNT INFORMATION CARD */}
        <div className="bg-[#12141a]/90 border border-white/10 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 pb-3">
            <h2 className="font-bold text-lg text-white font-heading">
              Account Information
            </h2>
            <p className="text-xs text-gray-400">
              Your verified mobile identity and profile details.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {/* ROW 1: VERIFIED MOBILE NUMBER (READ-ONLY) */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block font-mono">
                    Mobile Number
                  </span>
                  <span className="text-sm font-mono font-bold text-white truncate block">
                    {formatIndianPhone(user.phoneNumber || user.phone)}
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono flex items-center gap-1.5 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified</span>
              </span>
            </div>

            {/* ROW 2: FULL NAME */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 transition-all hover:border-white/15">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block font-mono">
                    Full Name
                  </span>
                  <span className="text-sm font-bold text-white truncate block">
                    {user.name || 'Not set'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNameModal(true)}
                className="text-xs text-primary hover:underline font-bold px-3.5 py-1.5 bg-primary/10 rounded-xl border border-primary/20 shrink-0 flex items-center gap-1 hover:bg-primary/20 transition-all font-mono"
              >
                <span>Edit</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* ROW 3: GENDER */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 transition-all hover:border-white/15">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block font-mono">
                    Gender
                  </span>
                  <span className="text-sm font-bold text-white truncate block">
                    {user.gender || 'Prefer not to say'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGenderModal(true)}
                className="text-xs text-primary hover:underline font-bold px-3.5 py-1.5 bg-primary/10 rounded-xl border border-primary/20 shrink-0 flex items-center gap-1 hover:bg-primary/20 transition-all font-mono"
              >
                <span>Edit</span>
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
                  <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block font-mono">
                    Date of Birth
                  </span>
                  <span className="text-sm font-bold text-white truncate block">
                    {user.dob ? new Date(user.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDobModal(true)}
                className="text-xs text-primary hover:underline font-bold px-3.5 py-1.5 bg-primary/10 rounded-xl border border-primary/20 shrink-0 flex items-center gap-1 hover:bg-primary/20 transition-all font-mono"
              >
                <span>{user.dob ? 'Edit' : 'Add'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT NAME MODAL */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161920] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Edit Name</h3>
              <button onClick={() => setShowNameModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowNameModal(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveName} disabled={loading} className="rounded-xl bg-primary">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT GENDER MODAL */}
      {showGenderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161920] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Select Gender</h3>
              <button onClick={() => setShowGenderModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <select
              value={genderInput}
              onChange={(e) => setGenderInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowGenderModal(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveGender} disabled={loading} className="rounded-xl bg-primary">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DOB MODAL */}
      {showDobModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161920] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Date of Birth</h3>
              <button onClick={() => setShowDobModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="date"
              value={dobInput}
              onChange={(e) => setDobInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowDobModal(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveDob} disabled={loading} className="rounded-xl bg-primary">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE PHOTO CROP MODAL */}
      {isCropModalOpen && selectedFileForCrop && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          imageFile={selectedFileForCrop}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setIsCropModalOpen(false);
            setSelectedFileForCrop(null);
          }}
        />
      )}

    </div>
  );
}
