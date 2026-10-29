import React, { useState, useRef, useEffect } from 'react';
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
  Filter
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
    setRoleFocus
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const patientDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.insuranceName.toLowerCase().includes(patientSearch.toLowerCase())
  );

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

          {/* Search bar (Tablet/Desktop) */}
          <div className="hidden md:flex items-center relative w-56 lg:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search patients, claims, codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Database & Auth Status Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-[10px] text-slate-600">
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
                  <div className="text-[11px] text-slate-500 mb-2">25 Patient records available</div>
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
                        <div className="text-[11px] text-slate-500">{p.id} · {p.insuranceName.split(' ')[0]}</div>
                      </div>
                      {p.outstandingBalance > 0 && (
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
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
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
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
                      <div className="text-[10px] text-slate-500 truncate">{u.title || u.role}</div>
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
                      <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
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
