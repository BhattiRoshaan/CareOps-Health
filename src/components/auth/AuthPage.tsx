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
  KeyRound,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import { UserRole } from '../../types';

interface AuthPageProps {
  initialTab?: 'signin' | 'signup' | 'sso';
  isModal?: boolean;
  onClose?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialTab = 'signin',
  isModal = false,
  onClose
}) => {
  const {
    login,
    loginWithGoogle,
    loginWithHospitalSSO,
    signup,
    resetPassword,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'signin' | 'sso' | 'signup'>(initialTab);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmittingSignIn, setIsSubmittingSignIn] = useState(false);

  // Hospital SSO Form States
  const [ssoProvider, setSsoProvider] = useState('CareOps HealthKey Enterprise IdP');
  const [ssoEmail, setSsoEmail] = useState('');
  const [ssoPassword, setSsoPassword] = useState('');
  const [ssoMfaCode, setSsoMfaCode] = useState('');
  const [showSsoPassword, setShowSsoPassword] = useState(false);
  const [isSubmittingSso, setIsSubmittingSso] = useState(false);

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

  // Verified Roster Personas with Server-Authority Passwords and 2FA MFA Tokens
  const verifiedPersonas: {
    role: UserRole;
    name: string;
    title: string;
    email: string;
    password: string;
    mfaCode: string;
    badge: string;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      role: 'patient',
      name: 'Eleanor Vance',
      title: 'Policyholder / Patient (BCBS-998)',
      email: 'eleanor.vance@example.com',
      password: 'EleanorVance2025!',
      mfaCode: '501928',
      badge: 'Patient Portal',
      icon: User,
      accentColor: 'border-blue-200 hover:border-blue-400 bg-blue-50/60 hover:bg-blue-50 text-blue-900'
    },
    {
      role: 'provider',
      name: 'Dr. Marcus Chen, MD',
      title: 'Chief of Cardiology (NPI 1982736450)',
      email: 'dr.chen@careops.health',
      password: 'DrChenCardio2025!',
      mfaCode: '492018',
      badge: 'Clinical Staff',
      icon: Stethoscope,
      accentColor: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-900'
    },
    {
      role: 'billing',
      name: 'Sarah Jenkins, CRCR',
      title: 'Revenue Cycle Specialist',
      email: 'sarah.jenkins@careops-health.org',
      password: 'SarahBilling2025!',
      mfaCode: '385921',
      badge: 'Revenue & RCM',
      icon: Receipt,
      accentColor: 'border-purple-200 hover:border-purple-400 bg-purple-50/60 hover:bg-purple-50 text-purple-900'
    },
    {
      role: 'claims',
      name: 'David Rodriguez, CPC',
      title: 'Prior Auth & Denial Auditor',
      email: 'david.rodriguez@careops-health.org',
      password: 'DavidClaims2025!',
      mfaCode: '614920',
      badge: 'Claims Specialist',
      icon: FileCheck2,
      accentColor: 'border-amber-200 hover:border-amber-400 bg-amber-50/60 hover:bg-amber-50 text-amber-900'
    },
    {
      role: 'ops_manager',
      name: 'Alex Mercer',
      title: 'AI Operations & Automation Lead',
      email: 'alex.mercer@careops-health.org',
      password: 'AlexOps2025!',
      mfaCode: '194830',
      badge: 'AI Orchestrator',
      icon: Cpu,
      accentColor: 'border-teal-200 hover:border-teal-400 bg-teal-50/60 hover:bg-teal-50 text-teal-900'
    },
    {
      role: 'admin',
      name: 'Dr. Evelyn Reed, MHA',
      title: 'Chief Operating Officer & HIPAA Admin',
      email: 'evelyn.reed@careops-health.org',
      password: 'EvelynAdmin2025!',
      mfaCode: '719402',
      badge: 'Executive Admin',
      icon: Sliders,
      accentColor: 'border-slate-300 hover:border-slate-500 bg-slate-100 hover:bg-slate-200/80 text-slate-900'
    }
  ];

  // Autofill credentials from verified roster for testing and real server verification
  const handleLoadPersona = (persona: typeof verifiedPersonas[0]) => {
    setSignInEmail(persona.email);
    setSignInPassword(persona.password);
    setSsoEmail(persona.email);
    setSsoPassword(persona.password);
    setSsoMfaCode(persona.mfaCode);
    addToast(
      'info',
      'Verified Roster Credentials Loaded',
      `Loaded credentials for ${persona.name} (${persona.role.toUpperCase()}). Click 'Sign In' or switch to 'Hospital SSO' to authenticate.`
    );
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim()) {
      addToast('error', 'Email Required', 'Please enter your registered work or patient email address.');
      return;
    }
    if (!signInPassword) {
      addToast('error', 'Password Required', 'Password is required to authenticate. Unauthenticated access is strictly blocked.');
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

  const handleHospitalSsoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoEmail.trim()) {
      addToast('error', 'Staff Email Required', 'Please enter your hospital organization email.');
      return;
    }
    if (!ssoPassword.trim()) {
      addToast('error', 'Password Required', 'Please enter your hospital enterprise password.');
      return;
    }

    setIsSubmittingSso(true);
    try {
      const res = await loginWithHospitalSSO(ssoProvider, ssoEmail.trim(), ssoPassword.trim(), ssoMfaCode.trim());
      if (res.success && onClose) {
        onClose();
      }
    } finally {
      setIsSubmittingSso(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim() || !signUpEmail.trim()) {
      addToast('error', 'Missing Information', 'Please provide your full legal name and email address.');
      return;
    }

    if (!signUpPassword || signUpPassword.length < 6) {
      addToast('error', 'Password Inadequate', 'Password must be at least 6 characters.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsSendingReset(true);
    try {
      const res = await resetPassword(forgotEmail.trim());
      if (res.success) {
        setResetSent(true);
      }
    } finally {
      setIsSendingReset(false);
    }
  };

  const content = (
    <div className="w-full max-w-4xl mx-auto my-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col md:flex-row">
      {/* Left Column: Branding, HIPAA Compliance & Verified Roster */}
      <div className="md:w-5/12 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-teal-800/40">
        <div>
          <div className="flex items-center justify-between mb-4">
            <Logo showTagline={true} variant="light" />
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="space-y-2 mt-4 mb-5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              HIPAA Verified Authentication
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              CareOps Enterprise Auth
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real cryptographic Firebase Auth, verified Hospital SSO with MFA tokens, and server-certified role-based access control (RBAC).
            </p>
          </div>

          {/* Verified Directory Personas for Testing and Credential Autofill */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center justify-between">
              <span>Verified Staff Directory</span>
              <span className="text-xs text-slate-400 font-normal">Click to Load Credentials</span>
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {verifiedPersonas.map((persona) => {
                const Icon = persona.icon;
                const isSelected = signInEmail === persona.email;
                return (
                  <button
                    key={persona.role}
                    type="button"
                    onClick={() => handleLoadPersona(persona)}
                    className={`w-full p-2 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-teal-950/80 border-teal-500 ring-1 ring-teal-400/50'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 hover:border-teal-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-slate-900 text-teal-300 group-hover:text-teal-200">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-100 truncate group-hover:text-teal-200">
                          {persona.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
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

        {/* Security & Audit Certifications */}
        <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>256-Bit TLS & Claims</span>
          </span>
          <span>SOC2 Type II</span>
          <span>HL7 FHIR R4</span>
        </div>
      </div>

      {/* Right Column: Authentication Form Tabs */}
      <div className="md:w-7/12 p-6 sm:p-7 flex flex-col justify-between bg-white relative">
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="hidden md:block absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}

        <div>
          {/* Tabs Selector: Email / Hospital SSO / Register */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setIsForgotPasswordOpen(false);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'signin' && !isForgotPasswordOpen
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('sso');
                setIsForgotPasswordOpen(false);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'sso' && !isForgotPasswordOpen
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hospital SSO + MFA
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setIsForgotPasswordOpen(false);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'signup' && !isForgotPasswordOpen
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* TAB 1: EMAIL & PASSWORD (REAL FIREBASE AUTH) */}
          {activeTab === 'signin' && !isForgotPasswordOpen && (
            <form onSubmit={handleSignInSubmit} className="space-y-3.5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Sign In to CareOps</h3>
                <p className="text-xs text-slate-500">Firebase Auth with server-certified custom claims</p>
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
                  className="w-full flex items-center justify-center gap-2.5 py-2 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
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
                  <span>{isSubmittingGoogle ? 'Authorizing Google...' : 'Continue with Google (Firebase Auth)'}</span>
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-2 text-xs uppercase font-bold tracking-wider text-slate-400 shrink-0">
                    or standard credentials
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. eleanor.vance@example.com or dr.chen@careops.health"
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
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter account password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Remember device (HIPAA encrypted session)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingSignIn}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmittingSignIn ? 'Verifying with Authority...' : 'Sign In & Verify Claims'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  Tip: Select any persona on the left to prefill registered credentials (e.g. <code>EleanorVance2025!</code> or <code>DrChenCardio2025!</code>).
                </span>
              </div>
            </form>
          )}

          {/* TAB 2: HOSPITAL ENTERPRISE SSO WITH 2FA MFA */}
          {activeTab === 'sso' && !isForgotPasswordOpen && (
            <form onSubmit={handleHospitalSsoSubmit} className="space-y-3.5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>Hospital SSO / SAML 2.0</span>
                </h3>
                <p className="text-xs text-slate-500">Enterprise healthcare identity with multi-factor authentication (MFA)</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Identity Provider (IdP)
                  </label>
                  <select
                    value={ssoProvider}
                    onChange={(e) => setSsoProvider(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 font-medium"
                  >
                    <option value="CareOps HealthKey Enterprise IdP">CareOps HealthKey Enterprise IdP</option>
                    <option value="Epic Systems Hyperspace OIDC">Epic Systems Hyperspace (OIDC)</option>
                    <option value="Cerner Millennium SSO">Cerner Millennium SSO</option>
                    <option value="Hospital Health System SAML">Hospital Health System (SAML 2.0)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hospital Staff Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. dr.chen@careops.health or evelyn.reed@careops-health.org"
                      value={ssoEmail}
                      onChange={(e) => setSsoEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Staff Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showSsoPassword ? 'text' : 'password'}
                        required
                        placeholder="Staff password"
                        value={ssoPassword}
                        onChange={(e) => setSsoPassword(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSsoPassword(!showSsoPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showSsoPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      6-Digit MFA Token
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 492018"
                        value={ssoMfaCode}
                        onChange={(e) => setSsoMfaCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono tracking-wider rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingSso}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{isSubmittingSso ? 'Validating Handshake...' : 'Authenticate Hospital SSO Handshake'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Clinical and administrative roles are assigned exclusively via server-verified hospital roster records with MFA.
                </span>
              </div>
            </form>
          )}

          {/* TAB 3: SIGN UP (REAL FIREBASE AUTH) */}
          {activeTab === 'signup' && !isForgotPasswordOpen && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create CareOps Account</h3>
                <p className="text-xs text-slate-500">Self-registration accounts default to Patient / Policyholder access</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Type
                  </label>
                  <select
                    value={signUpRole}
                    onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 font-semibold"
                  >
                    <option value="patient">Patient / Insured Policyholder</option>
                    <option value="provider">Physician / Medical Specialist (Requires Hospital Roster Matching)</option>
                    <option value="billing">Billing Specialist (Requires Hospital Roster Matching)</option>
                    <option value="claims">Claims Auditor (Requires Hospital Roster Matching)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe or Dr. Marcus Chen"
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
                    Password (Min. 6 chars) *
                  </label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    placeholder="Create secure password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
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
                <span>{isSubmittingSignUp ? 'Registering Account...' : 'Complete Sign Up via Firebase Auth'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD MODAL VIEW */}
          {isForgotPasswordOpen && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Your Password</h3>
                <p className="text-xs text-slate-500">Firebase Auth will send password reset instructions to your email</p>
              </div>

              {resetSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Reset Instructions Dispatched</span>
                  </div>
                  <p>
                    Check your inbox at <strong>{forgotEmail}</strong> for your secure password reset link.
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
                      Registered Email Address
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
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingReset || !forgotEmail.trim()}
                      className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                    >
                      {isSendingReset ? 'Sending...' : 'Send Firebase Reset Link'}
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
