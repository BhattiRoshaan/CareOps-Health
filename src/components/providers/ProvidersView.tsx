import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Provider } from '../../types';
import {
  Stethoscope,
  Search,
  Star,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Grid,
  List,
  Building2,
  User,
  ShieldCheck,
  Check
} from 'lucide-react';

export const ProvidersView: React.FC = () => {
  const {
    providers = [],
    activePatient,
    setActivePage,
    bookAppointment,
    addToast
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null);

  // Booking form state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState(defaultDateStr);
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingType, setBookingType] = useState('In-Person Consultation');
  const [bookingReason, setBookingReason] = useState('Routine consultation and care review');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique departments for filter dropdown
  const departments = Array.from(
    new Set(providers.map(p => p.department).filter(Boolean))
  );

  // Filtered providers list
  const filteredProviders = providers.filter(p => {
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.specialty && p.specialty.toLowerCase().includes(term)) ||
      (p.department && p.department.toLowerCase().includes(term)) ||
      (p.npi && p.npi.toLowerCase().includes(term)) ||
      (p.location && p.location.toLowerCase().includes(term));

    const matchesDept =
      selectedDepartment === 'all' || p.department === selectedDepartment;

    return matchesSearch && matchesDept;
  });

  const itemsPerPage = viewMode === 'cards' ? 6 : 8;
  const totalPages = Math.max(1, Math.ceil(filteredProviders.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProviders = filteredProviders.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenBooking = (provider: Provider) => {
    setBookingProvider(provider);
    setSelectedProvider(null);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingProvider) return;

    setIsSubmitting(true);
    const success = await bookAppointment(
      bookingProvider.id,
      bookingDate,
      bookingTime,
      bookingType,
      bookingReason
    );
    setIsSubmitting(false);

    if (success) {
      setBookingProvider(null);
    }
  };

  // Safe initials generator
  const getInitials = (name?: string) => {
    if (!name) return 'MD';
    const parts = name.replace(/Dr\.\s*|,\s*MD.*|,\s*FAAD.*/gi, '').trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0]?.slice(0, 2).toUpperCase() || 'MD';
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Calm, Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Care Providers & Specialists
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {providers.length} credentialed physicians · Primary provider for {activePatient?.name || 'Patient'}:{' '}
            <strong className="text-slate-700 font-medium">
              {activePatient?.assignedProviderName || 'Dr. Robert Martinez, MD'}
            </strong>
          </p>
        </div>

        {/* Action Controls: Search, Department Filter, View Switch */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search provider, specialty, NPI..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1.5 px-2.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setViewMode('cards')}
              title="Card View"
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredProviders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 mb-1">No providers found</h3>
          <p className="text-xs text-slate-500 mb-4">
            No care providers match your current search "{search}" or department filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDepartment('all');
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Calm, Uncrowded Cards Grid (6 per page) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProviders.map(p => {
            const isPatientProvider = activePatient?.primaryCareDoctorId === p.id;

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all p-4.5 flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Doctor Profile Top Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {p.avatar ? (
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 bg-slate-50"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            (e.target as HTMLElement).style.display = 'none';
                            const sibling = (e.target as HTMLElement).nextElementSibling;
                            if (sibling) (sibling as HTMLElement).style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-11 h-11 rounded-xl bg-teal-50 text-teal-800 font-semibold text-xs flex items-center justify-center shrink-0 border border-teal-100"
                        style={{ display: p.avatar ? 'none' : 'flex' }}
                      >
                        {getInitials(p.name)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-semibold text-slate-900 truncate">
                            {p.name}
                          </h3>
                        </div>
                        <div className="text-[11px] text-teal-800 font-medium truncate">
                          {p.specialty}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          NPI: {p.npi}
                        </div>
                      </div>
                    </div>

                    {/* Rating badge */}
                    {p.rating && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50/80 border border-amber-200/60 px-1.5 py-0.5 rounded shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>{p.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Primary care badge if assigned to active patient */}
                  {isPatientProvider && (
                    <div className="mb-2.5 px-2 py-1 rounded bg-teal-50 border border-teal-200/80 text-[11px] font-medium text-teal-800 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-teal-700" />
                      <span>Assigned Primary Physician</span>
                    </div>
                  )}

                  {/* Provider Info Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 mb-3">
                    <div className="flex items-center gap-2 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-700">{p.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-600">{p.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-700 font-medium">{p.nextAvailableSlot}</span>
                    </div>
                    {p.availableDays && p.availableDays.length > 0 && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                        <span className="text-slate-400">Days:</span>
                        <span className="truncate">{p.availableDays.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedProvider(p)}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => handleOpenBooking(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Visit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Directory Table View (8 per page) */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium text-[11px]">
                <tr>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Specialty & Department</th>
                  <th className="py-3 px-4">NPI / Contact</th>
                  <th className="py-3 px-4">Next Slot</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedProviders.map(p => {
                  const isPatientProvider = activePatient?.primaryCareDoctorId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isPatientProvider ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {p.avatar ? (
                            <img
                              src={p.avatar}
                              alt={p.name}
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200 bg-slate-50"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                                const sibling = (e.target as HTMLElement).nextElementSibling;
                                if (sibling) (sibling as HTMLElement).style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 font-medium text-[10px] flex items-center justify-center shrink-0 border border-teal-100"
                            style={{ display: p.avatar ? 'none' : 'flex' }}
                          >
                            {getInitials(p.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {p.name}
                              {isPatientProvider && (
                                <span className="text-[10px] bg-teal-50 text-teal-800 px-1.5 py-0.2 rounded font-normal border border-teal-200/60">
                                  Primary
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{p.location}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{p.specialty}</div>
                        <div className="text-[11px] text-slate-500">{p.department}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-600 text-[11px]">NPI: {p.npi}</div>
                        <div className="text-slate-500 text-[11px]">{p.phone}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{p.nextAvailableSlot}</div>
                        <div className="text-[10px] text-slate-400">
                          {p.availableDays?.slice(0, 3).join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{p.rating}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedProvider(p)}
                            className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleOpenBooking(p)}
                            className="px-2.5 py-1 rounded bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs transition-colors cursor-pointer"
                          >
                            Book
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredProviders.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2 px-1">
          <div>
            Showing <span className="font-medium text-slate-700">{startIndex + 1}</span> to{' '}
            <span className="font-medium text-slate-700">
              {Math.min(startIndex + itemsPerPage, filteredProviders.length)}
            </span>{' '}
            of <span className="font-medium text-slate-700">{filteredProviders.length}</span> providers
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

      {/* Provider Details Modal */}
      {selectedProvider && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedProvider(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-3">
                {selectedProvider.avatar ? (
                  <img
                    src={selectedProvider.avatar}
                    alt={selectedProvider.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 font-semibold text-sm flex items-center justify-center border border-teal-100">
                    {getInitials(selectedProvider.name)}
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    {selectedProvider.name}
                  </h2>
                  <p className="text-xs text-teal-800 font-medium">
                    {selectedProvider.specialty}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    NPI: {selectedProvider.npi}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProvider(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                    Department
                  </span>
                  <span className="text-slate-800 font-medium">
                    {selectedProvider.department}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                    Patient Rating
                  </span>
                  <span className="text-amber-700 font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    {selectedProvider.rating} / 5.0
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                    Clinic Location
                  </span>
                  <span className="text-slate-700">{selectedProvider.location}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                    Next Slot
                  </span>
                  <span className="text-teal-800 font-medium">
                    {selectedProvider.nextAvailableSlot}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Direct Contact & Scheduling
                </h4>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedProvider.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedProvider.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Office Days: {selectedProvider.availableDays?.join(', ') || 'Monday - Friday'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Accepted Insurance Networks */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  In-Network Insurance Networks
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {['BlueCross BlueShield', 'Medicare Part B', 'Aetna Choice POS', 'Cigna HealthSpring', 'UnitedHealthcare Premier'].map(network => (
                    <span
                      key={network}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] border border-slate-200/60"
                    >
                      {network}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleOpenBooking(selectedProvider)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Visit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      {bookingProvider && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setBookingProvider(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3 bg-slate-50/50">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Book Clinical Appointment
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  With {bookingProvider.name} ({bookingProvider.specialty})
                </p>
              </div>

              <button
                onClick={() => setBookingProvider(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Patient
                </label>
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                  {activePatient?.name || 'Eleanor Vance'} ({activePatient?.id || 'PAT-1001'})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Consultation Type
                </label>
                <select
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
                >
                  <option value="In-Person Consultation">In-Person Consultation</option>
                  <option value="Telehealth">Telehealth Video Consult</option>
                  <option value="Follow-up">Clinical Follow-up</option>
                  <option value="Diagnostic Imaging">Diagnostic Review</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Reason for Visit
                </label>
                <textarea
                  rows={2}
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  placeholder="Describe symptoms or clinical focus..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBookingProvider(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Scheduling...' : 'Confirm Appointment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
