export type UserRole = 
  | 'patient' 
  | 'provider' 
  | 'billing' 
  | 'claims' 
  | 'admin' 
  | 'ops_manager';

export interface UserNotificationPreferences {
  emailAlerts: boolean;
  smsAlerts: boolean;
  clinicalEscalations: boolean;
  claimStatusUpdates: boolean;
  voiceSummaries: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  department?: string;
  patientId?: string; // If role === 'patient'
  providerId?: string; // If role === 'provider'
  phone?: string;
  npiNumber?: string;
  memberId?: string;
  twoFactorEnabled?: boolean;
  notificationPreferences?: UserNotificationPreferences;
  lastLogin?: string;
}

export type PageId =
  | 'dashboard'
  | 'queues'
  | 'chat'
  | 'voice'
  | 'patients'
  | 'appointments'
  | 'providers'
  | 'insurance'
  | 'claims'
  | 'billing'
  | 'documents'
  | 'escalations'
  | 'knowledge'
  | 'agents'
  | 'analytics'
  | 'audit'
  | 'settings'
  | 'account-settings';

export type ClaimStatus =
  | 'Draft'
  | 'Submitted'
  | 'Processing'
  | 'Approved'
  | 'Partially Paid'
  | 'Denied'
  | 'Appealed'
  | 'Closed';

export type DenialCategory =
  | 'Prior Authorization Required'
  | 'Medical Necessity Not Established'
  | 'Timely Filing Limit Exceeded'
  | 'Missing / Invalid Modifiers'
  | 'Patient Ineligible on Date of Service'
  | 'Coordination of Benefits (COB) Required'
  | 'Duplicate Claim Submission'
  | 'Non-Covered Procedure Code';

export interface Claim {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  department: string;
  serviceDate: string;
  submissionDate: string;
  processingDate?: string;
  payerName: string;
  payerId: string;
  diagnosisCodes: string[]; // ICD-10 e.g. ['I25.10', 'R07.9']
  procedureCodes: string[]; // CPT e.g. ['75561', '99214']
  cptCodes?: string[];
  serviceDescription: string;
  submittedAmount: number;
  totalBilledAmount?: number;
  allowedAmount: number;
  paidAmount: number;
  patientResponsibility: number;
  status: ClaimStatus;
  denialReason?: string;
  denialCategory?: DenialCategory;
  missingInformation?: string[];
  recommendedAction?: string;
  priorAuthNumber?: string;
  appealStatus?: 'Not Started' | 'Drafted' | 'Submitted' | 'In Review' | 'Overturned' | 'Upheld';
  appealLetter?: string;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  dateOfBirth?: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  insuranceId: string;
  insuranceName: string;
  memberId: string;
  groupNumber: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  } | string;
  primaryCareDoctorId: string;
  allergies: string[];
  conditions: string[];
  outstandingBalance: number;
  assignedProviderName?: string;
}

export interface PatientVitals {
  bloodPressure: {
    systolic: number;
    diastolic: number;
    unit: string;
    status: 'Normal' | 'Elevated' | 'Stage 1' | 'Stage 2';
  };
  heartRate: {
    bpm: number;
    unit: string;
    status: 'Normal' | 'Bradycardia' | 'Tachycardia';
    rhythm?: string;
  };
  spO2: {
    percentage: number;
    unit: string;
    status: 'Normal' | 'Borderline' | 'Low';
    delivery?: string;
  };
  temperature: {
    fahrenheit: number;
    celsius: number;
    unit: string;
    status: 'Normal' | 'Fever' | 'Low';
  };
  respiratoryRate: {
    breathsPerMin: number;
    unit: string;
    status: 'Normal' | 'Elevated';
  };
  bmi: {
    value: number;
    weightLbs: number;
    weightKg: number;
    heightFt: string;
    heightCm: number;
    category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  };
  bloodGlucose?: {
    value: number;
    unit: string;
    fasting: boolean;
    hba1c?: number;
  };
  painScale?: {
    score: number;
    scale: '0-10';
    location?: string;
  };
  lastRecordedAt: string;
  recordedBy: string;
  historicalReadings?: Array<{
    date: string;
    bp: string;
    hr: number;
    spO2: number;
    temp: number;
    weightLbs: number;
  }>;
}

export interface PatientEncounter {
  id: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  providerName: string;
  providerSpecialty: string;
  department: string;
  chiefComplaint: string;
  clinicalSummary: string;
  diagnoses: string[];
  treatmentPlan: string;
  vitalsSummary?: string;
  status: 'Completed' | 'In-Progress' | 'Scheduled';
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  department: string;
  npi: string; // National Provider Identifier
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  availableDays: string[];
  nextAvailableSlot: string;
  location: string;
}

export interface Department {
  id: string;
  name: string;
  headDoctor: string;
  floor: string;
  phone: string;
  activePatientsCount: number;
}

export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'In-Progress' | 'Completed' | 'Cancelled' | 'Rescheduled';
export type AppointmentType = 'In-Person Consultation' | 'Follow-up' | 'Telehealth' | 'Diagnostic Imaging' | 'Procedure' | 'Lab Work';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  durationMinutes: number;
  type: AppointmentType;
  location: string;
  status: AppointmentStatus;
  reasonForVisit: string;
  notes?: string;
}

export interface InsurancePolicy {
  id: string;
  patientId: string;
  patientName: string;
  payerName: string;
  payerId: string;
  memberId: string;
  groupNumber: string;
  policyStatus: 'Active' | 'Inactive' | 'Pending Verification' | 'Expired';
  coverageType: 'HMO' | 'PPO' | 'EPO' | 'Medicare Advantage' | 'Medicaid';
  effectiveDate: string;
  expirationDate: string;
  copay: {
    primaryCare: number;
    specialist: number;
    emergencyRoom: number;
    urgentCare: number;
  };
  deductible: {
    individualTotal: number;
    individualMet: number;
    familyTotal: number;
    familyMet: number;
  };
  coinsurancePercent: number; // e.g. 20 (meaning patient pays 20%)
  outOfPocketMax: {
    individualTotal: number;
    individualMet: number;
  };
  priorAuthRequiredServices: string[];
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  issueDate: string;
  dueDate: string;
  serviceDate: string;
  serviceDescription: string;
  totalCharges: number;
  insuranceAdjustments: number;
  insurancePaid: number;
  patientPaid: number;
  balanceDue: number;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Payment Plan Active' | 'Pending Insurance';
  agingCategory: 'Current' | '30-60 Days' | '60-90 Days' | '90+ Days';
  paymentPlan?: {
    totalMonths: number;
    monthlyAmount: number;
    remainingMonths: number;
    nextDueDate: string;
  };
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  amount: number;
  paymentMethod: 'Credit Card' | 'HSA/FSA' | 'ACH Bank Transfer' | 'Insurance EFT' | 'Check';
  transactionDate: string;
  status: 'Completed' | 'Processing' | 'Failed' | 'Refunded';
  referenceNumber: string;
}

export type DocumentType = 
  | 'Insurance Card' 
  | 'Bill / EOB' 
  | 'Medical Record' 
  | 'Prior Authorization Form' 
  | 'Referral Letter' 
  | 'Prescription' 
  | 'Consent Form';

export interface ExtractedField {
  fieldName: string;
  value: string;
  confidence: number; // 0.0 to 1.0
  flagged?: boolean;
  flagReason?: string;
}

export interface DocumentItem {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  documentType: DocumentType;
  uploadedAt: string;
  fileSize: string;
  status: 'Processed' | 'Review Required' | 'Extracting' | 'Failed';
  extractedFields: ExtractedField[];
  imageUrl?: string;
  notes?: string;
}

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketStatus = 'Open' | 'In Progress' | 'Escalated to Staff' | 'Resolved' | 'Closed';

export interface SupportTicket {
  id: string;
  patientId: string;
  patientName: string;
  subject: string;
  department: string;
  category: 'Billing Dispute' | 'Clinical Escalation' | 'Insurance Appeal' | 'Appointment Issue' | 'Complaint' | 'General Inquiry';
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedStaff?: string;
  reasonForEscalation: string;
  conversationSnippet?: string;
  resolutionNotes?: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'Hospital Policy' | 'Insurance Guidelines' | 'Billing SOP' | 'Patient Instructions' | 'Clinical Safety Protocol';
  department: string;
  lastUpdated: string;
  author: string;
  summary: string;
  content: string;
  tags: string[];
  sourceReference: string;
}

export interface AIAgentDefinition {
  id: string;
  name: string;
  code: string;
  roleDescription: string;
  description?: string;
  model: string;
  temperature: number;
  status: 'Active' | 'Standby' | 'Optimizing';
  handledRequestsToday: number;
  handledQueriesToday?: number;
  accuracyRate: number;
  accuracyScore?: number;
  avgLatencyMs: number;
  averageLatencySec?: number;
  tools: string[];
  systemPromptSummary: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resourceType: 'Claim' | 'Patient Record' | 'Invoice' | 'Appointment' | 'Document' | 'AI Agent' | 'Support Ticket';
  resourceId: string;
  aiAgentUsed?: string;
  result: 'Success' | 'Denied' | 'Escalated' | 'Flagged' | 'Failed';
  ipAddress: string;
  phiAccessed: boolean;
  notes?: string;
}

export interface AIMetrics {
  totalConversations: number;
  conversationsHandled?: number;
  voiceCallsCount: number;
  automationRate: number; // e.g. 84.5%
  humanEscalationRate: number; // e.g. 15.5%
  avgResponseTimeSec: number;
  claimsProcessedAI: number;
  claimsAppealedAI: number;
  appointmentsBookedAI: number;
  billingInquiriesResolved: number;
  aiAccuracyScore: number; // 98.4%
  csatScore: number; // 4.8 / 5
  firstContactResolutionRate?: number;
  voiceAvgLatencySec?: number;
  priorAuthAvgTurnaroundHours?: number;
}

export interface ActionSuggestion {
  id: string;
  label: string;
  actionType: 'book_appt' | 'view_claim' | 'verify_auth' | 'generate_appeal' | 'pay_bill' | 'escalate' | 'check_eligibility';
  payload?: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  agentName?: string;
  timestamp: string;
  text: string;
  thoughtProcess?: string;
  intentCategory?: string;
  suggestedActions?: ActionSuggestion[];
  dataPayload?: {
    type: 'claim' | 'invoice' | 'appointment' | 'insurance' | 'document' | 'escalation';
    data: any;
  };
  isEmergencyAlert?: boolean;
}
