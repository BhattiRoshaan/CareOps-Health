import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Building2,
  Stethoscope,
  KeyRound,
  Bell,
  LogOut,
  CheckCircle2,
  Save,
  Laptop,
  Smartphone,
  AlertCircle,
  FileCheck2,
  Mic,
  Sliders,
  Receipt,
  Cpu
} from 'lucide-react';
import { UserRole } from '../../types';

interface AccountSettingsViewProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  isModal = false,
  onClose
}) => {
  const {
    currentUser,
    updateUserProfile,
    logout,
    addToast,
    setActivePage
  } = useApp();

  // Form states initialized with current user
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '(555) 234-5678');
  const [title, setTitle] = useState(currentUser.title || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [npiNumber, setNpiNumber] = useState(currentUser.npiNumber || '1982736450');
  const [memberId, setMemberId] = useState(currentUser.memberId || 'BCB-99823412');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');

  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(currentUser.twoFactorEnabled ?? true);

  // Notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState(
    currentUser.notificationPreferences || {
      emailAlerts: true,
      smsAlerts: true,
      clinicalEscalations: true,
      claimStatusUpdates: true,
      voiceSummaries: true
    }
  );

  // Active tab inside settings
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'rbac'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Preset medical avatars
  const avatarPresets = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('error', 'Name Required', 'Please provide a valid display name.');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        title: title.trim() || undefined,
        department: department.trim() || undefined,
        npiNumber: npiNumber.trim() || undefined,
        memberId: memberId.trim() || undefined,
        avatar: avatar || undefined,
        twoFactorEnabled,
        notificationPreferences
      });
      setIsSaving(false);
      if (isModal && onClose) {
        onClose();
      }
    }, 600);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast('error', 'Current Password Required', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      addToast('error', 'Password Too Short', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('error', 'Mismatch', 'New passwords do not match.');
      return;
    }

    addToast('success', 'Password Updated', 'Your security password has been changed successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'patient': return <User className="w-4 h-4 text-blue-600" />;
      case 'provider': return <Stethoscope className="w-4 h-4 text-emerald-600" />;
      case 'billing': return <Receipt className="w-4 h-4 text-purple-600" />;
      case 'claims': return <FileCheck2 className="w-4 h-4 text-amber-600" />;
      case 'admin': return <Sliders className="w-4 h-4 text-slate-600" />;
      case 'ops_manager': return <Cpu className="w-4 h-4 text-teal-600" />;
    }
  };

  const content = (
    <div className={`space-y-6 ${isModal ? 'p-6 max-h-[85vh] overflow-y-auto' : ''}`}>
      {/* Top Banner Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-slate-800">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative">
            <img
              src={avatar || currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                {currentUser.role.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentUser.id}
              </span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">{currentUser.name}</h1>
            <p className="text-xs text-slate-500">
              {currentUser.title || 'Clinical Operator'} · {currentUser.email}
            </p>
          </div>
        </div>

        {/* Header Actions: Save / Log Out */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-rose-700 text-xs font-medium transition-colors cursor-pointer"
            title="Log Out of CareOps"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Log Out</span>
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Logout Confirmation Prompt */}
      {showLogoutConfirm && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs text-rose-900">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold">Are you sure you want to log out?</div>
              <div className="text-rose-700 text-[11px]">Your HIPAA session token will be invalidated and you will return to the sign-in screen.</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="px-3 py-1.5 rounded-xl border border-rose-300 text-xs font-semibold text-rose-800 hover:bg-rose-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Confirm Log Out
            </button>
          </div>
        </div>
      )}

      {/* Settings Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'security'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security & 2FA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Alerts & Notifications</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'rbac'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RBAC Clearance & Audit</span>
        </button>
      </div>

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Personal Information & Clinical Profile</h2>
              <p className="text-xs text-slate-500">Update your contact information, specialty credentials, and profile image</p>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Choose Profile Avatar
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {avatarPresets.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(imgUrl)}
                    className={`relative rounded-xl overflow-hidden p-0.5 border-2 transition-transform cursor-pointer ${
                      avatar === imgUrl ? 'border-teal-600 scale-105 shadow-md' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={imgUrl} alt={`Avatar ${idx + 1}`} className="w-11 h-11 object-cover rounded-lg" />
                    {avatar === imgUrl && (
                      <div className="absolute inset-0 bg-teal-600/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-teal-700 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work / Healthcare Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (SMS Escalations)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Professional Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chief of Cardiology"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              {currentUser.role === 'provider' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    National Provider Identifier (NPI)
                  </label>
                  <input
                    type="text"
                    value={npiNumber}
                    onChange={(e) => setNpiNumber(e.target.value)}
                    placeholder="10-digit NPI"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 font-mono"
                  />
                </div>
              ) : currentUser.role === 'patient' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Insurance Member ID
                  </label>
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="e.g. BCB-99823412"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department / Division
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Patient Financial Services"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Active Clinical Role (RBAC)
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                  {getRoleIcon(currentUser.role)}
                  <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
                  <span className="ml-auto text-[10px] text-slate-500 font-normal">Managed via RBAC</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Last updated: {currentUser.lastLogin || 'Today'}
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB CONTENT: SECURITY & 2FA */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Two-Factor Authentication Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-slate-500">Enforce secondary SMS or Authenticator verification for HIPAA PHI compliance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !twoFactorEnabled;
                  setTwoFactorEnabled(nextVal);
                  updateUserProfile({ twoFactorEnabled: nextVal });
                  addToast('info', '2FA Setting Updated', nextVal ? 'Two-Factor Authentication is now ACTIVE.' : '2FA has been disabled.');
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  twoFactorEnabled ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <span>Primary Verification Device: <strong>{phone}</strong></span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Verified
              </span>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Change Security Password</h3>
                <p className="text-xs text-slate-500">Passwords must contain at least 6 characters with mixed alphanumeric characters</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Active Clinical Sessions */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Authorized Sessions</h3>
                <p className="text-xs text-slate-500">Manage signed-in devices with active TLS 1.3 encryption</p>
              </div>
              <button
                type="button"
                onClick={() => addToast('success', 'Sessions Terminated', 'All other active device tokens have been revoked.')}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                Revoke Other Sessions
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-teal-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Current Web Workstation (Chrome / macOS)</div>
                    <div className="text-[11px] text-slate-500">IP: 192.168.1.104 • San Francisco, CA • Active Now</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                  This Device
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Clinical Alerts & Notifications</h2>
            <p className="text-xs text-slate-500">Configure how and when CareOps dispatches automated updates</p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                key: 'clinicalEscalations',
                title: 'Urgent Clinical Escalations & Triage',
                desc: 'Receive immediate SMS and in-app alerts when a patient triggers red-flag medical criteria',
                icon: AlertCircle,
                badge: 'High Priority'
              },
              {
                key: 'claimStatusUpdates',
                title: 'Claim Denial & Prior Auth Updates (EDI 835)',
                desc: 'Get notified when an insurance payer issues a denial or requests prior authorization records',
                icon: FileCheck2
              },
              {
                key: 'voiceSummaries',
                title: 'Voice AI Studio Audio Transcripts',
                desc: 'Email automated SOAP notes and conversation transcripts after patient voice interactions',
                icon: Mic
              },
              {
                key: 'emailAlerts',
                title: 'Daily Digest & Operations Summary',
                desc: 'Receive morning schedule briefing and financial summary at 08:00 AM',
                icon: Mail
              },
              {
                key: 'smsAlerts',
                title: 'SMS Appointment Reminders & Confirmations',
                desc: 'Receive text confirmations for rescheduled slots and patient check-ins',
                icon: Phone
              }
            ].map((item) => {
              const Icon = item.icon;
              const isChecked = notificationPreferences[item.key as keyof typeof notificationPreferences];

              return (
                <div
                  key={item.key}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-teal-700 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{item.title}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nextPrefs = {
                        ...notificationPreferences,
                        [item.key]: !isChecked
                      };
                      setNotificationPreferences(nextPrefs);
                      updateUserProfile({ notificationPreferences: nextPrefs });
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isChecked ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isChecked ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: RBAC CLEARANCE */}
      {activeTab === 'rbac' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) & HIPAA Audit</h2>
            <p className="text-xs text-slate-500">Security permissions granted to your active session</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-800">Granted Privileges</div>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Access Clinical Patient Directory (FHIR R4)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Schedule & Reschedule Provider Appointments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Execute EDI 837 / 835 Claims Intelligence</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Interact with Voice AI Clinical Studio</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>View HIPAA Compliance Audit Trails</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-800">HIPAA Safeguards & Encryption</div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Data at Rest:</span>
                  <span className="font-mono font-bold text-slate-800">AES-256-GCM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Data in Transit:</span>
                  <span className="font-mono font-bold text-slate-800">TLS 1.3 Strict</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session Expiry:</span>
                  <span className="font-bold text-slate-800">30 Minutes Idle</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Audit Logging:</span>
                  <span className="text-emerald-700 font-bold">Enabled (Immutable)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
        <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
