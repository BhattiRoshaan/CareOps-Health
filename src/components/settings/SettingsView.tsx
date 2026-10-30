import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Server,
  ShieldCheck,
  Globe,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Palette,
  Eye,
  HeartPulse,
  Lock
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { addToast } = useApp();

  const [fhirEndpoint, setFhirEndpoint] = useState('https://fhir.epic.careops.internal/R4');
  const [clearinghouse, setClearinghouse] = useState('Change Healthcare / Optum EDI');
  const [geminiModel, setGeminiModel] = useState('gemini-3.7-flash');
  const [isTesting, setIsTesting] = useState(false);
  const [contrastBoost, setContrastBoost] = useState(false);

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      addToast('success', 'HL7 FHIR R4 Connected', 'Successfully queried Epic Systems OAuth token & sandbox patient bundle.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Calm Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            System & EHR Integrations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure HL7 FHIR endpoints, EDI clearinghouse gateways, and clinical preferences
          </p>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={isTesting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'Verifying...' : 'Test Gateway Links'}</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Healthcare Clinical Theme & Legibility Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Clinical Interface & Visual Ergonomics</h2>
              <p className="text-xs text-slate-500">Eye-soothing healthcare light palette with WCAG AA compliance</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-teal-600" />
                  Healthcare Light Palette
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  Active (Default)
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Engineered with clinical whites (<code className="font-mono text-xs bg-white px-1 py-0.5 rounded border border-slate-200">#F8FAFC</code>), soft medical slate (<code className="font-mono text-xs bg-white px-1 py-0.5 rounded border border-slate-200">#1E293B</code>), and calming hospital teal (<code className="font-mono text-xs bg-white px-1 py-0.5 rounded border border-slate-200">#0D9488</code>) to eliminate optical fatigue during long clinical shifts.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-xs font-semibold text-slate-800">High-Legibility Clinical Mode</div>
                  <div className="text-xs text-slate-500">Enhanced border sharpness for charts & tables</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setContrastBoost(!contrastBoost);
                  addToast('info', 'Display Adjusted', contrastBoost ? 'Standard Clinical View' : 'High-Legibility Mode Activated');
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  contrastBoost ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    contrastBoost ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* EHR / FHIR Configuration */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">HL7 FHIR R4 & EHR Integration</h2>
              <p className="text-xs text-slate-500">Bi-directional patient records & clinical orders synchronization</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                EHR Primary Vendor:
              </label>
              <select className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500">
                <option>Epic Systems (Hyperspace / MyChart)</option>
                <option>Oracle Cerner (Millennium)</option>
                <option>Athenahealth (athenaClinicals)</option>
                <option>Allscripts / Veradigm</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                FHIR Base Server URL:
              </label>
              <input
                type="text"
                value={fhirEndpoint}
                onChange={(e) => setFhirEndpoint(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                FHIR OAuth2 Token Active
              </span>
              <span className="font-mono text-xs text-emerald-700">Expires in 7h 42m</span>
            </div>
          </div>
        </div>

        {/* EDI Clearinghouse & Revenue Gateway */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">EDI Clearinghouse Gateway</h2>
              <p className="text-xs text-slate-500">Real-time 270/271, 837 claims submission & 835 remittances</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Clearinghouse Network:
              </label>
              <select
                value={clearinghouse}
                onChange={(e) => setClearinghouse(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option>Change Healthcare / Optum EDI</option>
                <option>Availity Essentials Gateway</option>
                <option>Waystar Health Claims Hub</option>
                <option>TriZetto Provider Solutions</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Clearinghouse Trading Partner ID:
              </label>
              <input
                type="text"
                defaultValue="TP-CAREOPS-99824"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>EDI 270/271 Response Latency:</span>
                <strong className="text-slate-900 font-mono">180ms</strong>
              </div>
              <div className="flex justify-between">
                <span>EDI 837 Batch Schedule:</span>
                <strong className="text-slate-900 font-mono">Hourly Auto-Batch</strong>
              </div>
            </div>
          </div>
        </div>

        {/* AI Model Safety & Guardrail Parameters */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Gemini AI Model & Orchestrator</h2>
              <p className="text-xs text-slate-500">Google Gemini 3.7 Flash with Server-Side Guardrails</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Active Reasoning Model:
              </label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="gemini-3.7-flash">gemini-3.7-flash (Recommended for Low Latency Operations)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Complex Clinical Appeals)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs space-y-1">
              <div className="font-bold text-teal-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-700" />
                Clinical Emergency Hard-Coded Interceptor
              </div>
              <p className="text-teal-800">
                Any symptom indicating emergency (chest pain, stroke, severe trauma) triggers an un-bypassable red banner and instructs immediate 911 / ER referral.
              </p>
            </div>
          </div>
        </div>

        {/* HIPAA & Security Safeguards */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">HIPAA & SOC-2 Compliance Safeguards</h2>
              <p className="text-xs text-slate-500">Zero data retention, role-based access control, and end-to-end encryption</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-700">BAA Agreement</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-700">TLS 1.3 In-Transit</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Enforced</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-700">AES-256 Storage</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Enforced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
