import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  UserCheck,
  Shield,
  Stethoscope,
  Receipt,
  FileCheck2,
  Sliders,
  X
} from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, addToast } = useApp();

  if (!isOpen) return null;

  const roles: { role: UserRole; name: string; email: string; desc: string; icon: any; color: string }[] = [
    {
      role: 'patient',
      name: 'Eleanor Vance',
      email: 'eleanor.vance@example.com',
      desc: 'Patient portal view: book appointments, check copays, pay bills, appeal denials',
      icon: UserCheck,
      color: 'from-teal-500 to-emerald-600'
    },
    {
      role: 'claims',
      name: 'Sarah Lin, CPC',
      email: 'sarah.lin@careops.health',
      desc: 'Revenue & Claims: EDI 837/835, Prior Authorization, AI Level 1 Appeal generator',
      icon: FileCheck2,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      role: 'billing',
      name: 'David Miller',
      email: 'david.m@careops.health',
      desc: 'Patient Financial Services: Statements, 0% interest payment plans, merchant settling',
      icon: Receipt,
      color: 'from-purple-600 to-pink-600'
    },
    {
      role: 'provider',
      name: 'Dr. Marcus Chen, MD',
      email: 'dr.chen@careops.health',
      desc: 'Cardiology Attending: Schedule slot blocks, clinical chart notes, NPI attestation',
      icon: Stethoscope,
      color: 'from-emerald-600 to-teal-700'
    },
    {
      role: 'ops_manager',
      name: 'Alexander Ross',
      email: 'alex.ross@careops.health',
      desc: 'Operations Director: Executive ROI, deflection rate, micro-agent prompt tuning, EHR FHIR config',
      icon: Sliders,
      color: 'from-slate-700 to-slate-900'
    },
    {
      role: 'admin',
      name: 'Compliance Officer Davis',
      email: 'admin.compliance@careops.health',
      desc: 'HIPAA Security Officer: Immutable audit logs, PHI access surveillance, BAA settings',
      icon: Shield,
      color: 'from-rose-600 to-red-700'
    }
  ];

  const handleSelectRole = (r: typeof roles[0]) => {
    setCurrentUser({
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: r.name,
      email: r.email,
      role: r.role,
      patientId: r.role === 'patient' ? 'PAT-1001' : undefined
    });
    addToast('info', 'Active Persona Switched', `Now operating as ${r.name} (${r.role.toUpperCase()}).`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              <span>Switch Healthcare Role (RBAC Simulation)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Experience CareOps AI through the perspective of patients, billing teams, physicians, or compliance officers.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {roles.map(r => {
            const isCurrent = currentUser.role === r.role;
            const Icon = r.icon;

            return (
              <div
                key={r.role}
                onClick={() => handleSelectRole(r)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 ring-1 ring-teal-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{r.name}</h4>
                      <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {r.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {r.desc}
                    </p>
                  </div>
                </div>

                {isCurrent ? (
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-teal-600 text-white shrink-0">
                    Active
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-teal-600 hover:underline shrink-0">
                    Switch →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
