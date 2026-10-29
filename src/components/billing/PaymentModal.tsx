import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Printer,
  Download,
  Building,
  Lock,
  ArrowRight
} from 'lucide-react';

interface PaymentModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const { payInvoice, activePatient, addToast } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'HSA/FSA' | 'ACH Bank Transfer'>('Credit Card');
  const [payAmount, setPayAmount] = useState<number>(invoice.balanceDue);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4082');
  const [cardholderName, setCardholderName] = useState(activePatient.name);
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('883');
  const [billingZip, setBillingZip] = useState('94107');

  // ACH fields
  const [routingNumber, setRoutingNumber] = useState('121000358');
  const [accountNumber, setAccountNumber] = useState('•••••••7192');

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    setIsProcessing(true);

    try {
      const success = await payInvoice(invoice.id, payAmount, paymentMethod);
      if (success) {
        setCompletedReceipt({
          receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
          invoiceId: invoice.id,
          patientName: invoice.patientName,
          amountPaid: payAmount,
          remainingBalance: Math.max(0, invoice.balanceDue - payAmount),
          authCode: `AUTH-TX-${Math.floor(100000 + Math.random() * 900000)}`,
          timestamp: new Date().toLocaleString(),
          paymentMethod,
          last4: paymentMethod === 'Credit Card' ? cardNumber.slice(-4) : '7192'
        });
        if (onPaymentSuccess) onPaymentSuccess();
      }
    } catch (err) {
      addToast('error', 'Payment Processing Failed', 'The payment transaction could not be processed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h2 id="payment-modal-title" className="text-base font-bold text-slate-900">
                {completedReceipt ? 'Payment Receipt & Settlement' : 'Settle Invoice Balance'}
              </h2>
              <p className="text-xs text-slate-500">
                Invoice #{invoice.id} · {invoice.serviceDescription}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close payment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700">
          {completedReceipt ? (
            /* COMPLETED RECEIPT VIEW */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900 text-sm">
                    Payment Successfully Authorized & Settled
                  </div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    Transaction logged in Firestore immutable HIPAA ledger with real-time balance update.
                  </div>
                </div>
              </div>

              {/* Printable Receipt Paper */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-300">
                  <div className="font-bold text-slate-900 text-sm font-sans">CareOps Medical Network</div>
                  <div className="text-slate-500 font-sans">Official Receipt</div>
                </div>

                <div className="space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Receipt Number:</span>
                    <strong className="text-slate-900">{completedReceipt.receiptNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Authorization Code:</span>
                    <strong className="text-slate-900">{completedReceipt.authCode}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Date & Time:</span>
                    <span>{completedReceipt.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Patient Name:</span>
                    <span className="font-sans font-medium text-slate-900">{completedReceipt.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span>{completedReceipt.paymentMethod} (ending in {completedReceipt.last4})</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-dashed border-slate-300 flex justify-between text-sm font-bold text-slate-900 font-sans">
                  <span>Amount Paid:</span>
                  <span className="text-emerald-700 font-mono">${completedReceipt.amountPaid.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-xs text-slate-500 font-sans">
                  <span>Remaining Invoice Balance:</span>
                  <span>${completedReceipt.remainingBalance.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* PAYMENT FORM */
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* Payment Summary Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Outstanding Statement Balance
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">
                    ${invoice.balanceDue.toFixed(2)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Payer Covered</div>
                  <div className="text-sm font-semibold text-emerald-600 font-mono">
                    -${invoice.insurancePaid.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Amount ($ USD):
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={invoice.balanceDue}
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Credit Card', 'HSA/FSA', 'ACH Bank Transfer'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === method
                          ? 'bg-teal-50 border-teal-600 text-teal-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      aria-pressed={paymentMethod === method}
                    >
                      {method === 'Credit Card' && <CreditCard className="w-4 h-4" />}
                      {method === 'HSA/FSA' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                      {method === 'ACH Bank Transfer' && <Building className="w-4 h-4" />}
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card / Account Inputs */}
              {paymentMethod !== 'ACH Bank Transfer' ? (
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        ZIP
                      </label>
                      <input
                        type="text"
                        value={billingZip}
                        onChange={(e) => setBillingZip(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium text-slate-900"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Routing Number (ABA)
                    </label>
                    <input
                      type="text"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Checking Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium text-slate-900"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit TLS encrypted transaction · PCI-DSS Level 1 compliant</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isProcessing || payAmount <= 0}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  <span>{isProcessing ? 'Authorizing & Settling...' : `Authorize Payment of $${payAmount.toFixed(2)}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
