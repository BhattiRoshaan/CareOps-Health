import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentItem } from '../../types';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Sparkles,
  ShieldCheck,
  Percent,
  FileCheck,
  X
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const { documents, uploadDocument, activePatient, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<DocumentItem['documentType']>('Insurance Card');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.patientName.toLowerCase().includes(search.toLowerCase()) ||
    d.documentType.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async () => {
    setIsProcessing(true);
    const titleToUse = docTitle || `${docType} - ${activePatient.name}`;
    const success = await uploadDocument(titleToUse, docType);
    setIsProcessing(false);
    if (success) {
      setShowUploadModal(false);
      setDocTitle('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Calm Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Documents & OCR Ingestion
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {documents.length} ingested records · Automated extraction for insurance cards & clinical orders
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Document Grid & OCR Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ingested Documents List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search document title, patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
              />
            </div>
            <span className="text-xs text-slate-400 font-semibold">{filteredDocs.length} Documents</span>
          </div>

          <div className="space-y-3">
            {filteredDocs.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;
              const hasFlagged = doc.extractedFields.some(f => f.flagged);

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-teal-50/50 dark:bg-teal-950/40 border-teal-500 ring-1 ring-teal-400 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl ${
                      hasFlagged
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</h3>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {doc.documentType}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Patient: <strong>{doc.patientName}</strong> • {doc.uploadedAt} • {doc.fileSize}
                      </div>
                      <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-semibold">
                        {doc.extractedFields.length} Structured Fields Parsed
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasFlagged ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Review Required</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: OCR Field Extraction Inspector */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Structured AI Field Inspector
            </h2>
          </div>

          {selectedDoc ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedDoc.title}</h3>
                <p className="text-xs text-slate-400">{selectedDoc.documentType} • ID: {selectedDoc.id}</p>
              </div>

              <div className="space-y-2">
                {selectedDoc.extractedFields.map((field, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs ${
                      field.flagged
                        ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                      <span>{field.fieldName}</span>
                      <span className="font-mono text-teal-600 dark:text-teal-400">
                        {(field.confidence * 100).toFixed(0)}% Confidence
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {field.value}
                    </div>
                    {field.flagged && (
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{field.flagReason || 'Missing required validation data'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select a document from the list to inspect AI-extracted fields and confidence scores.
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Ingest Healthcare Document
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: {activePatient.name} ({activePatient.id})
                  </p>
                </div>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Document Type:
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Insurance Card">Insurance Card (Front / Back)</option>
                <option value="Prior Authorization Form">Prior Authorization Form</option>
                <option value="Bill / EOB">Explanation of Benefits (EOB) / Bill</option>
                <option value="Clinical Chart Note">Clinical Chart Note / Order</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Document Title / Label:
              </label>
              <input
                type="text"
                placeholder={`${docType} - ${activePatient.name}`}
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Drag and Drop Zone Simulator */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-teal-400 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-950/20 text-center flex flex-col items-center justify-center">
              <UploadCloud className="w-8 h-8 text-teal-600 mb-2" />
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Drag & Drop Document File or Click to Browse
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Supports PDF, PNG, JPG, DICOM with HIPAA-safe encryption
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Extracting via AI...' : 'Ingest & Extract'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
