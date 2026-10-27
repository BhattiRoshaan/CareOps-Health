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

export const apiService = {
  // Fetch initial data
  async getPatients(): Promise<Patient[]> {
    const res = await fetch('/api/data/patients');
    return res.json();
  },

  async getProviders(): Promise<Provider[]> {
    const res = await fetch('/api/data/providers');
    return res.json();
  },

  async getDepartments(): Promise<Department[]> {
    const res = await fetch('/api/data/departments');
    return res.json();
  },

  async getAppointments(): Promise<Appointment[]> {
    const res = await fetch('/api/data/appointments');
    return res.json();
  },

  async getInsurance(): Promise<InsurancePolicy[]> {
    const res = await fetch('/api/data/insurance');
    return res.json();
  },

  async getClaims(): Promise<Claim[]> {
    const res = await fetch('/api/data/claims');
    return res.json();
  },

  async getInvoices(): Promise<Invoice[]> {
    const res = await fetch('/api/data/invoices');
    return res.json();
  },

  async getPayments(): Promise<PaymentRecord[]> {
    const res = await fetch('/api/data/payments');
    return res.json();
  },

  async getDocuments(): Promise<DocumentItem[]> {
    const res = await fetch('/api/data/documents');
    return res.json();
  },

  async getTickets(): Promise<SupportTicket[]> {
    const res = await fetch('/api/data/tickets');
    return res.json();
  },

  async getKnowledge(): Promise<KnowledgeArticle[]> {
    const res = await fetch('/api/data/knowledge');
    return res.json();
  },

  async getAgents(): Promise<AIAgentDefinition[]> {
    const res = await fetch('/api/data/agents');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/data/audit');
    return res.json();
  },

  async getMetrics(): Promise<AIMetrics> {
    const res = await fetch('/api/data/metrics');
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async payInvoice(payload: {
    invoiceId: string;
    amount?: number;
    paymentMethod?: string;
  }) {
    const res = await fetch('/api/actions/pay-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};
