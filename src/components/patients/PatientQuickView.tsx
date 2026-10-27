import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, Claim, Appointment } from '../../types';
import { getPatientVitals, getPatientEncounters } from '../../data/patientClinicalData';
import {
  X,
  Heart,
  Activity,
  Thermometer,
  Wind,
  ShieldCheck,
  Calendar,
  FileCheck2,
  Stethoscope,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  Clock,
  DollarSign,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  TrendingUp,
  User,
  ArrowRight,
  ExternalLink,
  Layers
} from 'lucide-react';

interface PatientQuickViewProps {
  patient?: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient?: (p: Patient) => void;
}

export const PatientQuickView: React.FC<PatientQuickViewProps> = ({
  patient: propPatient,
  isOpen,
  onClose,
  onSelectPatient
}) => {
  const {
    activePatient,
    setActivePatientId,
    patients,
    claims,
    appointments,
    invoices,
    setActivePage,
    addToast
  } = useApp();

  // If propPatient is provided, use it; otherwise fallback to activePatient
  const currentPatient = propPatient || activePatient;
  const [selectedPatientId, setSelectedPatientId] = useState<string>(currentPatient.id);
  const [activeTab, setActiveTab] = useState<'vitals' | 'encounters' | 'claims' | 'summary'>('vitals');

  // Sync internal selected patient when prop changes
  useEffect(() => {
    if (propPatient) {
      setSelectedPatientId(propPatient.id);
    } else if (activePatient) {
      setSelectedPatientId(activePatient.id);
    }
  }, [propPatient, activePatient]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Resolve current active patient record
  const patient = patients.find(p => p.id === selectedPatientId) || currentPatient;
  const isGlobalActive = patient.id === activePatient.id;

  // Retrieve clinical data
  const vitals = getPatientVitals(patient.id);
  const encounters = getPatientEncounters(
    patient.id,
    patient.name,
    patient.assignedProviderName || 'Dr. Robert Martinez, MD',
    'Primary Care Network',
    patient.conditions || []
  );

  // Retrieve patient claims & appointments from global state
  const patientClaims = claims.filter(c => c.patientId === patient.id);
  const deniedClaims = patientClaims.filter(c => c.status === 'Denied');
  const patientAppointments = appointments.filter(a => a.patientId === patient.id);
  const patientInvoices = invoices.filter(i => i.patientId === patient.id);

  // Calculate age from DOB
  const calculateAge = (dobString?: string) => {
    if (!dobString) return '42';
    try {
      const birth = new Date(dobString);
      const diffMs = Date.now() - birth.getTime();
      const ageDt = new Date(diffMs);
      return Math.abs(ageDt.getUTCFullYear() - 1970);
    } catch {
      return '42';
    }
  };

  const handleSetGlobalActive = () => {
    setActivePatientId(patient.id);
    if (onSelectPatient) {
      onSelectPatient(patient);
    }
    addToast('success', 'Active Context Updated', `${patient.name} (${patient.id}) is now the global operational context.`);
  };

  const handleLaunchChatWithContext = () => {
    setActivePatientId(patient.id);
    onClose();
    sessionStorage.setItem(
      'careops_pending_prompt',
      `Review clinical records, active claims, and recent encounters for ${patient.name} (${patient.id}).`
    );
    setActivePage('chat');
  };

  const handleLaunchVoiceWithContext = () => {
    setActivePatientId(patient.id);
    onClose();
    setActivePage('voice');
  };

  const handleAppealClaim = (claimId: string) => {
    setActivePatientId(patient.id);
    onClose();
    sessionStorage.setItem('careops_pending_prompt', `Draft an expedited Level 1 appeal for denied claim ${claimId}.`);
    setActivePage('chat');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
      aria-labelledby="patient-quick-view-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Drawer Container */}
      <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Top Header Card */}
        <div className="p-5 border-b border-slate-200 bg-white text-slate-900 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 font-semibold text-base flex items-center justify-center shrink-0 border border-slate-200">
                {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 id="patient-quick-view-title" className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                    {patient.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    {patient.id}
                  </span>
                  {isGlobalActive ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-teal-700" />
                      Active Context
                    </span>
                  ) : (
                    <button
                      onClick={handleSetGlobalActive}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      Set as Active
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span>DOB: {patient.dateOfBirth || patient.dob} ({calculateAge(patient.dateOfBirth || patient.dob)} y/o · {patient.gender})</span>
                  <span>·</span>
                  <span>Provider: {patient.assignedProviderName || 'Dr. Robert Martinez, MD'}</span>
                </div>

                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                    {patient.insuranceName}
                  </span>
                  <span>Member ID: <strong className="font-mono text-slate-800">{patient.memberId}</strong></span>
                  {patient.outstandingBalance > 0 && (
                    <span className="text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">
                      Balance: ${patient.outstandingBalance.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Switch Patient & Close */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:block">
                <select
                  value={patient.id}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
                  title="Switch Quick View Patient"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close Quick View (Esc)"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 text-xs font-medium overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'vitals'
                  ? 'bg-teal-800 text-white font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Vital Stats</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                activeTab === 'vitals' ? 'bg-teal-900 text-teal-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {vitals.bloodPressure.status}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('encounters')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'encounters'
                  ? 'bg-teal-800 text-white font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Recent Encounters</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                activeTab === 'encounters' ? 'bg-teal-900 text-teal-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {encounters.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('claims')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'claims'
                  ? 'bg-teal-800 text-white font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Active Claims</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                activeTab === 'claims' ? 'bg-teal-900 text-teal-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {patientClaims.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-teal-800 text-white font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Clinical Profile</span>
            </button>
          </div>
        </div>

        {/* Drawer Body Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/60">
          {/* TAB 1: VITAL STATS & BIOMETRICS */}
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              {/* Attribution and Timestamp Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Last Encounter Vitals: <strong>{vitals.lastRecordedAt}</strong></span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  By {vitals.recordedBy}
                </span>
              </div>

              {/* Core Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* Blood Pressure */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Blood Pressure
                    </span>
                    <Heart className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}
                    <span className="text-xs font-normal text-slate-500 ml-1">mmHg</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      vitals.bloodPressure.status === 'Normal'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : vitals.bloodPressure.status === 'Elevated'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {vitals.bloodPressure.status}
                    </span>
                    <span className="text-[10px] text-slate-400">Target &lt;120/80</span>
                  </div>
                </div>

                {/* Heart Rate */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Heart Rate
                    </span>
                    <Activity className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {vitals.heartRate.bpm}
                    <span className="text-xs font-normal text-slate-500 ml-1">bpm</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {vitals.heartRate.status}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[80px]" title={vitals.heartRate.rhythm}>
                      {vitals.heartRate.rhythm || 'Sinus'}
                    </span>
                  </div>
                </div>

                {/* SpO2 Saturation */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Oxygen Saturation
                    </span>
                    <Wind className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {vitals.spO2.percentage}%
                    <span className="text-xs font-normal text-slate-500 ml-1">SpO2</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Normal
                    </span>
                    <span className="text-[10px] text-slate-400">{vitals.spO2.delivery || 'Room Air'}</span>
                  </div>
                </div>

                {/* Body Temp */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Temperature
                    </span>
                    <Thermometer className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {vitals.temperature.fahrenheit}°F
                    <span className="text-xs font-normal text-slate-500 ml-1">({vitals.temperature.celsius}°C)</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Afebrile
                    </span>
                    <span className="text-[10px] text-slate-400">Oral probe</span>
                  </div>
                </div>

                {/* Respiratory Rate */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Respiration
                    </span>
                    <Wind className="w-4 h-4 text-teal-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {vitals.respiratoryRate.breathsPerMin}
                    <span className="text-xs font-normal text-slate-500 ml-1">breaths/m</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Unlabored
                    </span>
                    <span className="text-[10px] text-slate-400">12-20 ref</span>
                  </div>
                </div>

                {/* Body Mass Index (BMI) & Weight */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Weight & BMI
                    </span>
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {vitals.bmi.value}
                    <span className="text-xs font-normal text-slate-500 ml-1">BMI</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200">
                      {vitals.bmi.category}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {vitals.bmi.weightLbs} lbs ({vitals.bmi.heightFt})
                    </span>
                  </div>
                </div>

                {/* Fasting Blood Glucose */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Blood Glucose
                    </span>
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {vitals.bloodGlucose?.value ?? 96}
                    <span className="text-xs font-normal text-slate-500 ml-1">mg/dL</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold text-slate-600">
                      HbA1c: {vitals.bloodGlucose?.hba1c ?? 5.4}%
                    </span>
                    <span className="text-[10px] text-slate-400">Fasting</span>
                  </div>
                </div>

                {/* Pain Score */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Pain Score
                    </span>
                    <AlertCircle className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {vitals.painScale?.score ?? 0}
                    <span className="text-xs font-normal text-slate-500 ml-1">/ 10</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate" title={vitals.painScale?.location || 'No active acute pain'}>
                    {vitals.painScale?.location || 'No active pain'}
                  </div>
                </div>
              </div>

              {/* Historical Vitals Trend Table */}
              {vitals.historicalReadings && vitals.historicalReadings.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-600" />
                      Longitudinal Vitals Trajectory (Past Encounters)
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">EHR Synced</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Blood Pressure</th>
                          <th className="pb-2">Heart Rate</th>
                          <th className="pb-2">SpO2</th>
                          <th className="pb-2">Temp</th>
                          <th className="pb-2">Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {vitals.historicalReadings.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/70">
                            <td className="py-2 text-slate-900 font-semibold">{r.date}</td>
                            <td className="py-2 font-mono">{r.bp} mmHg</td>
                            <td className="py-2">{r.hr} bpm</td>
                            <td className="py-2">{r.spO2}%</td>
                            <td className="py-2">{r.temp}°F</td>
                            <td className="py-2">{r.weightLbs} lbs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Critical Clinical Alerts: Conditions & Allergies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Allergies & Adverse Drug Sensitivities</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {patient.allergies.map((allergy, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] font-bold bg-white text-rose-700 border border-rose-300 shadow-2xs">
                        ⚠️ {allergy}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>Active Chronic Conditions</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {patient.conditions.map((condition, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white text-teal-800 border border-teal-300 shadow-2xs">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RECENT ENCOUNTERS */}
          {activeTab === 'encounters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Clinical Encounters & Longitudinal History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recorded inpatient visits, outpatient evaluations, and upcoming consultations.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {encounters.length} Visits Logged
                </span>
              </div>

              <div className="space-y-3">
                {encounters.map(enc => (
                  <div
                    key={enc.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 hover:border-teal-300 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          enc.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {enc.status}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{enc.type}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{enc.date} • {enc.time}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>Provider: <strong className="text-slate-800">{enc.providerName}</strong> ({enc.providerSpecialty})</span>
                      <span className="text-slate-400">•</span>
                      <span>{enc.department}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                      <div className="text-slate-700 font-semibold">
                        Chief Complaint: <span className="font-normal text-slate-800">{enc.chiefComplaint}</span>
                      </div>
                      <div className="text-slate-600 leading-relaxed text-[11px]">
                        <strong>Clinical Assessment & Summary:</strong> {enc.clinicalSummary}
                      </div>
                      {enc.vitalsSummary && (
                        <div className="text-[11px] font-mono text-teal-700 pt-0.5">
                          Recorded Vitals: {enc.vitalsSummary}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">ICD-10:</span>
                        {enc.diagnoses.map((diag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            {diag}
                          </span>
                        ))}
                      </div>

                      {enc.treatmentPlan && (
                        <span className="text-[11px] text-slate-500 italic max-w-xs truncate" title={enc.treatmentPlan}>
                          Plan: {enc.treatmentPlan}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Patient's Upcoming Calendar Bookings */}
              {patientAppointments.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Scheduled Appointments in Patient Calendar ({patientAppointments.length})
                  </h4>

                  <div className="space-y-2">
                    {patientAppointments.map(appt => (
                      <div key={appt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{appt.type} with {appt.providerName}</div>
                          <div className="text-[11px] text-slate-500">{appt.date} at {appt.time} • {appt.department}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">Reason: {appt.reasonForVisit}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACTIVE CLAIMS & PRIOR AUTHORIZATIONS */}
          {activeTab === 'claims' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Insurance Claims & Prior Authorization Status
                  </h3>
                  <p className="text-xs text-slate-500">
                    EDI 837 claim submissions and 835 remittance status with AI appeal suggestions.
                  </p>
                </div>
                {deniedClaims.length > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {deniedClaims.length} Action Needed
                  </span>
                )}
              </div>

              {patientClaims.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                  <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium">No active or denied claims found for {patient.name}.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientClaims.map(claim => (
                    <div
                      key={claim.id}
                      className={`p-4 rounded-2xl border shadow-2xs space-y-3 transition-all ${
                        claim.status === 'Denied'
                          ? 'bg-rose-50/40 border-rose-200'
                          : claim.status === 'Approved'
                          ? 'bg-white border-slate-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Claim Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-slate-900">{claim.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            claim.status === 'Denied'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : claim.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {claim.status}
                          </span>
                          {claim.denialCategory && (
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              {claim.denialCategory}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 font-mono">
                          DOS: <strong>{claim.serviceDate}</strong> • Payer: {claim.payerName}
                        </div>
                      </div>

                      {/* Service Details */}
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {claim.serviceDescription}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-2">
                          <span>CPT: <strong>{(claim.procedureCodes || claim.cptCodes || []).join(', ')}</strong></span>
                          <span>•</span>
                          <span>Billing Provider: {claim.providerName} ({claim.department})</span>
                        </div>
                      </div>

                      {/* Financial Amounts breakdown */}
                      <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Submitted</div>
                          <div className="text-xs font-bold text-slate-800">${(claim.submittedAmount || claim.totalBilledAmount || 0).toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Allowed</div>
                          <div className="text-xs font-bold text-slate-800">${(claim.allowedAmount || 0).toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Payer Paid</div>
                          <div className="text-xs font-bold text-emerald-600">${(claim.paidAmount || 0).toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Patient Resp</div>
                          <div className="text-xs font-bold text-amber-600">${(claim.patientResponsibility || 0).toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Denial Reason & AI Appeal CTA */}
                      {claim.status === 'Denied' && (
                        <div className="p-3 rounded-xl bg-white border border-rose-200 text-xs space-y-2">
                          <div className="text-rose-800 leading-snug">
                            <strong>Payer Denial Remark:</strong> {claim.denialReason}
                          </div>
                          {claim.recommendedAction && (
                            <div className="text-slate-600 text-[11px]">
                              <strong>Recommended Resolution:</strong> {claim.recommendedAction}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-[11px] text-slate-500">
                              Appeal Status: <strong className="text-slate-800">{claim.appealStatus || 'Drafted'}</strong>
                            </span>
                            <button
                              onClick={() => handleAppealClaim(claim.id)}
                              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Execute AI Appeal</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CLINICAL PROFILE & COVERAGE */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {/* Insurance & Policy Specs */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Insurance Verification & Benefits
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    270/271 Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Payer Details</div>
                    <div className="font-bold text-slate-900">{patient.insuranceName}</div>
                    <div className="text-slate-600">Member ID: <span className="font-mono font-semibold">{patient.memberId}</span></div>
                    <div className="text-slate-600">Group #: <span className="font-mono">{patient.groupNumber}</span></div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Financial Account</div>
                    <div className="font-bold text-slate-900">
                      Balance Due: <span className={patient.outstandingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                        ${patient.outstandingBalance.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-slate-600">Primary Clinic: Main Medical Tower</div>
                    <div className="text-slate-600">
                      Emergency Contact: {typeof patient.emergencyContact === 'string'
                        ? patient.emergencyContact
                        : `${patient.emergencyContact?.name} (${patient.emergencyContact?.relationship || 'Family'}) • ${patient.emergencyContact?.phone || ''}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Contact Info Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 text-xs">
                <h3 className="font-bold text-slate-900">Demographics & Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  <div className="sm:col-span-2 text-slate-500">
                    Address: {patient.address}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {!isGlobalActive && (
              <button
                onClick={handleSetGlobalActive}
                className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-850 text-xs font-medium border border-teal-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>Set as Active Context</span>
              </button>
            )}
            <button
              onClick={handleLaunchChatWithContext}
              className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Review in AI Assistant</span>
            </button>
            <button
              onClick={handleLaunchVoiceWithContext}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span>Voice Studio</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
