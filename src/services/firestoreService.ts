import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Patient,
  Provider,
  Appointment,
  Claim,
  Invoice,
  SupportTicket,
  AuditLog,
  UserProfile
} from '../types';
import {
  mockPatients,
  mockProviders,
  mockAppointments,
  mockClaims,
  mockInvoices,
  mockSupportTickets,
  mockAuditLogs
} from '../data/mockData';

// Collection references
const PATIENTS_COL = 'patients';
const PROVIDERS_COL = 'providers';
const APPOINTMENTS_COL = 'appointments';
const CLAIMS_COL = 'claims';
const INVOICES_COL = 'invoices';
const TICKETS_COL = 'supportTickets';
const AUDIT_COL = 'auditLogs';
const USERS_COL = 'users';

/**
 * Seeds initial mock data into Firestore if collections are empty.
 * This guarantees the user has authentic persistent records and relational data.
 */
export async function seedInitialDataIfEmpty(): Promise<boolean> {
  try {
    const patientsSnapshot = await getDocs(collection(db, PATIENTS_COL));
    if (!patientsSnapshot.empty) {
      console.log('Firestore already contains data, skipping seed.');
      return false;
    }

    console.log('Seeding initial relational dataset into Firestore...');
    const batch = writeBatch(db);

    // Seed Patients
    mockPatients.slice(0, 10).forEach(p => {
      const ref = doc(db, PATIENTS_COL, p.id);
      batch.set(ref, p);
    });

    // Seed Appointments
    mockAppointments.forEach(apt => {
      const ref = doc(db, APPOINTMENTS_COL, apt.id);
      batch.set(ref, apt);
    });

    // Seed Claims
    mockClaims.forEach(clm => {
      const ref = doc(db, CLAIMS_COL, clm.id);
      batch.set(ref, clm);
    });

    // Seed Invoices
    mockInvoices.forEach(inv => {
      const ref = doc(db, INVOICES_COL, inv.id);
      batch.set(ref, inv);
    });

    // Seed Tickets
    mockSupportTickets.forEach(tck => {
      const ref = doc(db, TICKETS_COL, tck.id);
      batch.set(ref, tck);
    });

    // Seed Audit Logs
    mockAuditLogs.forEach(aud => {
      const ref = doc(db, AUDIT_COL, aud.id);
      batch.set(ref, aud);
    });

    await batch.commit();
    console.log('Successfully seeded authentic Firestore records!');
    return true;
  } catch (error) {
    console.warn('Initial seeding encountered an error or rules check:', error);
    return false;
  }
}

// Subscribe to Patients
export function subscribeToPatients(callback: (patients: Patient[]) => void): () => void {
  const colRef = collection(db, PATIENTS_COL);
  return onSnapshot(
    colRef,
    snapshot => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Patient));
        callback(data);
      }
    },
    error => {
      handleFirestoreError(error, OperationType.GET, PATIENTS_COL);
    }
  );
}

// Subscribe to Appointments (ordered by date/time)
export function subscribeToAppointments(callback: (appointments: Appointment[]) => void): () => void {
  const colRef = collection(db, APPOINTMENTS_COL);
  return onSnapshot(
    colRef,
    snapshot => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Appointment));
        callback(data);
      }
    },
    error => {
      handleFirestoreError(error, OperationType.GET, APPOINTMENTS_COL);
    }
  );
}

// Subscribe to Claims
export function subscribeToClaims(callback: (claims: Claim[]) => void): () => void {
  const colRef = collection(db, CLAIMS_COL);
  return onSnapshot(
    colRef,
    snapshot => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Claim));
        callback(data);
      }
    },
    error => {
      handleFirestoreError(error, OperationType.GET, CLAIMS_COL);
    }
  );
}

// Subscribe to Invoices
export function subscribeToInvoices(callback: (invoices: Invoice[]) => void): () => void {
  const colRef = collection(db, INVOICES_COL);
  return onSnapshot(
    colRef,
    snapshot => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Invoice));
        callback(data);
      }
    },
    error => {
      handleFirestoreError(error, OperationType.GET, INVOICES_COL);
    }
  );
}

// Subscribe to Support Tickets
export function subscribeToSupportTickets(callback: (tickets: SupportTicket[]) => void): () => void {
  const colRef = collection(db, TICKETS_COL);
  return onSnapshot(
    colRef,
    snapshot => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as SupportTicket));
        callback(data);
      }
    },
    error => {
      handleFirestoreError(error, OperationType.GET, TICKETS_COL);
    }
  );
}

// Subscribe to Audit Logs
export function subscribeToAuditLogs(callback: (logs: AuditLog[]) => void): () => void {
  const colRef = collection(db, AUDIT_COL);
  return onSnapshot(
    colRef,
    snapshot => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as AuditLog));
        callback(data);
      }
    },
    error => {
      handleFirestoreError(error, OperationType.GET, AUDIT_COL);
    }
  );
}

// Appointment CRUD Operations
export async function createAppointmentInFirestore(apt: Appointment): Promise<boolean> {
  const path = `${APPOINTMENTS_COL}/${apt.id}`;
  try {
    await setDoc(doc(db, APPOINTMENTS_COL, apt.id), apt);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAppointmentInFirestore(id: string, updates: Partial<Appointment>): Promise<boolean> {
  const path = `${APPOINTMENTS_COL}/${id}`;
  try {
    await updateDoc(doc(db, APPOINTMENTS_COL, id), updates);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAppointmentInFirestore(id: string): Promise<boolean> {
  const path = `${APPOINTMENTS_COL}/${id}`;
  try {
    await deleteDoc(doc(db, APPOINTMENTS_COL, id));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Claim Operations
export async function updateClaimInFirestore(id: string, updates: Partial<Claim>): Promise<boolean> {
  const path = `${CLAIMS_COL}/${id}`;
  try {
    await updateDoc(doc(db, CLAIMS_COL, id), updates);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Invoice Operations
export async function updateInvoiceInFirestore(id: string, updates: Partial<Invoice>): Promise<boolean> {
  const path = `${INVOICES_COL}/${id}`;
  try {
    await updateDoc(doc(db, INVOICES_COL, id), updates);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Support Ticket Operations
export async function createSupportTicketInFirestore(ticket: SupportTicket): Promise<boolean> {
  const path = `${TICKETS_COL}/${ticket.id}`;
  try {
    await setDoc(doc(db, TICKETS_COL, ticket.id), ticket);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Audit Log Append
export async function appendAuditLogInFirestore(log: AuditLog): Promise<boolean> {
  const path = `${AUDIT_COL}/${log.id}`;
  try {
    await setDoc(doc(db, AUDIT_COL, log.id), log);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// User Profile in Firestore
export async function syncUserProfileToFirestore(user: UserProfile): Promise<boolean> {
  const path = `${USERS_COL}/${user.id}`;
  try {
    await setDoc(doc(db, USERS_COL, user.id), user, { merge: true });
    return true;
  } catch (error) {
    console.warn('Could not sync user profile to Firestore:', error);
    return false;
  }
}
