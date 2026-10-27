import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SupportTicket } from '../../types';
import {
  Headphones,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  User,
  MessageSquare,
  ShieldCheck,
  Send,
  X
} from 'lucide-react';

export const EscalationsView: React.FC = () => {
  const { supportTickets, activePatient, createEscalation, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('Patient Financial & Revenue Services');
  const [priority, setPriority] = useState('High');
  const [reason, setReason] = useState('');

  const filteredTickets = supportTickets.filter(t =>
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.patientName.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    const success = await createEscalation(
      subject || `Specialist Request: ${activePatient.name}`,
      department,
      reason || 'Transferred from patient portal.',
      priority
    );
    if (success) {
      setShowCreateModal(false);
      setSubject('');
      setReason('');
    }
  };

  const getPriorityBadge = (p: SupportTicket['priority']) => {
    switch (p) {
      case 'Urgent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">Urgent</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Calm Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Staff Escalations & Triage
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {supportTickets.filter(t => t.status !== 'Resolved').length} pending escalations requiring clinical or billing specialist review
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>New Escalation</span>
        </button>
      </div>

      {/* Tickets List & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket #, patient, subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
              />
            </div>
            <span className="text-xs text-slate-400 font-semibold">{filteredTickets.length} Escalations</span>
          </div>

          <div className="space-y-3">
            {filteredTickets.map(t => {
              const isSelected = selectedTicket?.id === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-teal-50/50 dark:bg-teal-950/40 border-teal-500 ring-1 ring-teal-400 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">{t.id}</span>
                      {getPriorityBadge(t.priority)}
                      <span className="text-[11px] font-semibold text-slate-500">{t.department}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{t.subject}</h3>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Patient: <strong>{t.patientName}</strong> • Assigned: <strong>{t.assignedStaff || 'Unassigned'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      t.status === 'Escalated to Staff'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : t.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Ticket Inspector */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            Escalation Case Details
          </h2>

          {selectedTicket ? (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedTicket.id}</span>
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{selectedTicket.subject}</h3>
                <div className="text-[11px] text-slate-400 mt-0.5">{selectedTicket.createdAt}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Handoff Trigger Reason</div>
                <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {selectedTicket.reasonForEscalation}
                </div>
              </div>

              {selectedTicket.conversationSnippet && (
                <div className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] border border-slate-800">
                  <div className="text-[10px] text-teal-400 font-bold uppercase mb-1">Preserved Conversation Context:</div>
                  <div>{selectedTicket.conversationSnippet}</div>
                </div>
              )}

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Assigned Specialist:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedTicket.assignedStaff}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Department:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedTicket.department}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select a ticket to review staff assignment, conversation trace, and priority.
            </div>
          )}
        </div>
      </div>

      {/* Create Escalation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Dispatch Human Escalation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: {activePatient.name} ({activePatient.id})
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject / Issue Summary:
              </label>
              <input
                type="text"
                placeholder="e.g. Complex claim dispute, clinical nurse triage"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Department:
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Patient Financial & Revenue Services">Patient Financial Services</option>
                  <option value="Claims & Prior Authorization">Claims & Prior Auth</option>
                  <option value="Clinical Nursing Triage">Clinical Nursing Triage</option>
                  <option value="Specialty Scheduling">Specialty Scheduling</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Priority Level:
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Urgent">Urgent (Immediate)</option>
                  <option value="High">High (&lt; 5 mins)</option>
                  <option value="Medium">Medium (&lt; 30 mins)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Escalation / Specific Request:
              </label>
              <textarea
                rows={3}
                placeholder="Describe reason for handoff..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch to Staff</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
