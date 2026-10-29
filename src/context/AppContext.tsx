import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserProfile,
  PageId,
  Patient,
  Provider,
  Department,
  Appointment,
  InsurancePolicy,
  Claim,
  Invoice,
  PaymentRecord,
  DocumentItem,
  SupportTicket,
  KnowledgeArticle,
  AIAgentDefinition,
  AuditLog,
  AIMetrics
} from '../types';
import {
  mockUsers,
  mockPatients,
  mockProviders,
  mockDepartments,
  mockAppointments,
  mockInsurancePolicies,
  mockClaims,
  mockInvoices,
  mockPayments,
  mockDocuments,
  mockSupportTickets,
  mockKnowledgeArticles,
  mockAIAgents,
  mockAuditLogs,
  mockAIMetrics
} from '../data/mockData';
import { apiService } from '../services/apiService';
import {
  auth,
  testConnection,
  signInWithGoogle,
  logoutFirebase,
  onAuthStateChanged,
  FirebaseUser
} from '../lib/firebase';
import {
  seedInitialDataIfEmpty,
  subscribeToPatients,
  subscribeToAppointments,
  subscribeToClaims,
  subscribeToInvoices,
  subscribeToPayments,
  subscribeToSupportTickets,
  subscribeToAuditLogs,
  createAppointmentInFirestore,
  updateAppointmentInFirestore,
  deleteAppointmentInFirestore,
  updateClaimInFirestore,
  updateInvoiceInFirestore,
  createPaymentInFirestore,
  updatePatientInFirestore,
  createSupportTicketInFirestore,
  appendAuditLogInFirestore,
  syncUserProfileToFirestore
} from '../services/firestoreService';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  // Authentication & User State
  isAuthenticated: boolean;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  users: UserProfile[];
  firebaseUser: FirebaseUser | null;
  isFirestoreConnected: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    title?: string;
    department?: string;
    phone?: string;
    patientId?: string;
    providerId?: string;
    npiNumber?: string;
    memberId?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Modals & Navigation
  isAccountSettingsModalOpen: boolean;
  setIsAccountSettingsModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authInitialTab: 'signin' | 'signup';
  setAuthInitialTab: (tab: 'signin' | 'signup') => void;
  openAuthModal: (tab?: 'signin' | 'signup') => void;

  // Patient Quick View
  isPatientQuickViewOpen: boolean;
  setIsPatientQuickViewOpen: (open: boolean) => void;
  quickViewPatient: Patient | null;
  openPatientQuickView: (patientOrId?: Patient | string) => void;
  closePatientQuickView: () => void;

  activePatient: Patient;
  setActivePatientId: (id: string) => void;
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  
  // Data entities
  patients: Patient[];
  providers: Provider[];
  departments: Department[];
  appointments: Appointment[];
  insurancePolicies: InsurancePolicy[];
  claims: Claim[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  documents: DocumentItem[];
  supportTickets: SupportTicket[];
  knowledgeArticles: KnowledgeArticle[];
  aiAgents: AIAgentDefinition[];
  auditLogs: AuditLog[];
  aiMetrics: AIMetrics;
  
  // UI & Actions
  toasts: Toast[];
  addToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  removeToast: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  // Action Handlers
  refreshData: () => Promise<void>;
  bookAppointment: (providerId: string, date: string, time: string, type?: string, reason?: string) => Promise<boolean>;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => Promise<boolean>;
  cancelAppointment: (appointmentId: string, reason?: string) => Promise<boolean>;
  submitAppeal: (claimId: string, appealLetter?: string, priorAuthNumber?: string) => Promise<boolean>;
  payInvoice: (invoiceId: string, amount?: number, paymentMethod?: string) => Promise<boolean>;
  setupPaymentPlan: (invoiceId: string, months: number) => Promise<boolean>;
  uploadDocument: (title: string, documentType: string, fileBase64?: string, mimeType?: string) => Promise<boolean>;
  createEscalation: (subject: string, department: string, reason: string, priority?: string, category?: string) => Promise<boolean>;
  
  // Dark mode & theme persistence
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;

  // Accessibility & WCAG Controls
  textScale: 'normal' | 'large' | 'xlarge';
  setTextScale: (scale: 'normal' | 'large' | 'xlarge') => void;
  isHighContrast: boolean;
  setIsHighContrast: (val: boolean) => void;
  isReducedMotion: boolean;
  setIsReducedMotion: (val: boolean) => void;
  isAccessibilityModalOpen: boolean;
  setIsAccessibilityModalOpen: (open: boolean) => void;

  // Role Focus View
  roleFocus: 'myRole' | 'all';
  setRoleFocus: (mode: 'myRole' | 'all') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    return mockUsers.map(u => ({
      ...u,
      phone: u.phone || '(555) 234-5678',
      twoFactorEnabled: u.twoFactorEnabled ?? true,
      lastLogin: u.lastLogin || '2026-08-29 18:30 PDT',
      notificationPreferences: u.notificationPreferences || {
        emailAlerts: true,
        smsAlerts: true,
        clinicalEscalations: true,
        claimStatusUpdates: true,
        voiceSummaries: true
      }
    }));
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => users[0]); // Default to Eleanor Vance
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);

  const [isAccountSettingsModalOpen, setIsAccountSettingsModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authInitialTab, setAuthInitialTab] = useState<'signin' | 'signup'>('signin');

  // Patient Quick View Modal state
  const [isPatientQuickViewOpen, setIsPatientQuickViewOpen] = useState<boolean>(false);
  const [quickViewPatient, setQuickViewPatient] = useState<Patient | null>(null);

  const [activePatientId, setActivePatientIdState] = useState<string>('PAT-1001');
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Accessibility states
  const [textScale, setTextScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState<boolean>(false);

  // Business user role focus toggle
  const [roleFocus, setRoleFocus] = useState<'myRole' | 'all'>('myRole');
  
  // Healthcare Light Mode strictly enforced
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>('light');
  const [isDarkMode] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.removeItem('careops_theme');
  }, []);

  // HTML accessibility class synchronization
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-scale-large', 'text-scale-xlarge');
    if (textScale === 'large') root.classList.add('text-scale-large');
    if (textScale === 'xlarge') root.classList.add('text-scale-xlarge');
  }, [textScale]);

  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');
  }, [isHighContrast]);

  useEffect(() => {
    const root = document.documentElement;
    if (isReducedMotion) root.classList.add('reduced-motion');
    else root.classList.remove('reduced-motion');
  }, [isReducedMotion]);

  // Sync API auth headers whenever current user or role changes
  useEffect(() => {
    apiService.setAuth(currentUser.id, currentUser.role);
  }, [currentUser]);

  const setThemeMode = (_mode: 'light' | 'dark' | 'system') => {
    setThemeModeState('light');
    document.documentElement.classList.remove('dark');
  };

  const setIsDarkMode = (_val: boolean) => {
    document.documentElement.classList.remove('dark');
  };

  const [toasts, setToasts] = useState<Toast[]>([]);

  // State entities initialized from mocks
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [providers, setProviders] = useState<Provider[]>(mockProviders);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>(mockInsurancePolicies);
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [payments, setPayments] = useState<PaymentRecord[]>(mockPayments);
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(mockSupportTickets);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>(mockKnowledgeArticles);
  const [aiAgents, setAiAgents] = useState<AIAgentDefinition[]>(mockAIAgents);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [aiMetrics, setAiMetrics] = useState<AIMetrics>(mockAIMetrics);

  const addToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Safe patient context selector
  const activePatient: Patient =
    patients.find(p => p.id === activePatientId) || patients[0] || mockPatients[0];

  const setActivePatientId = (id: string) => {
    setActivePatientIdState(id);
    const p = patients.find(patient => patient.id === id);
    if (p) {
      addToast('info', 'Patient Record Active', `Switched active clinical context to ${p.name} (${p.id}).`);
    }
  };

  const openPatientQuickView = (patientOrId?: Patient | string) => {
    if (!patientOrId) {
      setQuickViewPatient(activePatient);
    } else if (typeof patientOrId === 'string') {
      const found = patients.find(p => p.id === patientOrId);
      setQuickViewPatient(found || activePatient);
    } else {
      setQuickViewPatient(patientOrId);
    }
    setIsPatientQuickViewOpen(true);
  };

  const closePatientQuickView = () => {
    setIsPatientQuickViewOpen(false);
  };

  // Firebase Auth State Listener & Firestore Real-Time Subscriptions
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    // 1. Listen to Firebase Auth
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        const isAdmin = user.email === 'bhattiroshaan248@gmail.com' || (user.email && user.email.includes('admin'));
        const role: UserRole = isAdmin ? 'admin' : 'patient';

        const profile: UserProfile = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'CareOps User',
          email: user.email || 'user@example.com',
          role,
          avatar: user.photoURL || undefined,
          title: isAdmin ? 'Chief Operating Officer & Admin' : 'Insured Patient',
          department: isAdmin ? 'Executive Operations' : undefined,
          patientId: role === 'patient' ? 'PAT-1001' : undefined,
          lastLogin: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          twoFactorEnabled: true
        };

        setCurrentUser(profile);
        setIsAuthenticated(true);
        syncUserProfileToFirestore(profile);
      }
    });
    unsubs.push(unsubAuth);

    // 2. Test Connection and Setup Real-time Firestore Sync
    const setupFirestore = async () => {
      try {
        const isConnected = await testConnection();
        setIsFirestoreConnected(isConnected);

        if (isConnected) {
          await seedInitialDataIfEmpty();

          // Attach live Firestore listeners for relational data
          const unsubApts = subscribeToAppointments(remoteApts => {
            if (remoteApts && remoteApts.length > 0) {
              setAppointments(remoteApts);
            }
          });
          unsubs.push(unsubApts);

          const unsubClaims = subscribeToClaims(remoteClaims => {
            if (remoteClaims && remoteClaims.length > 0) {
              setClaims(remoteClaims);
            }
          });
          unsubs.push(unsubClaims);

          const unsubInvoices = subscribeToInvoices(remoteInvoices => {
            if (remoteInvoices && remoteInvoices.length > 0) {
              setInvoices(remoteInvoices);
            }
          });
          unsubs.push(unsubInvoices);

          const unsubTickets = subscribeToSupportTickets(remoteTickets => {
            if (remoteTickets && remoteTickets.length > 0) {
              setSupportTickets(remoteTickets);
            }
          });
          unsubs.push(unsubTickets);

          const unsubAudit = subscribeToAuditLogs(remoteLogs => {
            if (remoteLogs && remoteLogs.length > 0) {
              setAuditLogs(remoteLogs);
            }
          });
          unsubs.push(unsubAudit);

          const unsubPatients = subscribeToPatients(remotePatients => {
            if (remotePatients && remotePatients.length > 0) {
              setPatients(remotePatients);
            }
          });
          unsubs.push(unsubPatients);

          const unsubPayments = subscribeToPayments(remotePays => {
            if (remotePays && remotePays.length > 0) {
              setPayments(remotePays);
            }
          });
          unsubs.push(unsubPayments);
        }
      } catch (err) {
        console.warn('Firestore initialization or listener setup notice:', err);
      }
    };

    setupFirestore();

    return () => {
      unsubs.forEach(u => u());
    };
  }, []);

  // Google Sign-In via Firebase
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        setFirebaseUser(user);
        const isAdmin = user.email === 'bhattiroshaan248@gmail.com' || (user.email && user.email.includes('admin'));
        const role: UserRole = isAdmin ? 'admin' : 'patient';

        const profile: UserProfile = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'CareOps User',
          email: user.email || 'user@example.com',
          role,
          avatar: user.photoURL || undefined,
          title: isAdmin ? 'Chief Operating Officer & Admin' : 'Insured Patient',
          department: isAdmin ? 'Executive Operations' : undefined,
          patientId: role === 'patient' ? 'PAT-1001' : undefined,
          lastLogin: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          twoFactorEnabled: true
        };

        setCurrentUser(profile);
        setIsAuthenticated(true);
        setIsAuthModalOpen(false);
        await syncUserProfileToFirestore(profile);
        addToast('success', 'Google Authentication Verified', `Signed in as ${profile.name} (${profile.email}) with secure Firebase token.`);
        return true;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      addToast('error', 'Google Sign-In Failed', error instanceof Error ? error.message : 'Authentication could not be completed.');
    }
    return false;
  };

  const login = async (email: string, _password?: string, forcedRole?: UserRole): Promise<{ success: boolean; message?: string }> => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const updated = {
        ...existing,
        role: forcedRole || existing.role,
        lastLogin: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
      };
      setCurrentUser(updated);
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);

      if (updated.patientId) {
        setActivePatientIdState(updated.patientId);
      }

      syncUserProfileToFirestore(updated);
      addToast('success', 'Session Authenticated', `Welcome back, ${updated.name} (${updated.role.toUpperCase()})`);
      return { success: true };
    }

    const defaultRole: UserRole = forcedRole || (email.includes('doc') || email.includes('md') ? 'provider' : email.includes('admin') ? 'admin' : 'patient');
    const newUser: UserProfile = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: email.toLowerCase(),
      role: defaultRole,
      title: defaultRole === 'provider' ? 'Attending Physician' : defaultRole === 'admin' ? 'Healthcare System Administrator' : 'Policyholder',
      department: defaultRole === 'patient' ? undefined : 'Clinical Operations',
      patientId: defaultRole === 'patient' ? 'PAT-1001' : undefined,
      lastLogin: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      twoFactorEnabled: true
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    syncUserProfileToFirestore(newUser);

    addToast('success', 'Session Created', `Signed in as ${newUser.name}`);
    return { success: true };
  };

  const signup = async (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    title?: string;
    department?: string;
    phone?: string;
    patientId?: string;
    providerId?: string;
    npiNumber?: string;
    memberId?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!data.name.trim() || !data.email.trim()) {
      return { success: false, message: 'Please provide full name and valid email.' };
    }

    const newUser: UserProfile = {
      id: `USR-${Date.now().toString().slice(-5)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: data.title || (data.role === 'provider' ? 'Medical Practitioner' : data.role === 'patient' ? 'Insured Patient' : 'Healthcare Operations Staff'),
      department: data.department || (data.role === 'patient' ? undefined : 'Clinical Administration'),
      patientId: data.patientId || (data.role === 'patient' ? 'PAT-1001' : undefined),
      providerId: data.providerId,
      npiNumber: data.npiNumber,
      memberId: data.memberId,
      phone: data.phone || '(555) 789-0123',
      twoFactorEnabled: true,
      lastLogin: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      notificationPreferences: {
        emailAlerts: true,
        smsAlerts: true,
        clinicalEscalations: true,
        claimStatusUpdates: true,
        voiceSummaries: true
      }
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    if (newUser.patientId) {
      setActivePatientIdState(newUser.patientId);
    }

    syncUserProfileToFirestore(newUser);
    addToast('success', 'Account Registered & Activated', `Welcome to CareOps Healthcare Platform, ${newUser.name}!`);
    return { success: true };
  };

  const logout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      console.warn('Firebase logout notice:', e);
    }
    setFirebaseUser(null);
    setIsAuthenticated(false);
    setIsAccountSettingsModalOpen(false);
    addToast('info', 'Logged Out', 'Your HIPAA-encrypted clinical session has been securely closed.');
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...updates };
      setUsers(all => all.map(u => u.id === updated.id ? updated : u));
      syncUserProfileToFirestore(updated);
      return updated;
    });
    addToast('success', 'Account Profile Updated', 'Your profile details and notification settings have been saved.');
  };

  const openAuthModal = (tab: 'signin' | 'signup' = 'signin') => {
    setAuthInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  // Fetch initial data from server on mount
  const refreshData = async () => {
    try {
      const [pts, prvs, deps, apts, ins, clms, invs, pays, docs, tcks, kbs, agts, auds, mtrs] = await Promise.all([
        apiService.getPatients().catch(() => mockPatients),
        apiService.getProviders().catch(() => mockProviders),
        apiService.getDepartments().catch(() => mockDepartments),
        apiService.getAppointments().catch(() => mockAppointments),
        apiService.getInsurance().catch(() => mockInsurancePolicies),
        apiService.getClaims().catch(() => mockClaims),
        apiService.getInvoices().catch(() => mockInvoices),
        apiService.getPayments().catch(() => mockPayments),
        apiService.getDocuments().catch(() => mockDocuments),
        apiService.getTickets().catch(() => mockSupportTickets),
        apiService.getKnowledge().catch(() => mockKnowledgeArticles),
        apiService.getAgents().catch(() => mockAIAgents),
        apiService.getAuditLogs().catch(() => mockAuditLogs),
        apiService.getMetrics().catch(() => mockAIMetrics)
      ]);

      if (pts) setPatients(pts);
      if (prvs) setProviders(prvs);
      if (deps) setDepartments(deps);
      if (apts) setAppointments(apts);
      if (ins) setInsurancePolicies(ins);
      if (clms) setClaims(clms);
      if (invs) setInvoices(invs);
      if (pays) setPayments(pays);
      if (docs) setDocuments(docs);
      if (tcks) setSupportTickets(tcks);
      if (kbs) setKnowledgeArticles(kbs);
      if (agts) setAiAgents(agts);
      if (auds) setAuditLogs(auds);
      if (mtrs) setAiMetrics(mtrs);
    } catch (err) {
      console.warn("Could not refresh from server, utilizing local state:", err);
    }
  };

  // Action implementations with live Firestore database persistence
  const bookAppointment = async (providerId: string, date: string, time: string, type?: string, reason?: string) => {
    try {
      const res = await apiService.bookAppointment({
        patientId: activePatient.id,
        providerId,
        date,
        time,
        type,
        reasonForVisit: reason
      });

      if (res.success && res.appointment) {
        setAppointments(prev => [res.appointment, ...prev]);
        setAiMetrics(prev => ({ ...prev, appointmentsBookedAI: prev.appointmentsBookedAI + 1 }));

        // Persist to authentic Firestore
        createAppointmentInFirestore(res.appointment);

        // Append HIPAA audit log to Firestore
        const auditEntry: AuditLog = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'Appointment Booked',
          resourceType: 'Appointment',
          resourceId: res.appointment.id,
          result: 'Success',
          ipAddress: '192.168.1.104',
          phiAccessed: true,
          notes: `Encounter scheduled with ${res.appointment.providerName} for ${date} at ${time}.`
        };
        appendAuditLogInFirestore(auditEntry);

        addToast('success', 'Appointment Confirmed & Saved', `Successfully scheduled with ${res.appointment.providerName} for ${date} at ${time}. Persistent in Firestore.`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const rescheduleAppointment = async (appointmentId: string, newDate: string, newTime: string) => {
    try {
      const res = await apiService.rescheduleAppointment({
        appointmentId,
        newDate,
        newTime
      });

      if (res.success && res.appointment) {
        setAppointments(prev => prev.map(a => a.id === appointmentId ? res.appointment : a));

        // Persist to Firestore
        updateAppointmentInFirestore(appointmentId, { date: newDate, time: newTime, status: 'Rescheduled' });

        const auditEntry: AuditLog = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'Appointment Rescheduled',
          resourceType: 'Appointment',
          resourceId: appointmentId,
          result: 'Success',
          ipAddress: '192.168.1.104',
          phiAccessed: true,
          notes: `Updated time to ${newDate} at ${newTime}.`
        };
        appendAuditLogInFirestore(auditEntry);

        addToast('success', 'Appointment Rescheduled', `Updated appointment ${appointmentId} to ${newDate} at ${newTime}. Saved to Firestore.`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const cancelAppointment = async (appointmentId: string, reason?: string) => {
    try {
      const res = await apiService.cancelAppointment({
        appointmentId,
        reason
      });

      if (res.success && res.appointment) {
        setAppointments(prev => prev.map(a => a.id === appointmentId ? res.appointment : a));

        // Persist cancellation to Firestore
        updateAppointmentInFirestore(appointmentId, { status: 'Cancelled' });

        const auditEntry: AuditLog = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'Appointment Cancelled',
          resourceType: 'Appointment',
          resourceId: appointmentId,
          result: 'Success',
          ipAddress: '192.168.1.104',
          phiAccessed: false,
          notes: reason || 'Patient or provider initiated cancellation.'
        };
        appendAuditLogInFirestore(auditEntry);

        addToast('info', 'Appointment Cancelled', `Appointment ${appointmentId} has been cancelled in Firestore.`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const submitAppeal = async (claimId: string, appealLetter?: string, priorAuthNumber?: string) => {
    try {
      const res = await apiService.submitAppeal({
        claimId,
        appealLetter,
        priorAuthNumber
      });

      if (res.success && res.claim) {
        setClaims(prev => prev.map(c => c.id === claimId ? res.claim : c));
        if (res.ticket) {
          setSupportTickets(prev => [res.ticket, ...prev]);
          createSupportTicketInFirestore(res.ticket);
        }
        setAiMetrics(prev => ({ ...prev, claimsAppealedAI: prev.claimsAppealedAI + 1 }));

        // Persist claim appeal state to Firestore
        updateClaimInFirestore(claimId, {
          status: 'Appealed',
          appealStatus: 'Submitted',
          appealLetter,
          priorAuthNumber
        });

        const auditEntry: AuditLog = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'Claim Appeal Submitted',
          resourceType: 'Claim',
          resourceId: claimId,
          result: 'Success',
          ipAddress: '192.168.1.104',
          phiAccessed: true,
          notes: `Prior Auth appeal submitted to ${res.claim.payerName}.`
        };
        appendAuditLogInFirestore(auditEntry);

        addToast('success', 'Claim Appeal Submitted', `Level 1 Prior Auth Appeal for ${claimId} successfully submitted to ${res.claim.payerName} and saved in Firestore.`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const payInvoice = async (invoiceId: string, amount?: number, paymentMethod?: string) => {
    try {
      const res = await apiService.payInvoice({
        invoiceId,
        amount,
        paymentMethod
      });

      if (res.success && res.invoice) {
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? res.invoice : inv));
        if (res.payment) {
          setPayments(prev => [res.payment, ...prev]);
          createPaymentInFirestore(res.payment);
        }
        const updatedBal = Math.max(0, activePatient.outstandingBalance - (amount || res.invoice.balanceDue));
        setPatients(prev => prev.map(p => p.id === activePatient.id ? {
          ...p,
          outstandingBalance: updatedBal
        } : p));
        updatePatientInFirestore(activePatient.id, { outstandingBalance: updatedBal });

        // Persist invoice payment status to Firestore
        updateInvoiceInFirestore(invoiceId, {
          status: 'Paid',
          balanceDue: 0
        });

        const auditEntry: AuditLog = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'Invoice Payment Received',
          resourceType: 'Invoice',
          resourceId: invoiceId,
          result: 'Success',
          ipAddress: '192.168.1.104',
          phiAccessed: false,
          notes: `Payment of $${(amount || res.invoice.balanceDue).toFixed(2)} recorded in Firestore ledger.`
        };
        appendAuditLogInFirestore(auditEntry);

        addToast('success', 'Payment Processed', `Payment of $${(amount || res.invoice.balanceDue).toFixed(2)} received and synced to database.`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const setupPaymentPlan = async (invoiceId: string, months: number) => {
    try {
      const res = await apiService.setupPaymentPlan({
        invoiceId,
        months
      });

      if (res.success && res.invoice) {
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? res.invoice : inv));
        updateInvoiceInFirestore(invoiceId, { status: 'Payment Plan Active' });

        addToast('success', 'Payment Plan Active', `Activated ${months}-month installment schedule for invoice ${invoiceId}. Synced to database.`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const uploadDocument = async (title: string, documentType: string, fileBase64?: string, mimeType?: string) => {
    try {
      const res = await apiService.extractDocument({
        title,
        documentType,
        patientId: activePatient.id,
        fileBase64,
        mimeType
      });

      if (res.success && res.document) {
        setDocuments(prev => [res.document, ...prev]);
        addToast('success', 'Document AI Ingestion Complete', `Extracted ${res.document.extractedFields.length} structured fields from ${title}.`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const createEscalation = async (subject: string, department: string, reason: string, priority?: string, category?: string) => {
    try {
      const res = await apiService.createEscalation({
        patientId: activePatient.id,
        subject,
        department,
        reasonForEscalation: reason,
        priority,
        category
      });

      if (res.success && res.ticket) {
        setSupportTickets(prev => [res.ticket, ...prev]);

        // Persist support ticket to Firestore
        createSupportTicketInFirestore(res.ticket);

        const auditEntry: AuditLog = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'Support Ticket Created',
          resourceType: 'Support Ticket',
          resourceId: res.ticket.id,
          result: 'Success',
          ipAddress: '192.168.1.104',
          phiAccessed: true,
          notes: `Escalation dispatched to ${department}.`
        };
        appendAuditLogInFirestore(auditEntry);

        addToast('warning', 'Escalation Dispatched', `Ticket ${res.ticket.id} transferred to ${department} and stored in database.`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        setCurrentUser,
        users,
        firebaseUser,
        isFirestoreConnected,
        login,
        loginWithGoogle,
        signup,
        logout,
        updateUserProfile,
        isAccountSettingsModalOpen,
        setIsAccountSettingsModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authInitialTab,
        setAuthInitialTab,
        openAuthModal,
        isPatientQuickViewOpen,
        setIsPatientQuickViewOpen,
        quickViewPatient,
        openPatientQuickView,
        closePatientQuickView,
        activePatient,
        setActivePatientId,
        activePage,
        setActivePage,
        patients,
        providers,
        departments,
        appointments,
        insurancePolicies,
        claims,
        invoices,
        payments,
        documents,
        supportTickets,
        knowledgeArticles,
        aiAgents,
        auditLogs,
        aiMetrics,
        toasts,
        addToast,
        removeToast,
        searchQuery,
        setSearchQuery,
        refreshData,
        bookAppointment,
        rescheduleAppointment,
        cancelAppointment,
        submitAppeal,
        payInvoice,
        setupPaymentPlan,
        uploadDocument,
        createEscalation,
        isDarkMode,
        setIsDarkMode,
        themeMode,
        setThemeMode,
        textScale,
        setTextScale,
        isHighContrast,
        setIsHighContrast,
        isReducedMotion,
        setIsReducedMotion,
        isAccessibilityModalOpen,
        setIsAccessibilityModalOpen,
        roleFocus,
        setRoleFocus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
