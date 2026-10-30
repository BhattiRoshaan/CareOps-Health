import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { ClinicalSafetyBanner } from './components/safety/ClinicalSafetyBanner';
import { RoleSwitcherModal } from './components/auth/RoleSwitcherModal';
import { AuthPage } from './components/auth/AuthPage';
import { AuthModal } from './components/auth/AuthModal';
import { AccountSettingsView } from './components/settings/AccountSettingsView';
import { AccountSettingsModal } from './components/settings/AccountSettingsModal';
import { PatientQuickView } from './components/patients/PatientQuickView';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  FileCheck2,
  Menu,
  ShieldAlert
} from 'lucide-react';
import { PageId, UserRole } from './types';

import { DashboardView } from './components/dashboard/DashboardView';
import { AIChatView } from './components/chat/AIChatView';
import { VoiceAIView } from './components/voice/VoiceAIView';
import { ClaimsView } from './components/claims/ClaimsView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { BillingView } from './components/billing/BillingView';
import { PatientsView } from './components/patients/PatientsView';
import { DocumentsView } from './components/documents/DocumentsView';
import { InsuranceView } from './components/insurance/InsuranceView';
import { ProvidersView } from './components/providers/ProvidersView';
import { EscalationsView } from './components/escalations/EscalationsView';
import { KnowledgeBaseView } from './components/knowledge/KnowledgeBaseView';
import { AIAgentsView } from './components/agents/AIAgentsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { SettingsView } from './components/settings/SettingsView';
import { WorkQueuesView } from './components/queues/WorkQueuesView';
import { AccessibilityModal } from './components/common/AccessibilityModal';

const ROLE_ALLOWED_PAGES: Record<UserRole, PageId[]> = {
  patient: ['dashboard', 'appointments', 'providers', 'insurance', 'claims', 'billing', 'documents', 'chat', 'voice', 'account-settings'],
  provider: ['dashboard', 'queues', 'patients', 'appointments', 'providers', 'documents', 'escalations', 'knowledge', 'chat', 'voice', 'account-settings'],
  billing: ['dashboard', 'queues', 'patients', 'insurance', 'claims', 'billing', 'documents', 'escalations', 'knowledge', 'analytics', 'chat', 'voice', 'account-settings'],
  claims: ['dashboard', 'queues', 'patients', 'insurance', 'claims', 'documents', 'escalations', 'knowledge', 'analytics', 'chat', 'voice', 'account-settings'],
  ops_manager: ['dashboard', 'queues', 'patients', 'appointments', 'providers', 'insurance', 'claims', 'billing', 'documents', 'escalations', 'knowledge', 'agents', 'analytics', 'audit', 'settings', 'chat', 'voice', 'account-settings'],
  admin: [
    'dashboard', 'queues', 'chat', 'voice', 'patients', 'appointments', 'providers',
    'insurance', 'claims', 'billing', 'documents', 'escalations', 'knowledge',
    'agents', 'analytics', 'audit', 'account-settings', 'settings'
  ]
};

const MainContent: React.FC = () => {
  const {
    isAuthenticated,
    currentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authInitialTab,
    isAccountSettingsModalOpen,
    setIsAccountSettingsModalOpen,
    isPatientQuickViewOpen,
    closePatientQuickView,
    quickViewPatient,
    activePage,
    setActivePage,
    claims,
    isAccessibilityModalOpen,
    setIsAccessibilityModalOpen
  } = useApp();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const deniedClaimsCount = claims.filter(c => c.status === 'Denied').length;

  // If user is not authenticated, render the dedicated Authentication Landing View
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafb] font-sans text-slate-800 antialiased selection:bg-teal-700/20 selection:text-teal-900">
        <AuthPage />
        <ToastContainer />
      </div>
    );
  }

  // Enforce per-role page authorization guard (Tenant Isolation & HIPAA Minimum Necessary)
  const allowedPages = ROLE_ALLOWED_PAGES[currentUser.role] || ['dashboard', 'account-settings'];
  const isPageAuthorized = allowedPages.includes(activePage);

  const renderActiveView = () => {
    if (!isPageAuthorized) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 min-h-[500px]">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4 shadow-xs">
            <ShieldAlert className="w-7 h-7 text-rose-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Access Restricted: Role Authorization Required
          </h2>
          <p className="text-xs text-slate-600 max-w-md mb-4 leading-relaxed">
            Your active identity ({currentUser.name}) is certified with role <strong className="uppercase text-slate-900">{currentUser.role}</strong>. Under HIPAA Minimum Necessary standards and tenant data isolation policies, this operational module ({activePage}) is reserved for authorized clinical or administrative personnel.
          </p>
          <button
            onClick={() => setActivePage('dashboard')}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Return to Authorized Dashboard
          </button>
        </div>
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <DashboardView />;
      case 'queues':
        return <WorkQueuesView />;
      case 'chat':
        return <AIChatView />;
      case 'voice':
        return <VoiceAIView />;
      case 'claims':
        return <ClaimsView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'billing':
        return <BillingView />;
      case 'patients':
        return <PatientsView />;
      case 'documents':
        return <DocumentsView />;
      case 'insurance':
        return <InsuranceView />;
      case 'providers':
        return <ProvidersView />;
      case 'escalations':
        return <EscalationsView />;
      case 'knowledge':
        return <KnowledgeBaseView />;
      case 'agents':
        return <AIAgentsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'audit':
        return <AuditLogsView />;
      case 'account-settings':
        return <AccountSettingsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafb] font-sans text-slate-800 antialiased selection:bg-teal-700/20 selection:text-teal-900">
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-teal-700 focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Desktop Static Sidebar */}
      <Sidebar isMobile={false} onOpenRoleModal={() => setIsRoleModalOpen(true)} />

      {/* Mobile Slide-Out Drawer */}
      <Sidebar
        isMobile={true}
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenRoleModal={() => {
          setIsMobileNavOpen(false);
          setIsRoleModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        {/* Header */}
        <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />

        {/* Clinical Emergency Guardrail Banner */}
        <ClinicalSafetyBanner />

        {/* Scrollable View Container */}
        <main
          id="main-content"
          tabIndex={-1}
          role="main"
          aria-label="Main Application Content"
          className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 pb-24 lg:pb-8 outline-none"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <ErrorBoundary onReset={() => setActivePage('dashboard')}>
              {renderActiveView()}
            </ErrorBoundary>
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (Ultra-responsive multi-device friendly) */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg"
          aria-label="Mobile Navigation"
        >
          <button
            onClick={() => setActivePage('dashboard')}
            aria-label="Overview Dashboard"
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
              activePage === 'dashboard'
                ? 'text-teal-700 font-bold scale-105'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-xs mt-0.5">Overview</span>
          </button>

          <button
            onClick={() => setActivePage('queues')}
            aria-label="Work Queues"
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center p-1.5 rounded-xl relative transition-all cursor-pointer ${
              activePage === 'queues'
                ? 'text-teal-700 font-bold scale-105'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-5 h-5" />
            <span className="text-xs mt-0.5">Queues</span>
            {deniedClaimsCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            onClick={() => setActivePage('voice')}
            aria-label="Voice AI Emergency & Clinical Line"
            className={`flex flex-col items-center justify-center -mt-4 p-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/30 transition-transform active:scale-95 cursor-pointer ${
              activePage === 'voice' ? 'ring-2 ring-teal-400 ring-offset-2' : ''
            }`}
          >
            <Mic className="w-5 h-5 animate-pulse" />
            <span className="sr-only">Voice AI</span>
          </button>

          <button
            onClick={() => setActivePage('chat')}
            aria-label="AI EHR Assistant Chat"
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
              activePage === 'chat'
                ? 'text-teal-700 font-bold scale-105'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs mt-0.5">AI Chat</span>
          </button>

          <button
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open Full Navigation Menu"
            className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-0.5">Menu</span>
          </button>
        </nav>
      </div>

      {/* Role Switching RBAC Modal */}
      <RoleSwitcherModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} />

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={isAccountSettingsModalOpen}
        onClose={() => setIsAccountSettingsModalOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authInitialTab}
      />

      {/* Patient Quick View Drawer / Modal */}
      <PatientQuickView
        isOpen={isPatientQuickViewOpen}
        onClose={closePatientQuickView}
        patient={quickViewPatient}
      />

      {/* Accessibility & Visual Comfort Modal */}
      <AccessibilityModal
        isOpen={isAccessibilityModalOpen}
        onClose={() => setIsAccessibilityModalOpen(false)}
      />

      {/* Global Notifications Toast Stack */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

