import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Search,
  Download,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs = [], addToast } = useApp();
  const [search, setSearch] = useState('');
  const [phiFilter, setPhiFilter] = useState<'all' | 'phi_only'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredLogs = auditLogs.filter(log => {
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      (log.id && log.id.toLowerCase().includes(term)) ||
      (log.userName && log.userName.toLowerCase().includes(term)) ||
      (log.userId && log.userId.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.resourceType && log.resourceType.toLowerCase().includes(term)) ||
      (log.resourceId && log.resourceId.toLowerCase().includes(term)) ||
      (log.notes && log.notes.toLowerCase().includes(term)) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(term));

    const matchesPhi = phiFilter === 'all' || (phiFilter === 'phi_only' && log.phiAccessed);
    return matchesSearch && matchesPhi;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,LogID,User,Role,Action,ResourceType,ResourceID,PHI_Accessed,IP_Address,Result,Notes']
        .concat(
          filteredLogs.map(
            l =>
              `"${l.timestamp}","${l.id}","${l.userName || l.userId}","${l.userRole}","${l.action}","${l.resourceType}","${l.resourceId}","${l.phiAccessed}","${l.ipAddress}","${l.result}","${(l.notes || '').replace(/"/g, '""')}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `careops_hipaa_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'HIPAA Audit Exported', `Generated immutable CSV log with ${filteredLogs.length} entries.`);
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Calm, Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Compliance & Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {auditLogs.length} logged access events · Tamper-evident HIPAA operational records
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search action, user, resource ID, IP..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setPhiFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              phiFilter === 'all'
                ? 'bg-teal-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => {
              setPhiFilter('phi_only');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              phiFilter === 'phi_only'
                ? 'bg-rose-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>PHI Accessed Only</span>
          </button>
        </div>
      </div>

      {/* Clean Table View */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp & ID</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Action & Summary</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Privacy Level</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No audit records match the selected filters.
                  </td>
                </tr>
              ) : (
                currentLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono">
                      <div className="font-medium text-slate-800">{log.timestamp}</div>
                      <div className="text-[10px] text-slate-400">{log.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{log.userName || log.userId}</div>
                      <div className="text-[10px] text-teal-800 font-medium uppercase">{log.userRole}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{log.action}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {log.notes || (log.aiAgentUsed ? `Processed by ${log.aiAgentUsed}` : 'Standard clinical operation')}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className="font-medium text-slate-800">{log.resourceType}</div>
                      <div className="text-[10px] text-slate-400">{log.resourceId}</div>
                    </td>
                    <td className="px-4 py-3">
                      {log.phiAccessed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
                          <Lock className="w-3 h-3" /> PHI Viewed
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Non-PHI</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {log.ipAddress}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                          log.result === 'Success'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                            : log.result === 'Denied' || log.result === 'Failed'
                            ? 'bg-rose-50 text-rose-800 border-rose-200/60'
                            : 'bg-amber-50 text-amber-800 border-amber-200/60'
                        }`}
                      >
                        {log.result === 'Success' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span>{log.result}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {filteredLogs.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2 px-1">
          <div>
            Showing <span className="font-medium text-slate-700">{startIndex + 1}</span> to{' '}
            <span className="font-medium text-slate-700">
              {Math.min(startIndex + itemsPerPage, filteredLogs.length)}
            </span>{' '}
            of <span className="font-medium text-slate-700">{filteredLogs.length}</span> entries
          </div>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-teal-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
