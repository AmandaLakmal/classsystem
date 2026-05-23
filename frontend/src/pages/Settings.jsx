import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Lock, Eye, EyeOff, Upload, CheckCircle, XCircle,
  Shield, User, Loader2, AlertCircle
} from 'lucide-react';

const API = 'http://localhost:8080/api/v1';

// ── Password strength calculator ──────────────────────────────────────────────
const calcStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: 'Too short', color: 'bg-rose-500' },
    { label: 'Weak',      color: 'bg-orange-500' },
    { label: 'Fair',      color: 'bg-amber-500' },
    { label: 'Good',      color: 'bg-blue-500' },
    { label: 'Strong',    color: 'bg-emerald-500' },
  ];
  return { score, ...map[score] };
};

// ── Toast notification ────────────────────────────────────────────────────────
const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error:   'bg-rose-500/10 border-rose-500/30 text-rose-400',
  };
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-xl animate-slide-in ${styles[type]}`}>
      <Icon size={18} className="shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">✕</button>
    </div>
  );
};

// ── Section card wrapper ───────────────────────────────────────────────────────
const Card = ({ icon: Icon, title, subtitle, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
        <Icon size={18} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ── Main Settings Page ────────────────────────────────────────────────────────
const Settings = () => {
  const token = localStorage.getItem('token');
  const fileInputRef = useRef(null);

  // Profile photo state
  const [currentPhoto, setCurrentPhoto]   = useState('');
  const [previewPhoto, setPreviewPhoto]   = useState('');
  const [selectedFile, setSelectedFile]   = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userInfo, setUserInfo]           = useState({ name: '', role: '', studentRegId: '' });

  // Password state
  const [oldPassword, setOldPassword]     = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPass, setConfirmPass]     = useState('');
  const [showOld, setShowOld]             = useState(false);
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [changingPw, setChangingPw]       = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => setToast({ type, message });

  // Load current user profile on mount
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserInfo({ name: data.name, role: data.role, studentRegId: data.studentRegId || '' });
          if (data.profilePhotoUrl) {
            setCurrentPhoto(`http://localhost:8080${data.profilePhotoUrl}`);
          }
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      }
    };
    if (token) fetchMe();
  }, [token]);

  const strength = calcStrength(newPassword);

  // ── File selection + preview ───────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Upload photo ──────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate progress with intervals before actual upload
      const progressInterval = setInterval(() => {
        setUploadProgress(p => p < 80 ? p + 10 : p);
      }, 100);

      const res = await fetch(`${API}/auth/upload-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      const data = await res.json();
      setCurrentPhoto(`http://localhost:8080${data.profilePhotoUrl}`);
      setPreviewPhoto('');
      setSelectedFile(null);
      // Update localStorage so topbar refreshes
      localStorage.setItem('profilePhotoUrl', `http://localhost:8080${data.profilePhotoUrl}`);
      showToast('success', 'Profile photo updated successfully!');
    } catch (err) {
      showToast('error', err.message || 'Photo upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPass) {
      showToast('error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters.');
      return;
    }
    setChangingPw(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      showToast('success', 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPass('');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setChangingPw(false);
    }
  };

  const displayPhoto = previewPhoto || currentPhoto;
  const initials = userInfo.name ? userInfo.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your profile and security preferences
        </p>
      </div>

      {/* ── Profile Photo Card ───────────────────────────────────────────── */}
      <Card icon={User} title="Profile Photo" subtitle="Your avatar is displayed across the portal">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">

          {/* Avatar display */}
          <div className="relative shrink-0">
            <div
              className="w-24 h-24 rounded-full ring-4 ring-white dark:ring-slate-900 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-800 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              {displayPhoto ? (
                <>
                  <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={22} className="text-white" />
                  </div>
                </>
              ) : (
                <>
                  <span className="text-white text-2xl font-bold">{initials}</span>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={22} className="text-white" />
                  </div>
                </>
              )}
            </div>
            {/* Upload progress ring */}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-28 h-28 -rotate-90 absolute" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="6"/>
                  <circle
                    cx="50" cy="50" r="46" fill="none"
                    stroke="#6366f1" strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - uploadProgress / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.1s ease' }}
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Upload area */}
          <div className="flex-1 w-full">
            <div
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload size={20} className="mx-auto mb-2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {selectedFile ? selectedFile.name : 'Click or drag & drop to upload'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">JPEG, PNG, or WebP — max 10MB</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-50 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-indigo-500/30"
              >
                {uploading
                  ? <><Loader2 size={16} className="animate-spin" /> Uploading…</>
                  : <><Upload size={16} /> Save Photo</>
                }
              </button>
            )}
          </div>
        </div>

        {/* User info pill */}
        <div className="mt-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{userInfo.name || 'Loading…'}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              {userInfo.studentRegId || userInfo.role}
            </p>
          </div>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">
            {userInfo.role}
          </span>
        </div>
      </Card>

      {/* ── Change Password Card ─────────────────────────────────────────── */}
      <Card icon={Shield} title="Change Password" subtitle="Use a strong password to keep your account secure">
        <form onSubmit={handleChangePassword} className="space-y-4">

          {/* Old Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
                placeholder="Enter current password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button type="button" onClick={() => setShowOld(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {/* Strength bar */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{strength.label}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                required
                placeholder="Confirm new password"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${
                  confirmPass && confirmPass !== newPassword
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                }`}
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {confirmPass && confirmPass !== newPassword && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle size={12} /> Passwords do not match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={changingPw || !oldPassword || !newPassword || newPassword !== confirmPass}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-50 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-indigo-500/30 mt-2"
          >
            {changingPw
              ? <><Loader2 size={16} className="animate-spin" /> Updating…</>
              : <><Shield size={16} /> Update Password</>
            }
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Settings;
