import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageId, UserRole } from '../../types';
import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  Users,
  Calendar,
  UserCheck,
  ShieldCheck,
  FileCheck2,
  CreditCard,
  FileText,
  Headphones,
  BookOpen,
  Cpu,
  BarChart3,
  Lock,
  Settings,
  User,
  LogOut,
  Settings2,
  Layers
} from 'lucide-react';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: number | string;
  badgeVariant?: 'danger' | 'warning' | 'info' | 'success';
  allowedRoles?: UserRole[];
}

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenRoleModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, isOpen = false, onClose }) => {
  const {
    activePage,
    setActivePage,
    currentUser,
    isAuthenticated,
    logout,
    setIsAccountSettingsModalOpen,
    openAuthModal,
    claims,
    appointments,
    supportTickets,
    invoices,
    documents,
    roleFocus,
    setRoleFocus
  } = useApp();

  const deniedClaimsCount = claims.filter(c => c.status === 'Denied').length;
  const pendingTicketsCount = supportTickets.filter(t => t.status === 'In Progress' || t.status === 'Escalated to Staff').length;
  const unpaidInvoicesCount = invoices.filter(inv => inv.balanceDue > 0).length;
  const reviewDocsCount = documents.filter(d => d.status === 'Review Required').length;

  const coreNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'queues', label: 'Work Queues', icon: Layers, badge: deniedClaimsCount + unpaidInvoicesCount, badgeVariant: 'warning' },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'voice', label: 'Voice AI Studio', icon: Mic }
  ];

  const clinicalNavItems: NavItem[] = [
    { id: 'patients', label: 'Patients', icon: Users, badge: 25 },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: appointments.length },
    { id: 'providers', label: 'Providers', icon: UserCheck }
  ];

  const revenueNavItems: NavItem[] = [
    { id: 'insurance', label: 'Insurance & Eligibility', icon: ShieldCheck },
    { id: 'claims', label: 'Claims & Denials', icon: FileCheck2, badge: deniedClaimsCount > 0 ? deniedClaimsCount : undefined, badgeVariant: 'danger' },
    { id: 'billing', label: 'Billing & Invoices', icon: CreditCard, badge: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined, badgeVariant: 'warning' }
  ];

  const intelligenceNavItems: NavItem[] = [
    { id: 'documents', label: 'Documents & OCR', icon: FileText, badge: reviewDocsCount > 0 ? reviewDocsCount : undefined, badgeVariant: 'warning' },
    { id: 'escalations', label: 'Staff Escalations', icon: Headphones, badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined, badgeVariant: 'danger' },
    { id: 'knowledge', label: 'SOPs & Guidelines', icon: BookOpen },
    { id: 'agents', label: 'Micro-Agents', icon: Cpu }
  ];

  const governanceNavItems: NavItem[] = [
    { id: 'analytics', label: 'Operations Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Compliance & Audit', icon: Lock },
    { id: 'account-settings', label: 'Account & Security', icon: User },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const handleSelectPage = (id: PageId) => {
    setActivePage(id);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const roleFocusPages: Record<UserRole, PageId[]> = {
    patient: ['dashboard', 'appointments', 'billing', 'documents', 'chat', 'voice', 'account-settings'],
    provider: ['dashboard', 'patients', 'appointments', 'providers', 'documents', 'chat', 'voice', 'account-settings'],
    billing: ['dashboard', 'queues', 'billing', 'claims', 'insurance', 'chat', 'analytics', 'account-settings'],
    claims: ['dashboard', 'queues', 'claims', 'insurance', 'documents', 'escalations', 'chat', 'account-settings'],
    ops_manager: ['dashboard', 'queues', 'escalations', 'knowledge', 'agents', 'analytics', 'audit', 'chat', 'account-settings'],
    admin: [
      'dashboard', 'queues', 'chat', 'voice', 'patients', 'appointments', 'providers',
      'insurance', 'claims', 'billing', 'documents', 'escalations', 'knowledge',
      'agents', 'analytics', 'audit', 'account-settings', 'settings'
    ]
  };

  const renderNavGroup = (title: string, items: NavItem[]) => {
    const visibleItems = items.filter(item => {
      if (item.allowedRoles && !item.allowedRoles.includes(currentUser.role)) {
        return false;
      }
      if (roleFocus === 'myRole' && currentUser.role !== 'admin') {
        const allowed = roleFocusPages[currentUser.role] || [];
        return allowed.includes(item.id);
      }
      return true;
    });

    if (visibleItems.length === 0) return null;

    return (
      <div className="mb-3.5">
        <div className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </div>
        <div className="space-y-0.5">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectPage(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-semibold border-l-2 border-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-teal-700' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-xs font-medium rounded shrink-0 ${
                      item.badgeVariant === 'danger'
                        ? 'bg-rose-50 text-rose-700'
                        : item.badgeVariant === 'warning'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const content = (
    <nav className="flex flex-col h-full overflow-y-auto p-3 select-none" aria-label="Sidebar Application Navigation">
      {/* Role Focus Badge */}
      {roleFocus === 'myRole' && currentUser.role !== 'admin' && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-teal-50/90 border border-teal-200/80 flex items-center justify-between text-xs text-teal-900">
          <span className="font-semibold capitalize truncate">{currentUser.role.replace('_', ' ')} View</span>
          <button
            onClick={() => setRoleFocus('all')}
            className="text-teal-700 hover:text-teal-900 font-medium underline shrink-0 cursor-pointer text-xs"
            title="Switch to view all system modules"
          >
            Show All
          </button>
        </div>
      )}

      {/* Navigation Groups */}
      <div className="flex-1 space-y-1">
        {renderNavGroup('Overview', coreNavItems)}
        {renderNavGroup('Clinical Operations', clinicalNavItems)}
        {renderNavGroup('Financial & Claims', revenueNavItems)}
        {renderNavGroup('Workflows & Staff', intelligenceNavItems)}
        {renderNavGroup('Settings & Audit', governanceNavItems)}
      </div>

      {/* Account Profile & Log Out Footer */}
      {isAuthenticated ? (
        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 shrink-0 space-y-2">
          <div className="flex items-center gap-2.5">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</div>
              <div className="text-[11px] text-slate-500 truncate capitalize">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200/60">
            <button
              onClick={() => {
                if (isMobile && onClose) onClose();
                setIsAccountSettingsModalOpen(true);
              }}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
              title="Account Settings"
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                if (isMobile && onClose) onClose();
                logout();
              }}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 text-xs font-medium border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
              title="Log Out of Session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 shrink-0 space-y-2">
          <div className="text-xs font-semibold text-slate-800">CareOps Portal</div>
          <p className="text-[11px] text-slate-500">Sign in to manage patient records and claims.</p>
          <button
            onClick={() => {
              if (isMobile && onClose) onClose();
              openAuthModal('signin');
            }}
            className="w-full py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium text-center cursor-pointer transition-colors"
          >
            Sign In
          </button>
        </div>
      )}
    </nav>
  );

  // If mobile mode, render slide-out drawer
  if (isMobile) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 lg:hidden flex">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        />

        {/* Drawer Content */}
        <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-lg border-r border-slate-200 z-10 flex flex-col">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="font-semibold text-sm text-slate-800 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-teal-700" />
              <span>Navigation</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Static Sidebar
  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200/80 shrink-0 h-full overflow-hidden">
      {content}
    </aside>
  );
};
