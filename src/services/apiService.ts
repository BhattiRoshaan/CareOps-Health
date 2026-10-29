import {
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

let currentUserId = 'USR-101';
let currentUserRole = 'admin';
let currentAuthToken = '';

export function setApiAuth(userId: string, role: string, token?: string) {
  currentUserId = userId;
  currentUserRole = role;
  if (token !== undefined) {
    currentAuthToken = token;
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-id': currentUserId,
    'x-user-role': currentUserRole
  };
  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }
  return headers;
}

export const apiService = {
  setAuth(userId: string, role: string, token?: string) {
    setApiAuth(userId, role, token);
  },

  // Fetch initial data
  async getPatients(): Promise<Patient[]> {
    const res = await fetch('/api/data/patients', { headers: getAuthHeaders() });
    return res.json();
  },

  async getProviders(): Promise<Provider[]> {
    const res = await fetch('/api/data/providers', { headers: getAuthHeaders() });
    return res.json();
  },

  async getDepartments(): Promise<Department[]> {
    const res = await fetch('/api/data/departments', { headers: getAuthHeaders() });
    return res.json();
  },

  async getAppointments(): Promise<Appointment[]> {
    const res = await fetch('/api/data/appointments', { headers: getAuthHeaders() });
    return res.json();
  },

  async getInsurance(): Promise<InsurancePolicy[]> {
    const res = await fetch('/api/data/insurance', { headers: getAuthHeaders() });
    return res.json();
  },

  async getClaims(): Promise<Claim[]> {
    const res = await fetch('/api/data/claims', { headers: getAuthHeaders() });
    return res.json();
  },

  async getInvoices(): Promise<Invoice[]> {
    const res = await fetch('/api/data/invoices', { headers: getAuthHeaders() });
    return res.json();
  },

  async getPayments(): Promise<PaymentRecord[]> {
    const res = await fetch('/api/data/payments', { headers: getAuthHeaders() });
    return res.json();
  },

  async getDocuments(): Promise<DocumentItem[]> {
    const res = await fetch('/api/data/documents', { headers: getAuthHeaders() });
    return res.json();
  },

  async getTickets(): Promise<SupportTicket[]> {
    const res = await fetch('/api/data/tickets', { headers: getAuthHeaders() });
    return res.json();
  },

  async getKnowledge(): Promise<KnowledgeArticle[]> {
    const res = await fetch('/api/data/knowledge', { headers: getAuthHeaders() });
    return res.json();
  },

  async getAgents(): Promise<AIAgentDefinition[]> {
    const res = await fetch('/api/data/agents', { headers: getAuthHeaders() });
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/data/audit', { headers: getAuthHeaders() });
    return res.json();
  },

  async getMetrics(): Promise<AIMetrics> {
    const res = await fetch('/api/data/metrics', { headers: getAuthHeaders() });
    return res.json();
  },

  // AI & Action calls
  async sendChatMessage(payload: {
    message: string;
    patientId: string;
    role?: string;
    conversationHistory?: any[];
  }) {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async sendVoiceQuery(payload: {
    transcript: string;
    patientId: string;
  }) {
    const res = await fetch('/api/ai/voice', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async bookAppointment(payload: {
    patientId: string;
    providerId: string;
    date: string;
    time: string;
    type?: string;
    reasonForVisit?: string;
  }) {
    const res = await fetch('/api/actions/book-appointment', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async rescheduleAppointment(payload: {
    appointmentId: string;
    newDate: string;
    newTime: string;
  }) {
    const res = await fetch('/api/actions/reschedule-appointment', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async cancelAppointment(payload: {
    appointmentId: string;
    reason?: string;
  }) {
    const res = await fetch('/api/actions/cancel-appointment', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async submitAppeal(payload: {
    claimId: string;
    appealLetter?: string;
    priorAuthNumber?: string;
  }) {
    const res = await fetch('/api/actions/create-appeal', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async bulkAppeal(payload: {
    claimIds: string[];
    reason?: string;
  }) {
    const res = await fetch('/api/actions/bulk-appeal', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async payInvoice(payload: {
    invoiceId: string;
    amount?: number;
    paymentMethod?: string;
    transactionDetails?: any;
  }) {
    const res = await fetch('/api/actions/pay-invoice', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async setupPaymentPlan(payload: {
    invoiceId: string;
    months: number;
  }) {
    const res = await fetch('/api/actions/setup-payment-plan', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async bulkPaymentReminders(payload: {
    invoiceIds: string[];
  }) {
    const res = await fetch('/api/actions/bulk-payment-reminders', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async extractDocument(payload: {
    title: string;
    documentType: string;
    patientId: string;
    fileBase64?: string;
    mimeType?: string;
  }) {
    const res = await fetch('/api/actions/extract-document', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async createEscalation(payload: {
    patientId: string;
    subject: string;
    department: string;
    category?: string;
    priority?: string;
    reasonForEscalation: string;
    conversationSnippet?: string;
  }) {
    const res = await fetch('/api/actions/create-escalation', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};
