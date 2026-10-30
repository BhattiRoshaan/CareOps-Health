import React, { useState } from 'react';
import { ShieldCheck, PhoneCall, X } from 'lucide-react';

export const ClinicalSafetyBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-slate-50/90 border-b border-slate-200/75 px-4 py-1.5 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <p className="text-slate-600 text-xs sm:text-xs">
            <span className="font-medium text-slate-800">Administrative & Operations Scope:</span> CareOps coordinates scheduling, claims, and billing workflows. For medical emergencies, call 911 immediately.
          </p>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
          title="Dismiss notice"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
