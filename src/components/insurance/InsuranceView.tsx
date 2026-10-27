import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  DollarSign,
  FileCheck2,
  Calendar,
  Lock,
  Sparkles
} from 'lucide-react';

export const InsuranceView: React.FC = () => {
  const { insurancePolicies, activePatient, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const policy = insurancePolicies.find(p => p.patientId === activePatient.id) || insurancePolicies[0];

  const handleVerifyEDI = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      addToast('success', 'EDI 270/271 Response Received', `Policy ${policy.memberId} is ACTIVE with ${policy.payerName}. Real-time copays verified.`);
    }, 1000);
  };

  const deductiblePct = Math.round((policy.deductible.individualMet / policy.deductible.individualTotal) * 100);
  const oopPct = Math.round((policy.outOfPocketMax.individualMet / policy.outOfPocketMax.individualTotal) * 100);

  return (
    <div className="space-y-6">
      {/* Calm Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Insurance & Benefit Eligibility
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time coverage verification for {activePatient.name} ({policy.memberId})
          </p>
        </div>

        <button
          onClick={handleVerifyEDI}
          disabled={isVerifying}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
          <span>{isVerifying ? 'Querying Payer...' : 'Verify Eligibility'}</span>
        </button>
      </div>

      {/* Main Active Policy Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold text-lg border border-teal-200 dark:border-teal-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{policy.payerName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {policy.policyStatus.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Plan: <strong>{policy.coverageType}</strong> • Member: {policy.patientName} • Effective through {policy.expirationDate}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Member ID</div>
              <div className="font-mono font-bold">{policy.memberId}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Group #</div>
              <div className="font-mono font-bold">{policy.groupNumber}</div>
            </div>
          </div>
        </div>

        {/* Deductibles & Out-of-Pocket Accumulator Meters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>Individual Annual Deductible</span>
              <span className="text-teal-600 dark:text-teal-400 font-mono">${policy.deductible.individualMet} / ${policy.deductible.individualTotal}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div className="bg-teal-500 h-2.5 rounded-full transition-all" style={{ width: `${deductiblePct}%` }}></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>{deductiblePct}% Met</span>
              <span>${policy.deductible.individualTotal - policy.deductible.individualMet} remaining</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>Out-of-Pocket Maximum</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">${policy.outOfPocketMax.individualMet} / ${policy.outOfPocketMax.individualTotal}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${oopPct}%` }}></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>{oopPct}% Met</span>
              <span>${policy.outOfPocketMax.individualTotal - policy.outOfPocketMax.individualMet} remaining to cap</span>
            </div>
          </div>
        </div>

        {/* Real-time Copay Schedule */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            In-Network Point-of-Care Copay Schedule
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Primary Care Visit</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">${policy.copay.primaryCare}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Fixed Copay</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Specialist Visit</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">${policy.copay.specialist}</div>
              <div className="text-[10px] text-teal-600 mt-0.5">Cardiology/Derma</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Urgent Care</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">${policy.copay.urgentCare}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Walk-in Clinics</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Emergency Room</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">${policy.copay.emergencyRoom}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Waived if admitted</div>
            </div>
          </div>
        </div>

        {/* Prior Authorization Rules */}
        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs">
          <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Payer Prior Authorization Mandates under {policy.payerName}:</span>
          </div>
          <ul className="list-disc list-inside text-[11px] text-amber-800 dark:text-amber-300 mt-1.5 space-y-1">
            <li>Advanced Diagnostic Imaging (Cardiac MRI CPT 75561, CT Angiography) requires 72-hour pre-service authorization.</li>
            <li>Outpatient Surgical Procedures require Gold-Carding or clinical chart note submission.</li>
            <li>Specialty Infusions & Biologics require step-therapy attestation.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
