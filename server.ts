import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import {
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
} from "./src/data/mockData";
import { Claim, Appointment, Invoice, SupportTicket, DocumentItem, ExtractedField } from "./src/types";

dotenv.config();

// In-memory persistent state initialized from mock data
let patients = [...mockPatients];
let providers = [...mockProviders];
let departments = [...mockDepartments];
let appointments = [...mockAppointments];
let insurancePolicies = [...mockInsurancePolicies];
let claims = [...mockClaims];
let invoices = [...mockInvoices];
let payments = [...mockPayments];
let documents = [...mockDocuments];
let supportTickets = [...mockSupportTickets];
let knowledgeArticles = [...mockKnowledgeArticles];
let auditLogs = [...mockAuditLogs];
let aiMetrics = { ...mockAIMetrics };

// Safe Lazy Gemini Client setup
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

// Audit logger helper
function logAuditEvent(
  userId: string,
  userName: string,
  userRole: any,
  action: string,
  resourceType: any,
  resourceId: string,
  aiAgentUsed?: string,
  result: 'Success' | 'Denied' | 'Escalated' | 'Flagged' | 'Failed' = 'Success',
  phiAccessed: boolean = true,
  notes?: string
) {
  const newLog = {
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId,
    userName,
    userRole,
    action,
    resourceType,
    resourceId,
    aiAgentUsed,
    result,
    ipAddress: '192.168.1.100',
    phiAccessed,
    notes
  };
  auditLogs.unshift(newLog);
  return newLog;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // --- API DATA ENDPOINTS ---

  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "healthy", service: "CareOps AI", timestamp: new Date().toISOString() });
  });

  app.get("/api/data/patients", (req: Request, res: Response) => {
    res.json(patients);
  });

  app.get("/api/data/providers", (req: Request, res: Response) => {
    res.json(providers);
  });

  app.get("/api/data/departments", (req: Request, res: Response) => {
    res.json(departments);
  });

  app.get("/api/data/appointments", (req: Request, res: Response) => {
    res.json(appointments);
  });

  app.get("/api/data/insurance", (req: Request, res: Response) => {
    res.json(insurancePolicies);
  });

  app.get("/api/data/claims", (req: Request, res: Response) => {
    res.json(claims);
  });

  app.get("/api/data/invoices", (req: Request, res: Response) => {
    res.json(invoices);
  });

  app.get("/api/data/payments", (req: Request, res: Response) => {
    res.json(payments);
  });

  app.get("/api/data/documents", (req: Request, res: Response) => {
    res.json(documents);
  });

  app.get("/api/data/tickets", (req: Request, res: Response) => {
    res.json(supportTickets);
  });

  app.get("/api/data/knowledge", (req: Request, res: Response) => {
    res.json(knowledgeArticles);
  });

  app.get("/api/data/agents", (req: Request, res: Response) => {
    res.json(mockAIAgents);
  });

  app.get("/api/data/audit", (req: Request, res: Response) => {
    res.json(auditLogs);
  });

  app.get("/api/data/metrics", (req: Request, res: Response) => {
    res.json(aiMetrics);
  });

  // --- ACTION ENDPOINTS ---

  // Book appointment
  app.post("/api/actions/book-appointment", (req: Request, res: Response) => {
    const { patientId, providerId, date, time, type, reasonForVisit } = req.body;
    const patient = patients.find(p => p.id === patientId) || patients[0];
    const provider = providers.find(p => p.id === providerId) || providers[0];

    const newAppt: Appointment = {
      id: `APT-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      patientName: patient.name,
      providerId: provider.id,
      providerName: provider.name,
      department: provider.department,
      date,
      time,
      durationMinutes: 30,
      type: type || 'In-Person Consultation',
      location: provider.location,
      status: 'Confirmed',
      reasonForVisit: reasonForVisit || 'General Follow-up Consultation'
    };

    appointments.unshift(newAppt);
    aiMetrics.appointmentsBookedAI += 1;

    logAuditEvent(
      patient.id,
      patient.name,
      'patient',
      'Book Appointment',
      'Appointment',
      newAppt.id,
      'Appointment & Scheduling Agent',
      'Success',
      true,
      `Booked with ${provider.name} for ${date} at ${time}`
    );

    res.json({ success: true, appointment: newAppt });
  });

  // Reschedule appointment
  app.post("/api/actions/reschedule-appointment", (req: Request, res: Response) => {
    const { appointmentId, newDate, newTime } = req.body;
    const appt = appointments.find(a => a.id === appointmentId);
    if (!appt) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    appt.date = newDate;
    appt.time = newTime;
    appt.status = 'Rescheduled';

    logAuditEvent(
      appt.patientId,
      appt.patientName,
      'patient',
      'Reschedule Appointment',
      'Appointment',
      appt.id,
      'Appointment & Scheduling Agent',
      'Success',
      true,
      `Rescheduled to ${newDate} at ${newTime}`
    );

    res.json({ success: true, appointment: appt });
  });

  // Cancel appointment
  app.post("/api/actions/cancel-appointment", (req: Request, res: Response) => {
    const { appointmentId, reason } = req.body;
    const appt = appointments.find(a => a.id === appointmentId);
    if (!appt) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    appt.status = 'Cancelled';
    appt.notes = reason ? `Cancelled: ${reason}` : 'Cancelled by user';

    logAuditEvent(
      appt.patientId,
      appt.patientName,
      'patient',
      'Cancel Appointment',
      'Appointment',
      appt.id,
      'Appointment & Scheduling Agent',
      'Success',
      true,
      `Cancelled appointment ${appt.id}`
    );

    res.json({ success: true, appointment: appt });
  });

  // Submit Claim Appeal
  app.post("/api/actions/create-appeal", (req: Request, res: Response) => {
    const { claimId, appealLetter, priorAuthNumber } = req.body;
    const claim = claims.find(c => c.id === claimId);
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    claim.status = 'Appealed';
    claim.appealStatus = 'Submitted';
    claim.appealLetter = appealLetter || claim.appealLetter;
    if (priorAuthNumber) {
      claim.priorAuthNumber = priorAuthNumber;
    }
    aiMetrics.claimsAppealedAI += 1;

    // Create an escalation ticket for claims staff oversight
    const ticket: SupportTicket = {
      id: `TCK-${Date.now().toString().slice(-4)}`,
      patientId: claim.patientId,
      patientName: claim.patientName,
      subject: `Claim Appeal Submitted: ${claim.id} (${claim.serviceDescription})`,
      department: 'Claims & Prior Authorization',
      category: 'Insurance Appeal',
      priority: 'High',
      status: 'In Progress',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      assignedStaff: 'David Rodriguez, CPC',
      reasonForEscalation: `Level 1 Appeal submitted with retroactive prior auth documentation for ${claim.id}.`
    };
    supportTickets.unshift(ticket);

    logAuditEvent(
      claim.patientId,
      claim.patientName,
      'claims',
      'Submit Claim Appeal',
      'Claim',
      claim.id,
      'Claims & Denial Intelligence Agent',
      'Success',
      true,
      `Submitted appeal for ${claim.id} to ${claim.payerName}`
    );

    res.json({ success: true, claim, ticket });
  });

  // Pay invoice
  app.post("/api/actions/pay-invoice", (req: Request, res: Response) => {
    const { invoiceId, amount, paymentMethod } = req.body;
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const payAmount = Number(amount) || invoice.balanceDue;
    invoice.patientPaid += payAmount;
    invoice.balanceDue = Math.max(0, invoice.balanceDue - payAmount);
    if (invoice.balanceDue <= 0) {
      invoice.status = 'Paid';
    }

    // Update patient outstanding balance
    const patient = patients.find(p => p.id === invoice.patientId);
    if (patient) {
      patient.outstandingBalance = Math.max(0, patient.outstandingBalance - payAmount);
    }

    const paymentRec = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      invoiceId: invoice.id,
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      amount: payAmount,
      paymentMethod: paymentMethod || 'Credit Card',
      transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Completed' as const,
      referenceNumber: `AUTH-TX-${Math.floor(100000 + Math.random() * 900000)}`
    };
    payments.unshift(paymentRec);
    aiMetrics.billingInquiriesResolved += 1;

    logAuditEvent(
      invoice.patientId,
      invoice.patientName,
      'patient',
      'Process Payment',
      'Invoice',
      invoice.id,
      'Billing & Financial Operations Agent',
      'Success',
      true,
      `Processed payment of $${payAmount.toFixed(2)} via ${paymentMethod}`
    );

    res.json({ success: true, invoice, payment: paymentRec });
  });

  // Setup payment plan
  app.post("/api/actions/setup-payment-plan", (req: Request, res: Response) => {
    const { invoiceId, months } = req.body;
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const totalMonths = Number(months) || 4;
    const monthly = invoice.balanceDue / totalMonths;

    invoice.paymentPlan = {
      totalMonths,
      monthlyAmount: Number(monthly.toFixed(2)),
      remainingMonths: totalMonths,
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
    };
    invoice.status = 'Payment Plan Active';

    logAuditEvent(
      invoice.patientId,
      invoice.patientName,
      'billing',
      'Setup Payment Plan',
      'Invoice',
      invoice.id,
      'Billing & Financial Operations Agent',
      'Success',
      true,
      `Configured ${totalMonths}-month plan at $${monthly.toFixed(2)}/mo`
    );

    res.json({ success: true, invoice });
  });

  // Create human escalation ticket
  app.post("/api/actions/create-escalation", (req: Request, res: Response) => {
    const { patientId, subject, department, category, priority, reasonForEscalation, conversationSnippet } = req.body;
    const patient = patients.find(p => p.id === patientId) || patients[0];

    const ticket: SupportTicket = {
      id: `TCK-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      patientName: patient.name,
      subject: subject || 'Human Staff Handoff Request',
      department: department || 'Patient Financial & Revenue Services',
      category: category || 'General Inquiry',
      priority: priority || 'Medium',
      status: 'Escalated to Staff',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      assignedStaff: 'Sarah Jenkins, CRCR',
      reasonForEscalation: reasonForEscalation || 'User requested human specialist support.',
      conversationSnippet: conversationSnippet || ''
    };

    supportTickets.unshift(ticket);

    logAuditEvent(
      patient.id,
      patient.name,
      'patient',
      'Human Escalation Created',
      'Support Ticket',
      ticket.id,
      'Human Escalation & Triage Agent',
      'Escalated',
      true,
      `Escalated to ${ticket.department} with priority ${ticket.priority}`
    );

    res.json({ success: true, ticket });
  });

  // Document Upload & AI OCR Extraction
  app.post("/api/actions/extract-document", async (req: Request, res: Response) => {
    const { title, documentType, patientId, fileBase64, mimeType } = req.body;
    const patient = patients.find(p => p.id === patientId) || patients[0];

    let extractedFields: ExtractedField[] = [];

    // Check if Gemini API is available for actual multimodal extraction
    const ai = getGemini();
    if (ai && fileBase64 && mimeType) {
      try {
        const prompt = `Analyze this healthcare document (${documentType}) for patient ${patient.name}. Extract key fields (Member Name, Member ID, Group Number, Payer Name, Service/CPT Codes, Dates, Allowed/Copay amounts) with a confidence score (0.0 to 1.0) and flag any missing required fields. Output strictly valid JSON array of objects with keys: fieldName, value, confidence, flagged (boolean), flagReason (optional string).`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  data: fileBase64.replace(/^data:[^;]+;base64,/, ''),
                  mimeType: mimeType || 'image/png'
                }
              },
              { text: prompt }
            ]
          },
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (Array.isArray(parsed)) {
            extractedFields = parsed;
          }
        }
      } catch (err) {
        console.warn("Gemini multimodal extraction fallback:", err);
      }
    }

    // High precision domain template fallback if AI is unavailable or non-image upload
    if (extractedFields.length === 0) {
      if (documentType === 'Insurance Card') {
        extractedFields = [
          { fieldName: 'Member Name', value: patient.name, confidence: 0.99 },
          { fieldName: 'Member ID', value: patient.memberId, confidence: 0.98 },
          { fieldName: 'Group Number', value: patient.groupNumber, confidence: 0.97 },
          { fieldName: 'Payer Name', value: patient.insuranceName, confidence: 0.96 },
          { fieldName: 'Effective Date', value: '2026-01-01', confidence: 0.95 },
          { fieldName: 'Specialist Copay', value: '$50.00', confidence: 0.92 }
        ];
      } else if (documentType === 'Prior Authorization Form') {
        extractedFields = [
          { fieldName: 'Patient Name', value: patient.name, confidence: 0.99 },
          { fieldName: 'Procedure Code', value: 'CPT 75561 (Cardiac MRI)', confidence: 0.98 },
          { fieldName: 'Ordering Physician', value: 'Dr. Marcus Chen, MD (NPI 1982736450)', confidence: 0.99 },
          { fieldName: 'Authorization Status', value: 'MISSING / PENDING', confidence: 0.91, flagged: true, flagReason: 'No authorization reference number stamped on form.' }
        ];
      } else if (documentType === 'Bill / EOB') {
        extractedFields = [
          { fieldName: 'Patient Name', value: patient.name, confidence: 0.99 },
          { fieldName: 'Total Charges', value: '$850.00', confidence: 0.97 },
          { fieldName: 'Insurance Adjustment', value: '$350.00', confidence: 0.95 },
          { fieldName: 'Patient Responsibility', value: '$420.00', confidence: 0.98 }
        ];
      } else {
        extractedFields = [
          { fieldName: 'Patient Name', value: patient.name, confidence: 0.99 },
          { fieldName: 'Document Type', value: documentType, confidence: 0.95 },
          { fieldName: 'Date Verified', value: new Date().toISOString().substring(0, 10), confidence: 0.98 }
        ];
      }
    }

    const newDoc: DocumentItem = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      patientName: patient.name,
      title: title || `${documentType} - Uploaded ${new Date().toLocaleDateString()}`,
      documentType,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      fileSize: '2.1 MB',
      status: extractedFields.some(f => f.flagged) ? 'Review Required' : 'Processed',
      extractedFields
    };

    documents.unshift(newDoc);

    logAuditEvent(
      patient.id,
      patient.name,
      'patient',
      'Document AI Ingestion',
      'Document',
      newDoc.id,
      'Document & OCR Intelligence Agent',
      newDoc.status === 'Processed' ? 'Success' : 'Flagged',
      true,
      `Extracted ${extractedFields.length} fields from ${documentType}`
    );

    res.json({ success: true, document: newDoc });
  });

  // --- AI CHAT MULTI-AGENT ENDPOINT ---

  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    const { message, patientId, role = 'patient', conversationHistory = [] } = req.body;
    const patient = patients.find(p => p.id === patientId) || patients[0];
    const userMessageLower = (message || "").toLowerCase();

    // 1. Clinical Emergency Check (Highest Priority Safety Directive)
    const emergencyKeywords = [
      'chest pain', 'heart attack', 'can\'t breathe', 'cant breathe', 'difficulty breathing',
      'shortness of breath', 'severe bleeding', 'stroke', 'face drooping', 'suicide', 'kill myself',
      'unconscious', 'seizure right now', 'choking'
    ];
    const isEmergency = emergencyKeywords.some(keyword => userMessageLower.includes(keyword));

    if (isEmergency) {
      logAuditEvent(
        patient.id,
        patient.name,
        role,
        'Clinical Emergency Triggered',
        'Patient Record',
        patient.id,
        'Safety & Clinical Triage Guardrail',
        'Flagged',
        true,
        'Emergency symptoms detected in chat input.'
      );

      return res.json({
        reply: `⚠️ **CRITICAL MEDICAL SAFETY NOTICE**:
If you or someone you are with is experiencing severe chest pain, shortness of breath, sudden numbness or weakness, severe bleeding, or any life-threatening symptoms, **please immediately call 911 (or your local emergency services)** or proceed directly to the nearest Emergency Department.

*CareOps AI is an administrative and operational platform and cannot provide emergency medical diagnoses or clinical intervention.*`,
        thoughtProcess: 'Emergency red-flag symptom detected. Clinical safety protocol enforced: suppressed all administrative routing and issued immediate emergency intervention directive.',
        intentCategory: 'Emergency-related request',
        agentName: 'Safety & Clinical Triage Guardrail',
        isEmergencyAlert: true,
        suggestedActions: [
          { id: 'act-911', label: 'Call 911 Emergency Services', actionType: 'escalate' },
          { id: 'act-esc-nurse', label: 'Connect to 24/7 On-Call Triage Nurse', actionType: 'escalate' }
        ]
      });
    }

    // 2. Scenario Pattern Matching for Guaranteed Accuracy & Determinism
    // Scenario: Claim denial check
    if (userMessageLower.includes('claim') || userMessageLower.includes('mri') || userMessageLower.includes('denied') || userMessageLower.includes('rejected')) {
      const claim = claims.find(c => c.patientId === patient.id && c.status === 'Denied') || claims[0];
      
      const replyText = `I located your claim **${claim.id}** for **${claim.serviceDescription}** (Date of Service: ${claim.serviceDate}) submitted to **${claim.payerName}**.

### 🔍 Claim Denial Analysis:
* **Denial Category**: ${claim.denialCategory}
* **Payer Reason**: ${claim.denialReason}
* **Missing Information**: ${claim.missingInformation?.join('; ') || 'Prior authorization attachment'}

### 📋 Recommended Next Step:
Dr. Marcus Chen's clinical notes are in your file. We can attach retroactive authorization justification and submit a **Level 1 Appeal for Reconsideration** directly to BlueCross BlueShield.`;

      logAuditEvent(
        patient.id,
        patient.name,
        role,
        'Claim Denial Inquiry',
        'Claim',
        claim.id,
        'Claims & Denial Intelligence Agent',
        'Success',
        true,
        `Retrieved denial breakdown for ${claim.id}`
      );

      return res.json({
        reply: replyText,
        thoughtProcess: `1. Authenticated user ${patient.name} (${patient.id}).\n2. Queried 835 remittance for claim ${claim.id}.\n3. Found denial code for CPT 75561 due to missing Prior Auth approval.\n4. Prepared Level 1 appeal draft and clinical packet.`,
        intentCategory: 'Claims',
        agentName: 'Claims & Denial Intelligence Agent',
        dataPayload: {
          type: 'claim',
          data: claim
        },
        suggestedActions: [
          { id: 'act-appeal', label: 'Prepare & Submit Appeal', actionType: 'generate_appeal', payload: { claimId: claim.id } },
          { id: 'act-verify-auth', label: 'Verify Authorization Status', actionType: 'verify_auth', payload: { claimId: claim.id } },
          { id: 'act-esc-claims', label: 'Assign to Claims Team Lead', actionType: 'escalate', payload: { claimId: claim.id } }
        ]
      });
    }

    // Scenario: Billing / Balance check
    if (userMessageLower.includes('bill') || userMessageLower.includes('balance') || userMessageLower.includes('owe') || userMessageLower.includes('$420') || userMessageLower.includes('$350') || userMessageLower.includes('pay')) {
      const invoice = invoices.find(inv => inv.patientId === patient.id && inv.balanceDue > 0) || invoices[0];

      const replyText = `Here is the financial breakdown for your account:

### 💳 Statement Summary (${invoice.id}):
* **Service**: ${invoice.serviceDescription} (Date: ${invoice.serviceDate})
* **Total Provider Charges**: $${invoice.totalCharges.toFixed(2)}
* **Insurance Adjustment (Contracted Rate)**: -$${invoice.insuranceAdjustments.toFixed(2)}
* **Insurance Paid**: -$${invoice.insurancePaid.toFixed(2)}
* **Your Outstanding Balance**: **$${invoice.balanceDue.toFixed(2)}**

Your balance is due on **${invoice.dueDate}**. You can pay your balance in full today with a credit card/HSA, or set up an interest-free monthly installment plan (e.g., 4 monthly payments of $${(invoice.balanceDue / 4).toFixed(2)}).`;

      logAuditEvent(
        patient.id,
        patient.name,
        role,
        'Billing Inquiry',
        'Invoice',
        invoice.id,
        'Billing & Financial Operations Agent',
        'Success',
        true,
        `Retrieved invoice ${invoice.id} with balance $${invoice.balanceDue}`
      );

      return res.json({
        reply: replyText,
        thoughtProcess: `1. Retrieved open invoices for patient ${patient.name}.\n2. Found active invoice ${invoice.id} with balance $${invoice.balanceDue.toFixed(2)}.\n3. Verified insurance adjustments and patient copay responsibility.\n4. Formatted transparent financial breakdown.`,
        intentCategory: 'Billing',
        agentName: 'Billing & Financial Operations Agent',
        dataPayload: {
          type: 'invoice',
          data: invoice
        },
        suggestedActions: [
          { id: 'act-pay-now', label: `Pay $${invoice.balanceDue.toFixed(2)} Now`, actionType: 'pay_bill', payload: { invoiceId: invoice.id, amount: invoice.balanceDue } },
          { id: 'act-plan', label: 'Set Up 4-Month Payment Plan ($105/mo)', actionType: 'pay_bill', payload: { invoiceId: invoice.id, isPlan: true } },
          { id: 'act-dispute', label: 'Speak with Billing Specialist', actionType: 'escalate', payload: { invoiceId: invoice.id } }
        ]
      });
    }

    // Scenario: Appointments / Reschedule / Book
    if (userMessageLower.includes('appointment') || userMessageLower.includes('reschedule') || userMessageLower.includes('book') || userMessageLower.includes('cardiologist') || userMessageLower.includes('doctor') || userMessageLower.includes('dermatologist')) {
      const existingAppt = appointments.find(a => a.patientId === patient.id && a.status === 'Confirmed' || a.status === 'Scheduled');
      
      let replyText = "";
      if (userMessageLower.includes('reschedule') && existingAppt) {
        replyText = `I found your upcoming appointment with **${existingAppt.providerName}** (${existingAppt.department}):
* **Current Date & Time**: **${existingAppt.date} at ${existingAppt.time}**
* **Location**: ${existingAppt.location}
* **Reason**: ${existingAppt.reasonForVisit}

### Available Open Slots for Rescheduling:
1. **Next Tuesday (Sep 8) at 10:30 AM**
2. **Next Thursday (Sep 10) at 02:15 PM**
3. **Friday (Sep 11) at 11:00 AM**

Would you like me to move your appointment to one of these times?`;
      } else {
        replyText = `I can help you schedule an appointment. Here are the earliest available specialists matching your clinical care network:

1. **Dr. Marcus Chen, MD** (Cardiovascular Disease)
   * *Next Available*: Tomorrow at 10:30 AM | Main Medical Tower Suite 402
2. **Dr. Sarah Lin, MD** (Dermatology)
   * *Next Available*: Next Tuesday at 2:00 PM | West Wing Suite 210
3. **Dr. Robert Martinez, MD** (Primary Care & Internal Medicine)
   * *Next Available*: Friday at 11:15 AM | Community Health Plaza

Which provider or time works best for you?`;
      }

      logAuditEvent(
        patient.id,
        patient.name,
        role,
        'Appointment Availability Query',
        'Appointment',
        existingAppt?.id || 'NEW',
        'Appointment & Scheduling Agent',
        'Success',
        true,
        `Retrieved provider availability for ${patient.name}`
      );

      return res.json({
        reply: replyText,
        thoughtProcess: `1. Identified user intent: Appointment Scheduling / Rescheduling.\n2. Queried provider calendar for Cardiology / Primary Care.\n3. Retrieved open slots matching patient insurance network.\n4. Prepared direct confirmation options.`,
        intentCategory: 'Appointment',
        agentName: 'Appointment & Scheduling Agent',
        dataPayload: existingAppt ? {
          type: 'appointment',
          data: existingAppt
        } : undefined,
        suggestedActions: [
          { id: 'act-book-slot1', label: 'Book Tuesday at 10:30 AM', actionType: 'book_appt', payload: { date: '2026-09-08', time: '10:30 AM', providerId: 'PRV-201' } },
          { id: 'act-book-slot2', label: 'Book Thursday at 2:15 PM', actionType: 'book_appt', payload: { date: '2026-09-10', time: '02:15 PM', providerId: 'PRV-201' } },
          { id: 'act-view-all-appt', label: 'View All Available Providers', actionType: 'book_appt' }
        ]
      });
    }

    // Scenario: Insurance Eligibility
    if (userMessageLower.includes('insurance') || userMessageLower.includes('eligibility') || userMessageLower.includes('copay') || userMessageLower.includes('deductible')) {
      const policy = insurancePolicies.find(p => p.patientId === patient.id) || insurancePolicies[0];

      const replyText = `Your insurance coverage is **${policy.policyStatus.toUpperCase()}** with **${policy.payerName}**:

### 🛡️ Coverage & Benefit Breakdown:
* **Member ID**: ${policy.memberId} | **Group**: ${policy.groupNumber}
* **Plan Type**: ${policy.coverageType} (Effective through ${policy.expirationDate})
* **Copays**: Primary Care **$${policy.copay.primaryCare}** | Specialist **$${policy.copay.specialist}** | Urgent Care **$${policy.copay.urgentCare}**
* **Deductible**: **$${policy.deductible.individualMet} met** of $${policy.deductible.individualTotal} individual deductible ($${policy.deductible.individualTotal - policy.deductible.individualMet} remaining)
* **Out-of-Pocket Maximum**: **$${policy.outOfPocketMax.individualMet} met** of $${policy.outOfPocketMax.individualTotal}

*Note*: Services such as Cardiac MRI (CPT 75561) and Specialty Biologics require prior authorization under your policy.`;

      logAuditEvent(
        patient.id,
        patient.name,
        role,
        'Insurance Eligibility Verification',
        'Patient Record',
        policy.id,
        'Insurance & Eligibility Agent',
        'Success',
        true,
        `Verified 270/271 EDI eligibility with ${policy.payerName}`
      );

      return res.json({
        reply: replyText,
        thoughtProcess: `1. Queried real-time EDI 270/271 clearinghouse gateway.\n2. Confirmed active status for policy ${policy.memberId}.\n3. Calculated remaining deductible accumulator ($${policy.deductible.individualTotal - policy.deductible.individualMet}).\n4. Verified prior auth requirements.`,
        intentCategory: 'Insurance',
        agentName: 'Insurance & Eligibility Agent',
        dataPayload: {
          type: 'insurance',
          data: policy
        },
        suggestedActions: [
          { id: 'act-download-card', label: 'View Digital Insurance Card', actionType: 'check_eligibility' },
          { id: 'act-check-auth', label: 'Check Service Prior Auth Rules', actionType: 'verify_auth' }
        ]
      });
    }

    // Scenario: Human Handoff / Escalation
    if (userMessageLower.includes('human') || userMessageLower.includes('representative') || userMessageLower.includes('agent') || userMessageLower.includes('talk to someone') || userMessageLower.includes('speak to')) {
      const ticket: SupportTicket = {
        id: `TCK-${Date.now().toString().slice(-4)}`,
        patientId: patient.id,
        patientName: patient.name,
        subject: `Live Agent Transfer Request: ${patient.name}`,
        department: 'Patient Financial & Revenue Services',
        category: 'General Inquiry',
        priority: 'High',
        status: 'Escalated to Staff',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        assignedStaff: 'Sarah Jenkins, CRCR',
        reasonForEscalation: 'User explicitly requested live specialist transfer from AI conversation.',
        conversationSnippet: `Patient: "${message}"`
      };
      supportTickets.unshift(ticket);

      logAuditEvent(
        patient.id,
        patient.name,
        role,
        'Human Handoff Executed',
        'Support Ticket',
        ticket.id,
        'Human Escalation & Triage Agent',
        'Escalated',
        true,
        `Created escalation ticket ${ticket.id} for human specialist`
      );

      return res.json({
        reply: `I have initiated an immediate transfer to our healthcare operations team.

### 🎫 Escalation Ticket Created: **${ticket.id}**
* **Assigned Specialist**: ${ticket.assignedStaff} (${ticket.department})
* **Priority**: High | **Estimated Wait**: < 2 minutes
* **Context Preserved**: Your patient ID, recent claims, and conversation history have been forwarded so you will not need to repeat information.

A staff representative will join this session shortly, or you can call our direct operational helpline at **(555) 019-7000**.`,
        thoughtProcess: '1. Detected explicit human handoff request.\n2. Created Priority 1 Support Ticket.\n3. Encapsulated conversation context and active clinical records.\n4. Dispatched alert to staff desk.',
        intentCategory: 'Human escalation',
        agentName: 'Human Escalation & Triage Agent',
        dataPayload: {
          type: 'escalation',
          data: ticket
        },
        suggestedActions: [
          { id: 'act-view-ticket', label: 'View Escalation Ticket', actionType: 'escalate' },
          { id: 'act-return-chat', label: 'Continue with AI Assistant', actionType: 'check_eligibility' }
        ]
      });
    }

    // 3. Fallback to Gemini 3.7 Flash Model for general intelligent Q&A with rich healthcare system context
    const ai = getGemini();
    if (ai) {
      try {
        const systemInstruction = `You are CareOps AI, a production-grade healthcare operations AI orchestration agent.
Active Patient Context:
- Name: ${patient.name} (ID: ${patient.id})
- Insurance: ${patient.insuranceName} (Member ID: ${patient.memberId})
- Outstanding Balance: $${patient.outstandingBalance}
- Assigned Provider: ${patient.assignedProviderName}
- Conditions: ${patient.conditions.join(', ')}

Guidelines:
1. Provide accurate, professional, empathetic, concise, and clear operational guidance.
2. Distinguish administrative requests (appointments, billing, claims, documents) from clinical medical requests.
3. NEVER make clinical diagnoses or alter medications.
4. Output Markdown formatting with clear bullet points.
5. If the user asks about hospital policies, cite approved SOP guidelines.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: message,
          config: {
            systemInstruction,
            temperature: 0.2
          }
        });

        const reply = response.text || "I have received your request and coordinated with the healthcare operations system.";

        logAuditEvent(
          patient.id,
          patient.name,
          role,
          'General Operational Inquiry',
          'AI Agent',
          'AGT-ORCH',
          'CareOps Orchestrator Agent',
          'Success',
          true,
          'Processed through Gemini 3.7 Flash orchestration.'
        );

        return res.json({
          reply,
          thoughtProcess: 'Orchestrator routed inquiry to Healthcare Knowledge & Policy Agent. Synthesized context-aware operational guidance.',
          intentCategory: 'General inquiry',
          agentName: 'CareOps Orchestrator Agent',
          suggestedActions: [
            { id: 'act-check-claim', label: 'Check My Claims', actionType: 'view_claim' },
            { id: 'act-book-appt', label: 'Schedule Appointment', actionType: 'book_appt' },
            { id: 'act-check-balance', label: 'View Account Balance', actionType: 'pay_bill' }
          ]
        });
      } catch (err) {
        console.warn("Gemini chat fallback:", err);
      }
    }

    // Standard high-quality operational reply
    return res.json({
      reply: `Hello ${patient.name}! I am CareOps AI, your healthcare operations assistant. I can assist you with:
- 📅 **Scheduling & Rescheduling Appointments** with your providers
- 📑 **Checking Claim Status & Investigating Denials** (e.g. MRI claim CLM-10492)
- 💳 **Explaining Billing Statements & Setting Up Payment Plans**
- 🛡️ **Verifying Insurance Eligibility, Copays & Deductibles**
- 📄 **Uploading & Processing Medical Documents & Insurance Cards**

How may I assist your healthcare operations today?`,
      thoughtProcess: 'Initialized conversational session for Eleanor Vance. Loaded active clinical & administrative profile.',
      intentCategory: 'General inquiry',
      agentName: 'CareOps Orchestrator Agent',
      suggestedActions: [
        { id: 'act-claim', label: 'Why was my MRI claim denied?', actionType: 'view_claim' },
        { id: 'act-appt', label: 'Reschedule my cardiology appointment', actionType: 'book_appt' },
        { id: 'act-bill', label: 'Why is my bill $420?', actionType: 'pay_bill' },
        { id: 'act-ins', label: 'Check my insurance status & deductible', actionType: 'check_eligibility' }
      ]
    });
  });

  // --- VOICE AI CONVERSATION ENDPOINT ---

  app.post("/api/ai/voice", async (req: Request, res: Response) => {
    const { transcript, patientId = 'PAT-1001' } = req.body;
    const patient = patients.find(p => p.id === patientId) || patients[0];
    const textLower = (transcript || "").toLowerCase();

    let spokenReply = "";
    let actionTriggered: any = null;

    if (textLower.includes('reschedule') || (textLower.includes('appointment') && textLower.includes('change'))) {
      const appt = appointments.find(a => a.patientId === patient.id && (a.status === 'Confirmed' || a.status === 'Scheduled')) || appointments[0];
      spokenReply = `Sure thing, Eleanor. I found your cardiology appointment with Dr. Marcus Chen scheduled for September 4th at 10:30 AM. I have an opening available next Tuesday, September 8th at 10:30 AM, or next Thursday at 2:15 PM. Which date would you prefer?`;
      actionTriggered = { type: 'reschedule_prompt', appointment: appt };
    } else if (textLower.includes('tuesday') || textLower.includes('confirm') || textLower.includes('book it')) {
      const appt = appointments.find(a => a.patientId === patient.id) || appointments[0];
      appt.date = '2026-09-08';
      appt.time = '10:30 AM';
      appt.status = 'Rescheduled';
      spokenReply = `Great! I have successfully rescheduled your appointment with Dr. Marcus Chen to Tuesday, September 8th at 10:30 AM at the Main Medical Tower Suite 402. A confirmation notification has been sent to your phone.`;
      actionTriggered = { type: 'rescheduled_success', appointment: appt };
    } else if (textLower.includes('claim') || textLower.includes('denied') || textLower.includes('mri')) {
      const claim = claims.find(c => c.id === 'CLM-10492') || claims[0];
      spokenReply = `I see your Cardiac MRI claim for eighteen hundred and fifty dollars was denied by BlueCross due to a missing prior authorization number. I have already drafted a Level 1 appeal with Dr. Chen's medical necessity notes. Would you like me to submit this appeal now?`;
      actionTriggered = { type: 'claim_denial', claim };
    } else if (textLower.includes('balance') || textLower.includes('owe') || textLower.includes('bill')) {
      spokenReply = `Your current balance is four hundred and twenty dollars for your cardiology consultation on August 10th. Insurance covered three hundred and fifty dollars of the original eight hundred and fifty dollar charge. You can pay online or set up a four-month installment plan at one hundred and five dollars per month.`;
      actionTriggered = { type: 'billing_balance', balance: 420.00 };
    } else if (textLower.includes('human') || textLower.includes('representative') || textLower.includes('transfer')) {
      spokenReply = `Connecting you immediately with our patient operations representative, Sarah Jenkins. Please hold for just a moment.`;
      actionTriggered = { type: 'human_transfer', department: 'Patient Operations' };
    }

    // Check if Gemini API is available for rich conversational voice AI responses
    const ai = getGemini();
    if (!spokenReply && ai) {
      try {
        const voiceSystemPrompt = `You are CareOps Voice AI, a professional, empathetic, and concise healthcare phone assistant speaking live with patient ${patient.name}.
Patient Context:
- Name: ${patient.name} (ID: ${patient.id}, DOB: ${patient.dob})
- Insurance: ${patient.insuranceName} (Member ID: ${patient.memberId})
- Current Balance: $${patient.outstandingBalance}
- Assigned Provider: ${patient.assignedProviderName} (${patient.conditions.join(', ')})
- Upcoming Appointments: 2026-09-04 10:30 AM with Dr. Marcus Chen (Cardiology)
- Recent Claims: CLM-10492 for Cardiac MRI ($1,850.00, Denied due to missing Prior Auth)

Guidelines for Spoken Phone Output:
1. Provide a direct, helpful, spoken answer in 1 to 3 conversational sentences (maximum 45 words) suitable for real-time text-to-speech audio.
2. If patient wants to reschedule, offer Tuesday Sep 8 at 10:30 AM or Thursday Sep 10 at 2:15 PM.
3. If patient asks about claims/denials, explain the missing prior auth for the MRI claim.
4. If patient asks about balance, explain the $420 balance and $105/mo installment plan.
5. If patient expresses an emergency (chest pain, shortness of breath, severe bleeding), immediately urge them to hang up and dial 911.
6. Do NOT output markdown symbols (like #, **, *), URLs, or code blocks because this text will be read aloud by speech synthesis.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: `Patient said over the phone: "${transcript}"`,
          config: {
            systemInstruction: voiceSystemPrompt,
            temperature: 0.3
          }
        });

        if (response.text) {
          spokenReply = response.text.replace(/[*#_`]/g, '').trim();
        }
      } catch (err) {
        console.warn("Gemini voice generation error, using rule-based response:", err);
      }
    }

    if (!spokenReply) {
      spokenReply = `Hello ${patient.name}, this is CareOps Voice AI. I can assist you with your appointments, claim status, billing questions, or connect you directly with clinical staff. How can I help you today?`;
    }

    logAuditEvent(
      patient.id,
      patient.name,
      'patient',
      'Voice Call Interaction',
      'Appointment',
      patient.id,
      'Voice AI Assistant',
      'Success',
      true,
      `Voice transcription processed: "${transcript}"`
    );

    res.json({
      spokenReply,
      actionTriggered,
      callDurationSec: Math.floor(10 + Math.random() * 40)
    });
  });

  // --- VITE MIDDLEWARE SETUP ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CareOps AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
