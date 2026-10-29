import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Claim, Invoice, SupportTicket } from '../../types';
import { exportClaimsToCSV, exportInvoicesToCSV } from '../../utils/exportUtils';
import {
  FileCheck2,
  AlertTriangle,
  Receipt,
  Download,
  Send,
  Sparkles,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  CheckSquare,
  Square,
  ArrowRight,
  Eye,
  CheckCircle2,
  Layers,
  ChevronRight
} from 'lucide-react';

export const WorkQueuesView: React.FC = () => {
  const {
    claims,
    invoices,
    supportTickets,
    submitAppeal,
    openPatientQuickView,
    addToast,
    currentUser
  } = useApp();

  const [activeQueue, setActiveQueue] = useState<'denials' | 'billing' | 'priorAuth'>('denials');
  const [selectedClaimIds, setSelectedClaimIds] = useState<string[]>([]);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [payerFilter, setPayerFilter] = useState('all');
  const [isBulkExecuting, setIsBulkExecuting] = useState(false);

  // Denial queue items
  const deniedClaims = useMemo(() => {
    return claims.filter(c => c.status === 'Denied' || c.status === 'Appealed');
  }, [claims]);

  // Aging receivables queue items
  const openInvoices = useMemo(() => {
    return invoices.filter(inv => inv.balanceDue > 0);
  }, [invoices]);

  // Prior auth queue items
  const authTickets = useMemo(() => {
    return supportTickets.filter(t => t.category === 'Insurance Appeal' || t.status === 'In Progress' || t.status === 'Escalated to Staff');
  }, [supportTickets]);

  // Filtered lists
  const filteredDeniedClaims = useMemo(() => {
    return deniedClaims.filter(c => {
      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPayer = payerFilter === 'all' || c.payerName.toLowerCase().includes(payerFilter.toLowerCase());
      return matchesSearch && matchesPayer;
    });
  }, [deniedClaims, searchQuery, payerFilter]);

  const filteredInvoices = useMemo(() => {
    return openInvoices.filter(i => {
      const matchesSearch =
        i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [openInvoices, searchQuery]);

  // Selection handlers
  const toggleSelectClaim = (id: string) => {
    setSelectedClaimIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllClaims = () => {
    if (selectedClaimIds.length === filteredDeniedClaims.length) {
      setSelectedClaimIds([]);
    } else {
      setSelectedClaimIds(filteredDeniedClaims.map(c => c.id));
    }
  };

  const toggleSelectInvoice = (id: string) => {
    setSelectedInvoiceIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllInvoices = () => {
    if (selectedInvoiceIds.length === filteredInvoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(filteredInvoices.map(i => i.id));
    }
  };

  // Bulk Appeal Execution
  const handleBulkAppealSubmit = async () => {
    if (selectedClaimIds.length === 0) return;
    setIsBulkExecuting(true);
    let successCount = 0;

    for (const claimId of selectedClaimIds) {
      const claim = claims.find(c => c.id === claimId);
      if (claim && claim.status === 'Denied') {
        const success = await submitAppeal(
          claimId,
          `Batch Level 1 Prior Auth Reconsideration submitted by ${currentUser.name} (${currentUser.role}). Clinical necessity documents attached.`
        );
        if (success) successCount++;
      }
    }

    setIsBulkExecuting(false);
    setSelectedClaimIds([]);
    addToast(
      'success',
      'Batch Appeals Dispatched',
      `Successfully generated and submitted ${successCount} Level 1 appeals to payers with audit logging.`
    );
  };

  // Bulk Payment Statements Reminder
  const handleBulkSendStatements = async () => {
    if (selectedInvoiceIds.length === 0) return;
    setIsBulkExecuting(true);
    try {
      await fetch('/api/actions/bulk-payment-reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({ invoiceIds: selectedInvoiceIds })
      });
      addToast(
        'success',
        'Bulk Statements Dispatched',
        `Dispatched digital payment notices and statement links for ${selectedInvoiceIds.length} accounts.`
      );
      setSelectedInvoiceIds([]);
    } catch (err) {
      addToast('error', 'Batch Operation Notice', 'Could not complete bulk reminders.');
    } finally {
      setIsBulkExecuting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" role="region" aria-label="Operational Work Queues">
      {/* Header and Queue Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Operational Work Queues
              </h1>
              <p className="text-sm text-slate-500">
                Batch processing, SLA tracking, and audit-logged operations for healthcare business users
              </p>
            </div>
          </div>
        </div>

        {/* Queue Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start md:self-auto text-xs font-semibold">
          <button
            onClick={() => { setActiveQueue('denials'); setSearchQuery(''); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeQueue === 'denials'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-selected={activeQueue === 'denials'}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Denial Appeals</span>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs">
              {deniedClaims.filter(c => c.status === 'Denied').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveQueue('billing'); setSearchQuery(''); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeQueue === 'billing'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-selected={activeQueue === 'billing'}
          >
            <Receipt className="w-4 h-4 text-amber-600" />
            <span>Aging Receivables</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs">
              {openInvoices.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveQueue('priorAuth'); setSearchQuery(''); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeQueue === 'priorAuth'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-selected={activeQueue === 'priorAuth'}
          >
            <FileCheck2 className="w-4 h-4 text-teal-600" />
            <span>Prior Auth Triage</span>
            <span className="px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs">
              {authTickets.length}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter queue by patient, claim ID, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              aria-label="Search within active queue"
            />
          </div>

          {activeQueue === 'denials' && (
            <select
              value={payerFilter}
              onChange={(e) => setPayerFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
              aria-label="Filter by health insurance payer"
            >
              <option value="all">All Payers</option>
              <option value="BlueCross">BlueCross BlueShield</option>
              <option value="Aetna">Aetna</option>
              <option value="United">UnitedHealthcare</option>
              <option value="Medicare">Medicare</option>
            </select>
          )}
        </div>

        {/* Global Export Button */}
        <div className="flex items-center gap-2">
          {activeQueue === 'denials' && (
            <button
              onClick={() => exportClaimsToCSV(filteredDeniedClaims)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
              title="Export current filtered queue to CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Queue CSV</span>
            </button>
          )}

          {activeQueue === 'billing' && (
            <button
              onClick={() => exportInvoicesToCSV(filteredInvoices)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
              title="Export aging ledger to CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Ledger CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* QUEUE 1: DENIAL APPEALS WORK QUEUE */}
      {activeQueue === 'denials' && (
        <div className="space-y-4">
          {/* Sticky Bulk Action Banner */}
          {selectedClaimIds.length > 0 && (
            <div className="p-4 rounded-2xl bg-teal-900 text-white shadow-lg flex items-center justify-between gap-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" />
                <div>
                  <div className="text-sm font-bold">
                    {selectedClaimIds.length} Claim{selectedClaimIds.length > 1 ? 's' : ''} Selected in Batch
                  </div>
                  <div className="text-xs text-teal-200">
                    Execute bulk Level 1 appeal submissions or export selected records.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const selected = claims.filter(c => selectedClaimIds.includes(c.id));
                    exportClaimsToCSV(selected);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export ({selectedClaimIds.length})</span>
                </button>

                <button
                  onClick={handleBulkAppealSubmit}
                  disabled={isBulkExecuting}
                  className="px-4 py-1.5 rounded-lg bg-white text-teal-900 hover:bg-teal-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <span>{isBulkExecuting ? 'Submitting Batch...' : `Submit ${selectedClaimIds.length} Level 1 Appeals`}</span>
                </button>
              </div>
            </div>
          )}

          {/* Denial Table */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" role="table">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-12 text-center">
                      <button
                        onClick={toggleSelectAllClaims}
                        className="text-slate-500 hover:text-slate-800 cursor-pointer"
                        aria-label="Select all claims"
                      >
                        {selectedClaimIds.length === filteredDeniedClaims.length && filteredDeniedClaims.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-teal-700" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3">Claim & Patient</th>
                    <th className="px-4 py-3">Service & Codes</th>
                    <th className="px-4 py-3">Payer & Billed</th>
                    <th className="px-4 py-3">Denial Reason</th>
                    <th className="px-4 py-3">SLA / Timely Filing</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredDeniedClaims.map((claim, idx) => {
                    const isSelected = selectedClaimIds.includes(claim.id);
                    const daysLeft = (idx % 3 === 0) ? 4 : (idx % 2 === 0) ? 9 : 14;

                    return (
                      <tr
                        key={claim.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isSelected ? 'bg-teal-50/40' : ''
                        }`}
                      >
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleSelectClaim(claim.id)}
                            className="text-slate-500 hover:text-slate-800 cursor-pointer"
                            aria-label={`Select claim ${claim.id}`}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-teal-700" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 font-mono text-xs">{claim.id}</div>
                          <div className="font-medium text-slate-800 text-sm mt-0.5">{claim.patientName}</div>
                          <div className="text-xs text-slate-400 font-mono">DOS: {claim.serviceDate}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800 line-clamp-1 max-w-xs">{claim.serviceDescription}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            CPT: {(claim.procedureCodes || claim.cptCodes || ['75561']).join(', ')}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{claim.payerName}</div>
                          <div className="font-semibold text-sm text-slate-800 mt-0.5 font-mono">
                            ${(claim.submittedAmount || claim.totalBilledAmount || 0).toFixed(2)}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            {claim.denialCategory || 'Prior Auth Required'}
                          </span>
                          <div className="text-xs text-slate-500 line-clamp-1 max-w-xs mt-1" title={claim.denialReason}>
                            {claim.denialReason || 'Missing authorization documentation'}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            daysLeft <= 5
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{daysLeft} days to deadline</span>
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openPatientQuickView(claim.patientId)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                              title="Inspect patient clinical vitals"
                              aria-label={`View clinical stats for ${claim.patientName}`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {claim.status === 'Denied' ? (
                              <button
                                onClick={async () => {
                                  await submitAppeal(claim.id, 'Level 1 Appeal for Reconsideration generated from Denial Work Queue.');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Appeal</span>
                              </button>
                            ) : (
                              <span className="text-xs font-medium text-slate-500 px-2.5 py-1 rounded bg-slate-100">
                                Appealed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QUEUE 2: AGING RECEIVABLES & BILLING QUEUE */}
      {activeQueue === 'billing' && (
        <div className="space-y-4">
          {/* Sticky Bulk Action Banner */}
          {selectedInvoiceIds.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-900 text-white shadow-lg flex items-center justify-between gap-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-amber-300 shrink-0" />
                <div>
                  <div className="text-sm font-bold">
                    {selectedInvoiceIds.length} Accounts Selected
                  </div>
                  <div className="text-xs text-amber-200">
                    Dispatch statement notices or export to billing reporting format.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const selected = invoices.filter(i => selectedInvoiceIds.includes(i.id));
                    exportInvoicesToCSV(selected);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export ({selectedInvoiceIds.length})</span>
                </button>

                <button
                  onClick={handleBulkSendStatements}
                  disabled={isBulkExecuting}
                  className="px-4 py-1.5 rounded-lg bg-white text-amber-900 hover:bg-amber-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isBulkExecuting ? 'Sending Notices...' : `Send ${selectedInvoiceIds.length} Statements`}</span>
                </button>
              </div>
            </div>
          )}

          {/* Aging Receivables Table */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" role="table">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-12 text-center">
                      <button
                        onClick={toggleSelectAllInvoices}
                        className="text-slate-500 hover:text-slate-800 cursor-pointer"
                        aria-label="Select all invoices"
                      >
                        {selectedInvoiceIds.length === filteredInvoices.length && filteredInvoices.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-amber-700" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3">Invoice & Account</th>
                    <th className="px-4 py-3">Encounter Details</th>
                    <th className="px-4 py-3">Aging Bracket</th>
                    <th className="px-4 py-3 text-right">Balance Due</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredInvoices.map((inv) => {
                    const isSelected = selectedInvoiceIds.includes(inv.id);

                    return (
                      <tr
                        key={inv.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isSelected ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleSelectInvoice(inv.id)}
                            className="text-slate-500 hover:text-slate-800 cursor-pointer"
                            aria-label={`Select invoice ${inv.id}`}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-700" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 font-mono text-xs">{inv.id}</div>
                          <div className="font-medium text-slate-800 text-sm mt-0.5">{inv.patientName}</div>
                          <div className="text-xs text-slate-400">Due: {inv.dueDate}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800 line-clamp-1">{inv.serviceDescription}</div>
                          <div className="text-xs text-slate-400">Total Billed: ${inv.totalCharges.toFixed(2)}</div>
                        </td>

                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            inv.agingCategory === '90+ Days'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : inv.agingCategory === '60-90 Days'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {inv.agingCategory || '30-60 Days'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="font-bold text-base text-slate-900 font-mono">
                            ${inv.balanceDue.toFixed(2)}
                          </div>
                          {inv.insurancePaid > 0 && (
                            <div className="text-xs text-emerald-600">Ins Paid: ${inv.insurancePaid.toFixed(2)}</div>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {inv.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openPatientQuickView(inv.patientId)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                          >
                            Open Account
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QUEUE 3: PRIOR AUTHORIZATION & ESCALATION TRIAGE */}
      {activeQueue === 'priorAuth' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {authTickets.map(ticket => (
              <div
                key={ticket.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{ticket.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      ticket.priority === 'High' || ticket.priority === 'Urgent'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ticket.priority} Priority
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {ticket.subject}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {ticket.reasonForEscalation}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Assigned: <strong className="text-slate-700">{ticket.assignedStaff || 'Unassigned'}</strong></span>
                  <button
                    onClick={() => openPatientQuickView(ticket.patientId)}
                    className="flex items-center gap-1 text-teal-700 font-semibold hover:underline cursor-pointer"
                  >
                    <span>View Case</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
