import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from './Logo';
import {
  Search,
  Mic,
  ChevronDown,
  Menu,
  ShieldCheck,
  User,
  Stethoscope,
  Receipt,
  FileCheck,
  Sliders,
  Cpu,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  Eye,
  Filter,
  FileText,
  Calendar,
  X,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenMobileNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const {
    isAuthenticated,
    currentUser,
    setCurrentUser,
    users,
    logout,
    setIsAccountSettingsModalOpen,
    openAuthModal,
    activePatient,
    setActivePatientId,
    patients,
    activePage,
    setActivePage,
    searchQuery,
    setSearchQuery,
    isFirestoreConnected,
    firebaseUser,
    setIsAccessibilityModalOpen,
    roleFocus,
    setRoleFocus,
    claims,
    invoices,
    documents,
    appointments,
    providers,
    openPatientQuickView
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');

  // Global search dropdown state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSearchCategory, setActiveSearchCategory] = useState<'all' | 'patients' | 'claims' | 'billing' | 'documents' | 'appointments' | 'providers'>('all');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const patientDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setShowUserDropdown(false);
      }
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(target)) {
        setShowPatientDropdown(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(target)) {
        setShowRoleDropdown(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut: '/' or 'Cmd+K'/'Ctrl+K' focuses the search box
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && 
          document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.insuranceName.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // Tenant-isolated Global Search across Patients, Claims, Invoices, Documents, Appointments, Providers
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const isPatientUser = currentUser?.role === 'patient';
    const patientScopeId = currentUser?.patientId || activePatient?.id;

    // Scoped pools
    const scopedPatients = isPatientUser
      ? patients.filter(p => p.id === patientScopeId)
      : patients;
    const scopedClaims = isPatientUser
      ? claims.filter(c => c.patientId === patientScopeId)
      : claims;
    const scopedInvoices = isPatientUser
      ? invoices.filter(i => i.patientId === patientScopeId)
      : invoices;
    const scopedDocs = isPatientUser
      ? documents.filter(d => d.patientId === patientScopeId)
      : documents;
    const scopedApts = isPatientUser
      ? appointments.filter(a => a.patientId === patientScopeId)
      : appointments;
    const scopedProviders = providers; // All users can search hospital providers

    if (!q) {
      return {
        query: '',
        totalCount: 0,
        patients: [],
        claims: [],
        invoices: [],
        documents: [],
        appointments: [],
        providers: []
      };
    }

    const matchedPatients = scopedPatients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.dob && p.dob.toLowerCase().includes(q)) ||
      (p.insuranceName && p.insuranceName.toLowerCase().includes(q)) ||
      (p.conditions && p.conditions.some(c => c.toLowerCase().includes(q)))
    );

    const matchedClaims = scopedClaims.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.patientName.toLowerCase().includes(q) ||
      c.payerName.toLowerCase().includes(q) ||
      c.serviceDescription.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q) ||
      (c.diagnosisCodes && c.diagnosisCodes.some(d => d.toLowerCase().includes(q))) ||
      (c.procedureCodes && c.procedureCodes.some(p => p.toLowerCase().includes(q))) ||
      (c.cptCodes && c.cptCodes.some(p => p.toLowerCase().includes(q)))
    );

    const matchedInvoices = scopedInvoices.filter(i =>
      i.id.toLowerCase().includes(q) ||
      i.patientName.toLowerCase().includes(q) ||
      i.serviceDescription.toLowerCase().includes(q) ||
      i.status.toLowerCase().includes(q) ||
      String(i.balanceDue).includes(q) ||
      String(i.totalCharges).includes(q)
    );

    const matchedDocuments = scopedDocs.filter(d =>
      d.id.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      d.patientName.toLowerCase().includes(q) ||
      d.documentType.toLowerCase().includes(q) ||
      d.status.toLowerCase().includes(q)
    );

    const matchedAppointments = scopedApts.filter(a =>
      a.id.toLowerCase().includes(q) ||
      a.patientName.toLowerCase().includes(q) ||
      a.providerName.toLowerCase().includes(q) ||
      a.reasonForVisit.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q) ||
      a.date.includes(q)
    );

    const matchedProviders = scopedProviders.filter(pr =>
      pr.name.toLowerCase().includes(q) ||
      pr.specialty.toLowerCase().includes(q) ||
      pr.department.toLowerCase().includes(q) ||
      (pr.npi && pr.npi.toLowerCase().includes(q)) ||
      (pr.location && pr.location.toLowerCase().includes(q))
    );

    const totalCount =
      matchedPatients.length +
      matchedClaims.length +
      matchedInvoices.length +
      matchedDocuments.length +
      matchedAppointments.length +
      matchedProviders.length;

    return {
      query: q,
      totalCount,
      patients: matchedPatients,
      claims: matchedClaims,
      invoices: matchedInvoices,
      documents: matchedDocuments,
      appointments: matchedAppointments,
      providers: matchedProviders
    };
  }, [searchQuery, currentUser, activePatient, patients, claims, invoices, documents, appointments, providers]);

  const handleSelectPatientResult = (patientId: string) => {
    setActivePatientId(patientId);
    const target = patients.find(p => p.id === patientId);
    if (target) {
      openPatientQuickView(target);
    }
    setIsSearchOpen(false);
  };

  const handleSelectClaimResult = (claimId: string, patientId: string) => {
    setActivePatientId(patientId);
    setActivePage('claims');
    setIsSearchOpen(false);
  };

  const handleSelectInvoiceResult = (invoiceId: string, patientId: string) => {
    setActivePatientId(patientId);
    setActivePage('billing');
    setIsSearchOpen(false);
  };

  const handleSelectDocResult = (docId: string, patientId: string) => {
    setActivePatientId(patientId);
    setActivePage('documents');
    setIsSearchOpen(false);
  };

  const handleSelectAppointmentResult = (aptId: string, patientId: string) => {
    setActivePatientId(patientId);
    setActivePage('appointments');
    setIsSearchOpen(false);
  };

  const handleSelectProviderResult = () => {
    setActivePage('providers');
    setIsSearchOpen(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'patient': return <User className="w-3.5 h-3.5 text-slate-600" />;
      case 'provider': return <Stethoscope className="w-3.5 h-3.5 text-teal-700" />;
      case 'billing': return <Receipt className="w-3.5 h-3.5 text-slate-600" />;
      case 'claims': return <FileCheck className="w-3.5 h-3.5 text-slate-600" />;
      case 'admin': return <Sliders className="w-3.5 h-3.5 text-slate-600" />;
      case 'ops_manager': return <Cpu className="w-3.5 h-3.5 text-teal-700" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'provider':
      case 'ops_manager':
        return 'bg-teal-50/80 text-teal-800 border-teal-200/80 hover:bg-teal-100/70';
      default:
        return 'bg-slate-100/90 text-slate-700 border-slate-200 hover:bg-slate-200/80';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Hamburger (Mobile) & Brand */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Logo showTagline={false} />

          {/* Interactive Global Search bar (Tablet/Desktop) with Live Results Dropdown */}
          <div className="hidden md:flex items-center relative w-64 lg:w-80 xl:w-96" ref={searchContainerRef}>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search patients, claims, invoices, docs... (/)"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              className="w-full bg-slate-50 text-slate-800 pl-8 pr-14 py-1.5 rounded-lg text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition-all placeholder:text-slate-400"
              aria-label="Global search across all modules"
              aria-expanded={isSearchOpen}
            />

            {/* Quick Actions inside input */}
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title="Clear search"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded">
                  /
                </kbd>
              )}
            </div>

            {/* Floating Live Search Dropdown */}
            {isSearchOpen && (
              <div className="absolute left-0 top-full mt-2 w-full sm:w-[480px] lg:w-[540px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto text-xs">
                  <button
                    onClick={() => setActiveSearchCategory('all')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                      activeSearchCategory === 'all'
                        ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All {searchResults.query && `(${searchResults.totalCount})`}
                  </button>
                  {currentUser?.role !== 'patient' && (
                    <button
                      onClick={() => setActiveSearchCategory('patients')}
                      className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                        activeSearchCategory === 'patients'
                          ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Patients {searchResults.query && `(${searchResults.patients.length})`}
                    </button>
                  )}
                  <button
                    onClick={() => setActiveSearchCategory('claims')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                      activeSearchCategory === 'claims'
                        ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Claims {searchResults.query && `(${searchResults.claims.length})`}
                  </button>
                  <button
                    onClick={() => setActiveSearchCategory('billing')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                      activeSearchCategory === 'billing'
                        ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Billing {searchResults.query && `(${searchResults.invoices.length})`}
                  </button>
                  <button
                    onClick={() => setActiveSearchCategory('documents')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                      activeSearchCategory === 'documents'
                        ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Docs {searchResults.query && `(${searchResults.documents.length})`}
                  </button>
                  <button
                    onClick={() => setActiveSearchCategory('appointments')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                      activeSearchCategory === 'appointments'
                        ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Appts {searchResults.query && `(${searchResults.appointments.length})`}
                  </button>
                  <button
                    onClick={() => setActiveSearchCategory('providers')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                      activeSearchCategory === 'providers'
                        ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Doctors {searchResults.query && `(${searchResults.providers.length})`}
                  </button>
                </div>

                {/* Dropdown Body */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
                  {/* Empty Query: Quick Navigation & Suggestions */}
                  {!searchResults.query && (
                    <div className="p-3 text-xs text-slate-600 space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Quick Suggestions
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            setActivePatientId(activePatient.id);
                            openPatientQuickView(activePatient);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 border border-slate-100 text-left transition-colors cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 truncate">{activePatient.name}</div>
                            <div className="text-xs text-slate-500">Active Patient Profile</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setActivePage('claims');
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 border border-slate-100 text-left transition-colors cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 truncate">Claims Center</div>
                            <div className="text-xs text-slate-500">{claims.length} registered claims</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setActivePage('billing');
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 border border-slate-100 text-left transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 truncate">Invoices & Billing</div>
                            <div className="text-xs text-slate-500">{invoices.length} billing records</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setActivePage('documents');
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 border border-slate-100 text-left transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 truncate">Clinical Documents</div>
                            <div className="text-xs text-slate-500">{documents.length} verified records</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* No Matches Found */}
                  {searchResults.query && searchResults.totalCount === 0 && (
                    <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                      <p className="font-medium text-slate-800">No records found for &ldquo;{searchResults.query}&rdquo;</p>
                      <p className="text-xs text-slate-500">
                        Try searching by patient name, claim ID (e.g. CLM-101), CPT code (e.g. 99214), or invoice number.
                      </p>
                    </div>
                  )}

                  {/* Matched Patients */}
                  {(activeSearchCategory === 'all' || activeSearchCategory === 'patients') &&
                    searchResults.patients.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                          Patients ({searchResults.patients.length})
                        </div>
                        {searchResults.patients.slice(0, activeSearchCategory === 'all' ? 3 : 15).map(p => (
                          <button
                            key={p.id}
                            onClick={() => handleSelectPatientResult(p.id)}
                            className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center shrink-0">
                                <User className="w-3.5 h-3.5 text-teal-700" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-800 truncate">
                                  {p.name}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                  ID: {p.id} · DOB: {p.dob || p.dateOfBirth} · {p.insuranceName}
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}

                  {/* Matched Claims */}
                  {(activeSearchCategory === 'all' || activeSearchCategory === 'claims') &&
                    searchResults.claims.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                          Claims ({searchResults.claims.length})
                        </div>
                        {searchResults.claims.slice(0, activeSearchCategory === 'all' ? 3 : 15).map(c => (
                          <button
                            key={c.id}
                            onClick={() => handleSelectClaimResult(c.id, c.patientId)}
                            className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center shrink-0">
                                <FileCheck className="w-3.5 h-3.5 text-indigo-700" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-800 truncate">
                                  {c.id} — {c.serviceDescription}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                  {c.patientName} · {c.payerName} · ${(c.submittedAmount || c.totalBilledAmount || 0).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ml-2 ${
                              c.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                              c.status === 'Denied' ? 'bg-rose-50 text-rose-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>
                              {c.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                  {/* Matched Invoices */}
                  {(activeSearchCategory === 'all' || activeSearchCategory === 'billing') &&
                    searchResults.invoices.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                          Invoices & Billing ({searchResults.invoices.length})
                        </div>
                        {searchResults.invoices.slice(0, activeSearchCategory === 'all' ? 3 : 15).map(i => (
                          <button
                            key={i.id}
                            onClick={() => handleSelectInvoiceResult(i.id, i.patientId)}
                            className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0">
                                <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-800 truncate">
                                  {i.id} — {i.serviceDescription}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                  {i.patientName} · Due: ${i.balanceDue.toFixed(2)} (Total: ${i.totalCharges.toFixed(2)})
                                </div>
                              </div>
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ml-2 ${
                              i.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
                              i.status === 'Overdue' ? 'bg-rose-50 text-rose-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>
                              {i.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                  {/* Matched Documents */}
                  {(activeSearchCategory === 'all' || activeSearchCategory === 'documents') &&
                    searchResults.documents.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                          Documents ({searchResults.documents.length})
                        </div>
                        {searchResults.documents.slice(0, activeSearchCategory === 'all' ? 3 : 15).map(d => (
                          <button
                            key={d.id}
                            onClick={() => handleSelectDocResult(d.id, d.patientId)}
                            className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0">
                                <FileText className="w-3.5 h-3.5 text-blue-700" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-800 truncate">
                                  {d.title}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                  {d.patientName} · {d.documentType} · {d.status}
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}

                  {/* Matched Appointments */}
                  {(activeSearchCategory === 'all' || activeSearchCategory === 'appointments') &&
                    searchResults.appointments.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                          Appointments ({searchResults.appointments.length})
                        </div>
                        {searchResults.appointments.slice(0, activeSearchCategory === 'all' ? 3 : 15).map(a => (
                          <button
                            key={a.id}
                            onClick={() => handleSelectAppointmentResult(a.id, a.patientId)}
                            className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200/80 flex items-center justify-center shrink-0">
                                <Calendar className="w-3.5 h-3.5 text-purple-700" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-800 truncate">
                                  {a.patientName} — {a.reasonForVisit}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                  With {a.providerName} · {a.date} at {a.time}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium shrink-0 ml-2">
                              {a.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                  {/* Matched Providers */}
                  {(activeSearchCategory === 'all' || activeSearchCategory === 'providers') &&
                    searchResults.providers.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                          Doctors & Providers ({searchResults.providers.length})
                        </div>
                        {searchResults.providers.slice(0, activeSearchCategory === 'all' ? 3 : 15).map(pr => (
                          <button
                            key={pr.id}
                            onClick={handleSelectProviderResult}
                            className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center shrink-0">
                                <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-800 truncate">
                                  {pr.name}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                  {pr.specialty} · {pr.department} · NPI: {pr.npi}
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                {/* Dropdown Footer */}
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>Press <kbd className="font-semibold text-slate-700 bg-white border border-slate-200 px-1 rounded text-xs">ESC</kbd> to close</span>
                  </div>
                  {searchResults.query && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActivePage('claims');
                          setIsSearchOpen(false);
                        }}
                        className="text-teal-700 hover:text-teal-900 font-medium cursor-pointer"
                      >
                        Open in Claims &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Search Toggle Button */}
          <div className="md:hidden relative">
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Search"
              aria-label="Toggle mobile search"
            >
              <Search className="w-4 h-4" />
            </button>

            {isMobileSearchOpen && (
              <div className="fixed inset-x-2 top-14 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search across CareOps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 pl-8 pr-8 py-2 rounded-lg text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsMobileSearchOpen(false)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {searchResults.query && searchResults.totalCount > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-1 text-xs">
                    {searchResults.patients.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          handleSelectPatientResult(p.id);
                          setIsMobileSearchOpen(false);
                        }}
                        className="w-full p-2 text-left rounded-lg hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-900 truncate">{p.name} (Patient)</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                    {searchResults.claims.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          handleSelectClaimResult(c.id, c.patientId);
                          setIsMobileSearchOpen(false);
                        }}
                        className="w-full p-2 text-left rounded-lg hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-900 truncate">{c.id} - {c.serviceDescription}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                    {searchResults.invoices.map(i => (
                      <button
                        key={i.id}
                        onClick={() => {
                          handleSelectInvoiceResult(i.id, i.patientId);
                          setIsMobileSearchOpen(false);
                        }}
                        className="w-full p-2 text-left rounded-lg hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-900 truncate">{i.id} - ${i.balanceDue}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-2 text-center text-xs text-slate-400">
                    {searchResults.query ? 'No matching records' : 'Enter search term above'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Database & Auth Status Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <span className={`w-1.5 h-1.5 rounded-full ${isFirestoreConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <span>{isFirestoreConnected ? 'Firestore Connected' : 'Connecting DB...'}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Patient Context Selector */}
          <div className="relative" ref={patientDropdownRef}>
            <button
              onClick={() => {
                setShowPatientDropdown(!showPatientDropdown);
                setShowRoleDropdown(false);
                setShowUserDropdown(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-left transition-colors cursor-pointer"
              title="Active Patient Context"
            >
              <div className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
              <div className="flex flex-col">
                <span className="hidden sm:block text-[9px] uppercase tracking-wider text-slate-400 font-medium leading-none">Patient</span>
                <span className="text-xs font-medium text-slate-800 leading-tight truncate max-w-[90px] sm:max-w-[130px]">
                  {activePatient.name}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {showPatientDropdown && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-3 pb-2 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-800">Select Patient Context</div>
                  <div className="text-xs text-slate-500 mb-2">25 Patient records available</div>
                  <input
                    type="text"
                    placeholder="Filter by name, ID, or payer..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700"
                    autoFocus
                  />
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {filteredPatients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePatientId(p.id);
                        setShowPatientDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-start justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        p.id === activePatient.id ? 'bg-teal-50/60 font-medium' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-medium text-slate-900 truncate">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.id} · {p.insuranceName.split(' ')[0]}</div>
                      </div>
                      {p.outstandingBalance > 0 && (
                        <span className="text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                          ${p.outstandingBalance}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher */}
          <div className="relative" ref={roleDropdownRef}>
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowPatientDropdown(false);
                setShowUserDropdown(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${getRoleBadgeColor(currentUser.role)}`}
              title="Switch Active RBAC Role"
            >
              {getRoleIcon(currentUser.role)}
              <span className="hidden sm:inline capitalize">{currentUser.role.replace('_', ' ')}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Role Profile
                </div>
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                      u.id === currentUser.id ? 'bg-teal-50/50 font-semibold' : ''
                    }`}
                  >
                    <div className="p-1 rounded bg-slate-100">
                      {getRoleIcon(u.role)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-800 capitalize truncate">{u.name}</div>
                      <div className="text-xs text-slate-500 truncate">{u.title || u.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Focus Filter Toggle for Business Users */}
          <button
            onClick={() => setRoleFocus(roleFocus === 'myRole' ? 'all' : 'myRole')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              roleFocus === 'myRole'
                ? 'bg-teal-50 border-teal-200 text-teal-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title={roleFocus === 'myRole' ? 'Filtering navigation to your active role. Click to view all modules.' : 'Viewing all system modules. Click to filter by active role.'}
            aria-pressed={roleFocus === 'myRole'}
            aria-label="Toggle role-focused navigation"
          >
            <Filter className="w-3.5 h-3.5 text-teal-700" />
            <span>{roleFocus === 'myRole' ? 'Role Focus' : 'All Modules'}</span>
          </button>

          {/* Accessibility Preferences Modal Trigger */}
          <button
            onClick={() => setIsAccessibilityModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            title="Accessibility & Readability Settings (WCAG AAA, Font Scale, High Contrast)"
            aria-label="Open accessibility preferences"
          >
            <Eye className="w-3.5 h-3.5 text-teal-700" />
            <span className="hidden lg:inline">A11y</span>
          </button>

          {/* Voice AI Action Link */}
          <button
            onClick={() => setActivePage('voice')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activePage === 'voice'
                ? 'bg-teal-800 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Launch Voice AI"
            aria-label="Launch Voice AI"
          >
            <Mic className="w-3.5 h-3.5 text-teal-700" />
            <span className="hidden md:inline">Voice</span>
          </button>

          {/* User Account Settings & Profile Menu */}
          {isAuthenticated ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowRoleDropdown(false);
                  setShowPatientDropdown(false);
                }}
                className="flex items-center gap-1.5 p-1 sm:pl-1.5 sm:pr-2 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Account Settings & Session"
                aria-label="User Account Menu"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="hidden md:block text-xs font-medium text-slate-700 max-w-[100px] truncate text-left">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                  {/* User Overview Header */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center gap-2.5">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</div>
                      <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setIsAccountSettingsModalOpen(true);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-normal text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActivePage('account-settings');
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-normal text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Security & Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowRoleDropdown(true);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-normal text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span>Switch Role</span>
                    </button>
                  </div>

                  {/* Log Out Divider & Button */}
                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('signin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
