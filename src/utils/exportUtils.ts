import { Claim, Invoice, AuditLog } from '../types';

/**
 * Utility to convert an array of objects to a downloadable CSV file.
 */
export function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) return;

  const separator = ',';
  const keys = Object.keys(rows[0]);

  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            if (Array.isArray(cell)) {
              cell = cell.join('; ');
            } else if (typeof cell === 'object') {
              cell = JSON.stringify(cell);
            }
            cell = String(cell).replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportClaimsToCSV(claims: Claim[]) {
  const data = claims.map(c => ({
    'Claim ID': c.id,
    'Patient ID': c.patientId,
    'Patient Name': c.patientName,
    'Service Date': c.serviceDate,
    'Payer Name': c.payerName,
    'Service Description': c.serviceDescription,
    'CPT Codes': (c.procedureCodes || c.cptCodes || []).join('; '),
    'Billed Amount ($)': (c.submittedAmount || c.totalBilledAmount || 0).toFixed(2),
    'Allowed Amount ($)': (c.allowedAmount || 0).toFixed(2),
    'Payer Paid ($)': (c.paidAmount || 0).toFixed(2),
    'Patient Responsibility ($)': (c.patientResponsibility || 0).toFixed(2),
    'Status': c.status,
    'Denial Category': c.denialCategory || '',
    'Denial Reason': c.denialReason || '',
    'Appeal Status': c.appealStatus || 'Not Started'
  }));
  downloadCSV('careops-claims-denial-queue', data);
}

export function exportInvoicesToCSV(invoices: Invoice[]) {
  const data = invoices.map(inv => ({
    'Invoice ID': inv.id,
    'Patient ID': inv.patientId,
    'Patient Name': inv.patientName,
    'Service Date': inv.serviceDate,
    'Due Date': inv.dueDate,
    'Service Description': inv.serviceDescription,
    'Total Charges ($)': inv.totalCharges.toFixed(2),
    'Insurance Adjustments ($)': inv.insuranceAdjustments.toFixed(2),
    'Insurance Paid ($)': inv.insurancePaid.toFixed(2),
    'Patient Paid ($)': inv.patientPaid.toFixed(2),
    'Balance Due ($)': inv.balanceDue.toFixed(2),
    'Status': inv.status,
    'Aging Category': inv.agingCategory
  }));
  downloadCSV('careops-aging-receivables-ledger', data);
}

export function exportAuditLogsToCSV(logs: AuditLog[]) {
  const data = logs.map(l => ({
    'Audit ID': l.id,
    'Timestamp': l.timestamp,
    'User ID': l.userId,
    'User Name': l.userName,
    'User Role': l.userRole,
    'Action': l.action,
    'Resource Type': l.resourceType,
    'Resource ID': l.resourceId,
    'AI Agent Used': l.aiAgentUsed || 'None',
    'Result': l.result,
    'PHI Accessed': l.phiAccessed ? 'YES' : 'NO',
    'IP Address': l.ipAddress,
    'Notes': l.notes || ''
  }));
  downloadCSV('careops-hipaa-audit-compliance-trail', data);
}
