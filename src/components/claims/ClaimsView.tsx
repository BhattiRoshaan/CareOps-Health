import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Claim } from '../../types';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  Send,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Download
} from 'lucide-react';
import { exportClaimsToCSV } from '../../utils/exportUtils';

export const ClaimsView: React.FC = () => {
  const { claims, submitAppeal, openPatientQuickView, addToast, searchQuery } = useApp();

  const [search, setSearch] = useState(searchQuery || '');

  React.useEffect(() => {
    if (searchQuery !== undefined) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealLetterDraft, setAppealLetterDraft] = useState('');
  const [priorAuthInput, setPriorAuthInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredClaims = claims.filter(c => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.patientName.toLowerCase().includes(search.toLowerCase()) ||
      c.payerName.toLowerCase().includes(search.toLowerCase()) ||
      c.serviceDescription.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClaims = filteredClaims.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenAppealModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setPriorAuthInput(claim.priorAuthNumber || `PA-2026-${Math.floor(10000 + Math.random() * 90000)}`);
    const billed = claim.submittedAmount || claim.totalBilledAmount || 0;
    const codes = (claim.procedureCodes && claim.procedureCodes.length > 0) ? claim.procedureCodes : (claim.cptCodes || ['99214']);

    setAppealLetterDraft(
      claim.appealLetter ||
`APPEAL FOR RECONSIDERATION & RETROACTIVE PRIOR AUTHORIZATION

Date: ${new Date().toLocaleDateString()}
To: ${claim.payerName} — Medical Review & Appeals Dept
Re: Expedited Level 1 Appeal for Claim #${claim.id}
Patient: ${claim.patientName}
Date of Service: ${claim.serviceDate}
Procedure Codes: ${codes.join(', ')} (${claim.serviceDescription})
Billed Amount: $${billed.toFixed(2)}

To Whom It May Concern,

We are submitting this Level 1 Appeal regarding the denial of Claim #${claim.id} for reason: "${claim.denialReason || 'Prior authorization not on file'}".

Clinical Justification:
The ordering physician, Dr. Marcus Chen, MD (NPI 1982736450), determined this diagnostic imaging was medically necessary due to persistent symptoms. Complete clinical encounter notes and pre-procedure imaging orders are attached.

We respectfully request reconsideration and expedited reprocessing of this claim at the contracted in-network rate.

Sincerely,
Healthcare Operations & Appeals Division
CareOps Automated System`
    );
    setShowAppealModal(true);
  };

  const handleSendAppeal = async () => {
    if (!selectedClaim) return;
    setIsSubmitting(true);
    const success = await submitAppeal(selectedClaim.id, appealLetterDraft, priorAuthInput);
    setIsSubmitting(false);
    if (success) {
      setShowAppealModal(false);
    }
  };

  const getStatusBadge = (status: Claim['status']) => {
    switch (status) {
      case 'Approved':
        return <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Approved</span>;
      case 'Denied':
        return <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Denied</span>;
      case 'Appealed':
        return <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Appealed</span>;
      default:
        return <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{status}</span>;
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Calm, Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Claims & Denials
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {claims.length} total claims · {claims.filter(c => c.status === 'Denied').length} denials pending review
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportClaimsToCSV(filteredClaims)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-xs"
            title="Download CSV export of claims"
            aria-label="Export Claims to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              const denied = claims.find(c => c.status === 'Denied');
              if (denied) handleOpenAppealModal(denied);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Appeal Next Denied Claim</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search claim #, patient, payer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 text-xs border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'Denied', 'Approved', 'Appealed'].map(st => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-teal-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Table */}
      <div className="rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Claim ID</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Payer</th>
                <th className="px-4 py-3 text-right">Billed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentClaims.map(claim => (
                <tr key={claim.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-semibold font-mono text-slate-900">
                    {claim.id}
                    <div className="text-xs text-slate-400 font-normal">{claim.serviceDate}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{claim.patientName}</div>
                    <div className="text-xs text-slate-400 font-mono">{claim.patientId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="truncate max-w-[200px] text-slate-800">{claim.serviceDescription}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      {(claim.procedureCodes || claim.cptCodes || ['99214']).join(', ')}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {claim.payerName}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    ${(claim.submittedAmount || claim.totalBilledAmount || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(claim.status)}
                    {claim.denialCategory && (
                      <div className="text-xs text-rose-700 mt-0.5 truncate max-w-[140px]">
                        {claim.denialCategory}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openPatientQuickView(claim.patientId)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition-colors cursor-pointer"
                        title="Quick View patient clinical stats"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {claim.status === 'Denied' ? (
                        <button
                          onClick={() => handleOpenAppealModal(claim)}
                          className="px-2.5 py-1 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors cursor-pointer"
                        >
                          Appeal
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {currentClaims.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No claims match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 bg-white">
            <div>
              Showing <span className="font-medium text-slate-800">{startIndex + 1}</span> to{' '}
              <span className="font-medium text-slate-800">
                {Math.min(startIndex + itemsPerPage, filteredClaims.length)}
              </span>{' '}
              of <span className="font-medium text-slate-800">{filteredClaims.length}</span> claims
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Appeal Generator Modal */}
      {showAppealModal && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Level 1 Appeal Draft
                </h3>
                <p className="text-xs text-slate-500">
                  Claim #{selectedClaim.id} · {selectedClaim.patientName} ({selectedClaim.payerName})
                </p>
              </div>
              <button
                onClick={() => setShowAppealModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-100 text-xs text-rose-800">
              <div className="font-semibold flex items-center gap-1.5 mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Payer Denial Reason: {selectedClaim.denialReason}</span>
              </div>
              <p className="text-xs text-slate-600">
                CareOps pre-filled clinical encounter notes and medical necessity justification based on active ICD-10 diagnosis.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Prior Authorization / Reference #:
              </label>
              <input
                type="text"
                value={priorAuthInput}
                onChange={(e) => setPriorAuthInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Appeal Letter:
              </label>
              <textarea
                rows={9}
                value={appealLetterDraft}
                onChange={(e) => setAppealLetterDraft(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-50 font-mono text-xs leading-relaxed border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAppealModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendAppeal}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Appeal to Payer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
