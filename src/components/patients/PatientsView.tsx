import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import {
  Users,
  Search,
  User,
  ShieldCheck,
  CreditCard,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const PatientsView: React.FC = () => {
  const {
    patients,
    activePatient,
    setActivePatientId,
    openPatientQuickView,
    addToast,
    searchQuery
  } = useApp();

  const [search, setSearch] = useState(searchQuery || '');

  React.useEffect(() => {
    if (searchQuery !== undefined) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.insuranceName.toLowerCase().includes(search.toLowerCase()) ||
    p.conditions.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Calm, Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Patients
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {patients.length} registered patients · Active context: <strong className="text-slate-700 font-medium">{activePatient.name}</strong>
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search patient, ID, or payer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* Clean, Spacious Patients Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">DOB / Gender</th>
                <th className="py-3 px-4">Insurance Payer</th>
                <th className="py-3 px-4">Assigned Provider</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentPatients.map(p => {
                const isActive = p.id === activePatient.id;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isActive ? 'bg-teal-50/30 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-medium text-xs shrink-0">
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{p.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{p.dateOfBirth || p.dob}</div>
                      <div className="text-xs text-slate-400">{p.gender}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{p.insuranceName}</div>
                      <div className="text-xs text-slate-400 font-mono">{p.memberId}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {p.assignedProviderName || 'Primary Care Team'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium">
                      {p.outstandingBalance > 0 ? (
                        <span className="text-amber-700 font-semibold">
                          ${p.outstandingBalance.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400">$0.00</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openPatientQuickView(p)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                        title="Quick View vital stats, encounter notes, and active claims"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-700" />
                        <span>Quick View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {currentPatients.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No patients match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Clean, Calm Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 bg-white">
            <div>
              Showing <span className="font-medium text-slate-800">{startIndex + 1}</span> to{' '}
              <span className="font-medium text-slate-800">
                {Math.min(startIndex + itemsPerPage, filteredPatients.length)}
              </span>{' '}
              of <span className="font-medium text-slate-800">{filteredPatients.length}</span> patients
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
