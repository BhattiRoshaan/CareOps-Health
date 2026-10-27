import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Stethoscope,
  Receipt,
  FileCheck2,
  Sliders,
  Cpu,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  KeyRound,
  FileText
} from 'lucide-react';
import { UserRole } from '../../types';

interface AuthPageProps {
  initialTab?: 'signin' | 'signup';
  isModal?: boolean;
  onClose?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialTab = 'signin',
  isModal = false,
  onClose
}) => {
  const { login, loginWithGoogle, signup, users, addToast, isFirestoreConnected } = useApp();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  
  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmittingSignIn, setIsSubmittingSignIn] = useState(false);

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpRole, setSignUpRole] = useState<UserRole>('patient');
  const [signUpTitle, setSignUpTitle] = useState('');
  const [signUpDepartment, setSignUpDepartment] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpNpi, setSignUpNpi] = useState('');
  const [signUpMemberId, setSignUpMemberId] = useState('');
  const [agreedToHipaa, setAgreedToHipaa] = useState(true);
  const [isSubmittingSignUp, setIsSubmittingSignUp] = useState(false);

  // Forgot Password State
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Quick Demo Personas
  const demoPersonas: {
    role: UserRole;
    name: string;
    title: string;
    email: string;
    badge: string;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      role: 'patient',
      name: 'Eleanor Vance',
      title: 'Patient (Insured / $420 Balance)',
      email: 'eleanor.vance@example.com',
      badge: 'Patient Portal',
      icon: User,
      accentColor: 'border-blue-200 hover:border-blue-400 bg-blue-50/60 hover:bg-blue-50 text-blue-900'
    },
    {
      role: 'provider',
      name: 'Dr. Marcus Chen, MD',
      title: 'Chief of Cardiology (NPI 1982736450)',
      email: 'marcus.chen@careops-health.org',
      badge: 'Physician / EHR',
      icon: Stethoscope,
      accentColor: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-900'
    },
    {
      role: 'billing',
      name: 'Sarah Jenkins, CRCR',
      title: 'Revenue Cycle Specialist',
      email: 'sarah.jenkins@careops-health.org',
      badge: 'Revenue & RCM',
      icon: Receipt,
      accentColor: 'border-purple-200 hover:border-purple-400 bg-purple-50/60 hover:bg-purple-50 text-purple-900'
    },
    {
      role: 'claims',
      name: 'David Rodriguez, CPC',
      title: 'Prior Auth & Denial Auditor',
      email: 'david.rodriguez@careops-health.org',
      badge: 'Claims Intelligence',
      icon: FileCheck2,
      accentColor: 'border-amber-200 hover:border-amber-400 bg-amber-50/60 hover:bg-amber-50 text-amber-900'
    },
    {
      role: 'ops_manager',
      name: 'Alex Mercer',
      title: 'AI Operations & Automation Lead',
      email: 'alex.mercer@careops-health.org',
      badge: 'AI Orchestrator',
      icon: Cpu,
      accentColor: 'border-teal-200 hover:border-teal-400 bg-teal-50/60 hover:bg-teal-50 text-teal-900'
    },
    {
      role: 'admin',
      name: 'Dr. Evelyn Reed, MHA',
      title: 'Chief Operating Officer',
      email: 'evelyn.reed@careops-health.org',
      badge: 'Executive Admin',
      icon: Sliders,
      accentColor: 'border-slate-300 hover:border-slate-500 bg-slate-100 hover:bg-slate-200/80 text-slate-900'
    }
  ];

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim()) {
      addToast('error', 'Email Required', 'Please enter your registered email address.');
      return;
    }

    setIsSubmittingSignIn(true);
    try {
      const res = await login(signInEmail.trim(), signInPassword);
      if (res.success && onClose) {
        onClose();
      }
    } finally {
      setIsSubmittingSignIn(false);
    }
  };

  const handleQuickSignIn = async (email: string, role: UserRole) => {
    setIsSubmittingSignIn(true);
    try {
      const res = await login(email, 'password123', role);
      if (res.success && onClose) {
        onClose();
      }
    } finally {
      setIsSubmittingSignIn(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim() || !signUpEmail.trim()) {
      addToast('error', 'Missing Information', 'Please provide your full name and work/personal email.');
      return;
    }

    if (signUpPassword && signUpPassword.length < 6) {
      addToast('error', 'Password Too Short', 'Password must be at least 6 characters long.');
      return;
    }

    if (signUpPassword && signUpPassword !== signUpConfirmPassword) {
      addToast('error', 'Passwords Do Not Match', 'Please confirm that both passwords match.');
      return;
    }

    if (!agreedToHipaa) {
      addToast('warning', 'HIPAA Consent Required', 'Please acknowledge the HIPAA Data Security Agreement.');
      return;
    }

    setIsSubmittingSignUp(true);
    try {
      const res = await signup({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        role: signUpRole,
        title: signUpTitle.trim() || undefined,
        department: signUpDepartment.trim() || undefined,
        phone: signUpPhone.trim() || undefined,
        npiNumber: signUpNpi.trim() || undefined,
        memberId: signUpMemberId.trim() || undefined
      });

      if (res.success && onClose) {
        onClose();
      }
    } finally {
      setIsSubmittingSignUp(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsSendingReset(true);
    setTimeout(() => {
      setIsSendingReset(false);
      setResetSent(true);
      addToast('success', 'Reset Link Dispatched', `A secure password reset link has been emailed to ${forgotEmail}.`);
    }, 1000);
  };

  const content = (
    <div className="w-full max-w-4xl mx-auto my-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col md:flex-row">
      {/* Left Column: Branding, HIPAA Badges & Quick Personas */}
      <div className="md:w-5/12 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-teal-800/40">
        <div>
          <div className="flex items-center justify-between mb-4">
            <Logo showTagline={true} />
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                ✕
              </button>
            )}
          </div>

          <div className="space-y-2 mt-4 mb-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              HIPAA & HITRUST Certified
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Autonomous Healthcare Operations
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect to intelligent clinical scheduling, EDI 835 denial appeals, automated patient revenue cycle management, and real-time Voice AI.
            </p>
          </div>

          {/* One-Click Quick Demo Accounts */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-[11px] font-bold text-teal-300 uppercase tracking-wider flex items-center justify-between">
              <span>Instant Persona Logins</span>
              <span className="text-[10px] text-slate-400 font-normal">1-Click Access</span>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {demoPersonas.map((persona) => {
                const Icon = persona.icon;
                return (
                  <button
                    key={persona.role}
                    type="button"
                    onClick={() => handleQuickSignIn(persona.email, persona.role)}
                    className={`w-full p-2 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 hover:border-teal-500/50`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-slate-900 text-teal-300 group-hover:text-teal-200">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-100 truncate group-hover:text-teal-200">
                          {persona.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {persona.title}
                        </div>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-950 text-teal-300 border border-teal-800/80 shrink-0">
                      {persona.badge.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>256-Bit Encrypted</span>
          </span>
          <span>SOC2 Type II</span>
          <span>HL7 FHIR R4</span>
        </div>
      </div>

      {/* Right Column: Sign In / Sign Up Forms */}
      <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between bg-white relative">
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="hidden md:block absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        )}

        <div>
          {/* Tabs Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setIsForgotPasswordOpen(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'signin' && !isForgotPasswordOpen
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setIsForgotPasswordOpen(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'signup' && !isForgotPasswordOpen
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && !isForgotPasswordOpen && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Welcome Back</h3>
                <p className="text-xs text-slate-500">Sign in with Google Firebase Auth or your registered email</p>
              </div>

              {/* Google Sign-in with Firebase Auth */}
              <div>
                <button
                  type="button"
                  onClick={async () => {
                    setIsSubmittingGoogle(true);
                    const ok = await loginWithGoogle();
                    setIsSubmittingGoogle(false);
                    if (ok && isModal && onClose) onClose();
                  }}
                  disabled={isSubmittingGoogle}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isSubmittingGoogle ? 'Signing in with Google...' : 'Continue with Google (Firebase Auth)'}</span>
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 shrink-0">
                    or email sign-in
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. eleanor.vance@example.com or dr.chen@hospital.org"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Remember this device for 30 days</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingSignIn}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmittingSignIn ? 'Verifying Credentials...' : 'Sign In to CareOps'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Tip: You can also click any of the <strong>Instant Persona Logins</strong> on the left to sign in as a Patient, Physician, Billing Specialist, or Administrator.
                </span>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {activeTab === 'signup' && !isForgotPasswordOpen && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create CareOps Account</h3>
                <p className="text-xs text-slate-500">Register as a patient, physician, billing agent, or hospital administrator</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Your Role *
                  </label>
                  <select
                    value={signUpRole}
                    onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 font-semibold"
                  >
                    <option value="patient">Patient / Insured Policyholder</option>
                    <option value="provider">Physician / Medical Specialist</option>
                    <option value="billing">Billing & Revenue Cycle Specialist</option>
                    <option value="claims">Claims & Prior Authorization Auditor</option>
                    <option value="ops_manager">AI Operations & Workflow Manager</option>
                    <option value="admin">Healthcare Administrator / Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Foster or John Doe"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@hospital.org or personal email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                {signUpRole === 'provider' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NPI Number (10 Digits)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1982736450"
                      value={signUpNpi}
                      onChange={(e) => setSignUpNpi(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                    />
                  </div>
                ) : signUpRole === 'patient' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Insurance Member ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BCB-99823412"
                      value={signUpMemberId}
                      onChange={(e) => setSignUpMemberId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department / Clinic
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Patient Operations"
                      value={signUpDepartment}
                      onChange={(e) => setSignUpDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password (Min. 6 chars)
                  </label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    placeholder="Create secure password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToHipaa}
                    onChange={(e) => setAgreedToHipaa(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>
                    I agree to the <strong>HIPAA Security Safeguards</strong> and authorize encrypted audit logging for all patient care operations.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmittingSignUp}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmittingSignUp ? 'Provisioning Account...' : 'Complete Sign Up & Enter'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD MODAL VIEW */}
          {isForgotPasswordOpen && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Your Password</h3>
                <p className="text-xs text-slate-500">Enter your email and we'll send a 6-digit verification security link</p>
              </div>

              {resetSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Reset Instructions Dispatched</span>
                  </div>
                  <p>
                    Check your inbox at <strong>{forgotEmail}</strong> for your one-time authorization link.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordOpen(false);
                      setResetSent(false);
                    }}
                    className="mt-2 text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                  >
                    ← Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. eleanor.vance@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingReset || !forgotEmail.trim()}
                      className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs"
                    >
                      {isSendingReset ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Bottom Switch Note */}
        <div className="pt-4 mt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          {activeTab === 'signin' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className="font-bold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
              >
                Sign up here
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className="font-bold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      {content}
    </div>
  );
};
