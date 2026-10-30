import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  Plus,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    providers,
    departments,
    activePatient,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    openPatientQuickView,
    addToast
  } = useApp();

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState(providers[0]?.id || 'PRV-201');
  const [selectedDate, setSelectedDate] = useState('2026-09-08');
  const [selectedTime, setSelectedTime] = useState('10:30 AM');
  const [selectedType, setSelectedType] = useState('In-Person Consultation');
  const [reasonInput, setReasonInput] = useState('Routine clinical follow-up');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.providerName.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());

    const matchesDept = departmentFilter === 'all' || a.department.toLowerCase() === departmentFilter.toLowerCase();
    return matchesSearch && matchesDept;
  });

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage);

  const handleBook = async () => {
    setIsSubmitting(true);
    const success = await bookAppointment(
      selectedProviderId,
      selectedDate,
      selectedTime,
      selectedType,
      reasonInput
    );
    setIsSubmitting(false);
    if (success) {
      setShowBookModal(false);
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Calm, Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Appointments & Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {appointments.length} active bookings across {departments.length} departments
          </p>
        </div>

        <button
          onClick={() => setShowBookModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search patient, doctor, clinic..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 text-xs border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => {
              setDepartmentFilter('all');
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              departmentFilter === 'all'
                ? 'bg-teal-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Departments
          </button>
          {departments.slice(0, 3).map(d => (
            <button
              key={d.id}
              onClick={() => {
                setDepartmentFilter(d.name);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                departmentFilter === d.name
                  ? 'bg-teal-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Appointments Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Type & Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentAppointments.map(appt => (
                <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{appt.date}</div>
                    <div className="text-xs text-slate-500">{appt.time}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{appt.patientName}</div>
                    <div className="text-xs text-slate-400 font-mono">{appt.patientId}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="text-slate-800 font-medium">{appt.providerName}</div>
                    <div className="text-xs text-slate-500">{appt.department}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="text-slate-800">{appt.type}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[160px]">{appt.reasonForVisit || 'Routine follow-up'}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      appt.status === 'Confirmed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                        : appt.status === 'Rescheduled'
                        ? 'bg-blue-50 text-blue-800 border border-blue-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {appt.status}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openPatientQuickView(appt.patientId)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition-colors cursor-pointer"
                        title={`Quick View vitals & history for ${appt.patientName}`}
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-700" />
                      </button>

                      <button
                        onClick={() => {
                          const newD = appt.date === '2026-09-08' ? '2026-09-10' : '2026-09-08';
                          const newT = appt.time === '10:30 AM' ? '02:15 PM' : '10:30 AM';
                          rescheduleAppointment(appt.id, newD, newT);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Reschedule
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {currentAppointments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No appointments match your search.
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
                {Math.min(startIndex + itemsPerPage, filteredAppointments.length)}
              </span>{' '}
              of <span className="font-medium text-slate-800">{filteredAppointments.length}</span> visits
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

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Book New Appointment
                </h3>
                <p className="text-xs text-slate-500">
                  Booking for {activePatient.name} ({activePatient.id})
                </p>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Provider & Specialty:</label>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  {providers.map(pr => (
                    <option key={pr.id} value={pr.id}>
                      {pr.name} ({pr.specialty}) · {pr.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Time Slot:</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="01:15 PM">01:15 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Consultation Modality:</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  <option value="In-Person Consultation">In-Person Consultation</option>
                  <option value="Telehealth Video Visit">Telehealth Video Visit</option>
                  <option value="Urgent Clinical Triage">Urgent Clinical Triage</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Reason for Visit:</label>
                <input
                  type="text"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="e.g., Routine blood pressure follow-up"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowBookModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
