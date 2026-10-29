import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  Search,
  Percent,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Download
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { exportInvoicesToCSV } from '../../utils/exportUtils';

export const BillingView: React.FC = () => {
  const { invoices, payments, payInvoice, setupPaymentPlan, activePatient, openPatientQuickView, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planMonths, setPlanMonths] = useState<number>(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const openInvoices = invoices.filter(inv => inv.balanceDue > 0);
  const totalOutstanding = openInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const filteredInvoices = invoices.filter(inv =>
    inv.id.toLowerCase().includes(search.toLowerCase()) ||
    inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
    inv.serviceDescription.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenPay = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowPayModal(true);
  };

  const handleOpenPlan = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPlanMonths(4);
    setShowPlanModal(true);
  };

  const handleProcessPlan = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    const success = await setupPaymentPlan(selectedInvoice.id, planMonths);
    setIsProcessing(false);
    if (success) {
      setShowPlanModal(false);
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Calm, Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Billing & Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {invoices.length} statements · Outstanding total: <strong className="text-slate-800">${totalOutstanding.toFixed(2)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportInvoicesToCSV(filteredInvoices)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer transition-colors shadow-xs"
            title="Download CSV export of statement ledger"
            aria-label="Export Statements to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 mr-1.5">{activePatient.name} Balance:</span>
            <span className="font-semibold text-slate-900">${activePatient.outstandingBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 3 Clean Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500">Unsettled Statements</span>
          <div className="text-2xl font-semibold text-slate-900 mt-1">
            {openInvoices.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            ${totalOutstanding.toFixed(2)} balance pending patient responsibility
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500">Installment Uptake</span>
          <div className="text-2xl font-semibold text-slate-900 mt-1">
            94.2%
          </div>
          <div className="text-[11px] text-teal-800 mt-0.5">
            Zero defaults on 4-month payment schedules
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500">Settled Transactions</span>
          <div className="text-2xl font-semibold text-slate-900 mt-1">
            {payments.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            PCI-DSS compliant merchant processing
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">
            Patient Statements ({filteredInvoices.length})
          </span>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search statement #, patient..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 text-xs border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium text-[11px]">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Service & Date</th>
                <th className="px-4 py-3 text-right">Billed / Paid</th>
                <th className="px-4 py-3 text-right">Balance Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5 font-semibold font-mono text-slate-900">
                    {inv.id}
                    <div className="text-[10px] text-slate-400 font-normal">Due: {inv.dueDate}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{inv.patientName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{inv.patientId}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-slate-800">{inv.serviceDescription}</div>
                    <div className="text-[10px] text-slate-400">{inv.serviceDate}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="font-medium text-slate-900">${inv.totalCharges.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-500">Paid: -${inv.insurancePaid.toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className={`font-semibold ${inv.balanceDue > 0 ? 'text-slate-900' : 'text-emerald-700'}`}>
                      ${inv.balanceDue.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {inv.balanceDue <= 0 ? (
                      <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        Settled
                      </span>
                    ) : inv.paymentPlan ? (
                      <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        Plan: ${inv.paymentPlan.monthlyAmount}/mo
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        Due
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openPatientQuickView(inv.patientId)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition-colors cursor-pointer"
                        title="Quick View patient records"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-700" />
                      </button>

                      {inv.balanceDue > 0 ? (
                        <>
                          <button
                            onClick={() => handleOpenPlan(inv)}
                            className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Plan
                          </button>
                          <button
                            onClick={() => handleOpenPay(inv)}
                            className="px-2.5 py-1 rounded bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors cursor-pointer"
                          >
                            Pay
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">Paid</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {currentInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No statements match your search.
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
                {Math.min(startIndex + itemsPerPage, filteredInvoices.length)}
              </span>{' '}
              of <span className="font-medium text-slate-800">{filteredInvoices.length}</span> statements
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

      {/* Authentic Payment Modal (Multi-Method: Card, HSA/FSA, ACH; Receipt Download & Firestore Sync) */}
      <PaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        invoice={selectedInvoice}
        onPaymentSuccess={() => {
          setShowPayModal(false);
        }}
      />

      {/* Payment Plan Modal */}
      {showPlanModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  0% Interest Installment Plan
                </h3>
                <p className="text-xs text-slate-500">
                  Invoice #{selectedInvoice.id} · Balance: ${selectedInvoice.balanceDue.toFixed(2)}
                </p>
              </div>
              <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Select Installment Term:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 4, 6].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPlanMonths(m)}
                    className={`p-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                      planMonths === m
                        ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-semibold">{m} Months</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ${(selectedInvoice.balanceDue / m).toFixed(2)}/mo
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Zero interest & no penalty:</span> Auto-debited on the 1st of each month.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPlan}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                {isProcessing ? 'Setting Up...' : `Activate ${planMonths}-Month Plan`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
