import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Calendar,
  CreditCard,
  FileCheck2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Clock,
  Eye,
  Users,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    activePatient,
    setActivePage,
    patients,
    openPatientQuickView,
    claims,
    appointments,
    invoices,
    aiMetrics,
    addToast
  } = useApp();

  const deniedClaims = claims.filter(c => c.status === 'Denied');
  const todayAppointments = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Scheduled');
  const openInvoices = invoices.filter(i => i.balanceDue > 0);

  // Curated, compact workflows (3 essential ones instead of an overwhelming 6-card block)
  const quickWorkflows = [
    {
      id: 'sc-1',
      title: 'MRI Denial Appeal (CPT 75561)',
      desc: 'Review missing prior authorization & draft Level 1 appeal.',
      targetPage: 'chat',
      prompt: 'Why was my Cardiac MRI claim CLM-10492 denied by BlueCross?'
    },
    {
      id: 'sc-2',
      title: 'Reschedule Cardiology Visit',
      desc: 'Check Dr. Marcus Chen slot availability and confirm slot.',
      targetPage: 'voice',
      prompt: 'I need to reschedule my cardiology appointment with Dr. Chen.'
    },
    {
      id: 'sc-3',
      title: 'Patient Payment Plan Options',
      desc: 'Decompose balance and setup 4-month installment schedule.',
      targetPage: 'chat',
      prompt: 'Why is my medical bill $420 and can I pay in installments?'
    }
  ];

  const handleLaunchScenario = (sc: typeof quickWorkflows[0]) => {
    addToast('info', 'Workflow Loaded', sc.title);
    if (sc.prompt) {
      sessionStorage.setItem('careops_pending_prompt', sc.prompt);
    }
    setActivePage(sc.targetPage as any);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Calm, Airy Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">
            Welcome back, <span className="font-semibold text-slate-800">{currentUser.name}</span> · {currentUser.role.replace('_', ' ')}
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Operations Overview
          </h1>
        </div>

        {/* Active Patient Pill with 1-Click Quick View */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openPatientQuickView(activePatient)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100/80 text-teal-900 border border-teal-200 text-xs font-medium transition-colors cursor-pointer"
            title="Inspect vitals, recent encounters, and active claims for active patient"
          >
            <Activity className="w-3.5 h-3.5 text-teal-700" />
            <span>Active: <strong>{activePatient.name}</strong></span>
            <span className="text-[10px] text-teal-700 font-mono">({activePatient.id})</span>
          </button>

          <button
            onClick={() => setActivePage('chat')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 4 Clean, Calm Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-500">Automation Rate</span>
          <div className="text-2xl font-semibold text-slate-800 mt-1">
            {aiMetrics?.automationRate ?? 85.4}%
          </div>
          <div className="text-[11px] text-teal-800 mt-0.5">
            {(aiMetrics?.conversationsHandled ?? 4328).toLocaleString()} inquiries resolved
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-500">Denied Claims</span>
          <div className="text-2xl font-semibold text-slate-800 mt-1">
            {deniedClaims.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {aiMetrics.claimsAppealedAI} automated appeals
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-500">Scheduled Visits</span>
          <div className="text-2xl font-semibold text-slate-800 mt-1">
            {todayAppointments.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {aiMetrics.appointmentsBookedAI} confirmed via scheduler
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-500">Open Statements</span>
          <div className="text-2xl font-semibold text-slate-800 mt-1">
            {openInvoices.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Pending patient responsibility
          </div>
        </div>
      </div>

      {/* Patient Quick Access Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-800" />
            <h2 className="text-sm font-semibold text-slate-900">Recent Patients</h2>
            <span className="text-xs text-slate-400">· Click any patient for vitals and claims preview</span>
          </div>
          <button
            onClick={() => setActivePage('patients')}
            className="text-xs font-medium text-teal-800 hover:underline flex items-center gap-1"
          >
            All Patients ({patients.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {patients.slice(0, 5).map(p => {
            const isSelected = p.id === activePatient.id;
            return (
              <button
                key={p.id}
                onClick={() => openPatientQuickView(p)}
                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-50/60 border-teal-300'
                    : 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-200'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {p.id} · {p.gender}
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-teal-800 font-medium flex items-center gap-1">
                  <Eye className="w-3 h-3 text-teal-700" />
                  <span>Quick View</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Uncrowded Layout: Action Items & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Denied Claims Requiring Review */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-rose-50 text-rose-700">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">
                Claims Requiring Action
              </h2>
            </div>
            <button
              onClick={() => setActivePage('claims')}
              className="text-xs font-medium text-teal-800 hover:underline"
            >
              View all ({claims.length})
            </button>
          </div>

          <div className="space-y-2">
            {deniedClaims.slice(0, 2).map(claim => (
              <div
                key={claim.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">{claim.id}</span>
                    <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded font-medium">
                      {claim.denialCategory}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 truncate mt-0.5">
                    {claim.patientName} · {claim.serviceDescription}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openPatientQuickView(claim.patientId)}
                    className="px-2 py-1 rounded border border-slate-200 hover:bg-white text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    title="Quick view patient vitals and claims"
                  >
                    Quick View
                  </button>
                  <button
                    onClick={() => setActivePage('claims')}
                    className="px-2.5 py-1 rounded bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Appeal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Consultations */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-slate-100 text-slate-700">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">
                Upcoming Appointments
              </h2>
            </div>
            <button
              onClick={() => setActivePage('appointments')}
              className="text-xs font-medium text-teal-800 hover:underline"
            >
              Full Schedule
            </button>
          </div>

          <div className="space-y-2">
            {todayAppointments.slice(0, 2).map(appt => (
              <div
                key={appt.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {appt.patientName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {appt.time} · with {appt.providerName} · {appt.department}
                  </div>
                </div>

                <button
                  onClick={() => openPatientQuickView(appt.patientId)}
                  className="px-2.5 py-1 rounded border border-slate-200 hover:bg-white text-slate-700 text-xs font-medium shrink-0 transition-colors cursor-pointer"
                >
                  Quick View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compact Quick Workflows (Streamlined 3-card tray) */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/70 shadow-xs">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Quick Workflows
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickWorkflows.map(sc => (
            <button
              key={sc.id}
              onClick={() => handleLaunchScenario(sc)}
              className="p-3 rounded-lg border border-slate-200/90 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50 text-left transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xs font-semibold text-slate-800">
                  {sc.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  {sc.desc}
                </p>
              </div>
              <div className="mt-2 text-[11px] text-teal-800 font-medium">
                Run workflow →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
