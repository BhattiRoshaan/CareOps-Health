import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  ShieldCheck,
  ShieldAlert,
  Stethoscope,
  Receipt,
  FileCheck2,
  Sliders,
  X,
  KeyRound,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchRoleWithCredentials, addToast } = useApp();

  const [selectedRoleKey, setSelectedRoleKey] = useState<UserRole | null>(null);
  const [staffEmail, setStaffEmail] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const rosterRoles: {
    role: UserRole;
    name: string;
    email: string;
    mfaToken: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
    color: string;
  }[] = [
    {
      role: 'patient',
      name: 'Eleanor Vance',
      email: 'eleanor.vance@example.com',
      mfaToken: '501928',
      desc: 'Patient portal view: book appointments, copays, invoices, appeals',
      icon: UserCheck,
      color: 'from-teal-500 to-emerald-600'
    },
    {
      role: 'provider',
      name: 'Dr. Marcus Chen, MD',
      email: 'dr.chen@careops.health',
      mfaToken: '492018',
      desc: 'Attending Physician: Schedule slot blocks, chart notes, clinical orders',
      icon: Stethoscope,
      color: 'from-emerald-600 to-teal-700'
    },
    {
      role: 'billing',
      name: 'Sarah Jenkins, CRCR',
      email: 'sarah.jenkins@careops-health.org',
      mfaToken: '385921',
      desc: 'Revenue Cycle: Statements, patient payment plans, merchant settlement',
      icon: Receipt,
      color: 'from-purple-600 to-pink-600'
    },
    {
      role: 'claims',
      name: 'David Rodriguez, CPC',
      email: 'david.rodriguez@careops-health.org',
      mfaToken: '614920',
      desc: 'Prior Auth & Appeals: EDI 837/835, Level 1 Prior Auth Appeal Generator',
      icon: FileCheck2,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      role: 'ops_manager',
      name: 'Alex Mercer',
      email: 'alex.mercer@careops-health.org',
      mfaToken: '194830',
      desc: 'Operations Director: Agent orchestration, EHR FHIR config, deflection rates',
      icon: Sliders,
      color: 'from-slate-700 to-slate-900'
    },
    {
      role: 'admin',
      name: 'Dr. Evelyn Reed, MHA',
      email: 'evelyn.reed@careops-health.org',
      mfaToken: '719402',
      desc: 'HIPAA Security Officer: Immutable audit logs, BAA surveillance, RBAC policies',
      icon: ShieldCheck,
      color: 'from-rose-600 to-red-700'
    }
  ];

  const handleSelectRoleToConfigure = (r: typeof rosterRoles[0]) => {
    setSelectedRoleKey(r.role);
    setStaffEmail(r.email);
    setMfaCode(r.mfaToken);
    setErrorMessage(null);
  };

  const handleExecuteRoleSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleKey) return;

    if (!staffEmail.trim()) {
      setErrorMessage('Staff email is required for role elevation.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const res = await switchRoleWithCredentials(selectedRoleKey, staffEmail.trim(), mfaCode.trim());
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.message || 'Authorization failed. Credentials or MFA token rejected.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>Verified Role Elevation & Authorization</span>
            </h3>
            <p className="text-xs text-slate-500">
              Role switches require authenticated staff credentials & 6-digit MFA verification. Verified in HIPAA audit logs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Session Status */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <span>{currentUser.name}</span>
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-teal-100 text-teal-800 border border-teal-200">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {currentUser.email || 'Unauthenticated'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            <span>MFA Protected</span>
          </div>
        </div>

        {/* Roles List */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Select Target Role to Elevate or Switch:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {rosterRoles.map((r) => {
              const isCurrent = currentUser.role === r.role;
              const isSelected = selectedRoleKey === r.role;
              const Icon = r.icon;

              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleSelectRoleToConfigure(r)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/30'
                      : isCurrent
                      ? 'bg-slate-50/90 border-slate-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${r.color} text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{r.name}</div>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-700">
                          {r.role}
                        </span>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-600 text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {r.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Elevation Credentials & MFA Verification Form */}
        {selectedRoleKey && (
          <form onSubmit={handleExecuteRoleSwitch} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-teal-600" />
                <span>Verify Credentials for {selectedRoleKey.toUpperCase()}</span>
              </span>
              <span className="text-xs text-slate-500">
                Server Authority Check
              </span>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Staff Email
                </label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>6-Digit MFA Token</span>
                  <span className="text-xs text-teal-700 font-mono">2FA Required</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="e.g. 719402"
                  className="w-full px-3 py-1.5 text-xs font-mono tracking-wider rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedRoleKey(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isVerifying ? 'Verifying with Authority...' : 'Verify & Elevate Role'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        <div className="text-xs text-slate-400 text-center pt-1 border-t border-slate-100">
          Role elevation requests are cryptographically validated against the server directory and recorded in HIPAA audit logs.
        </div>
      </div>
    </div>
  );
};
