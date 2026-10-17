
import { API, handleResponse, getAuthHeaders } from './_fetch';

export type AuditLogEntry = {
  user?: string;
  action: string;
  timestamp?: string;
  details?: string;
};

export async function addAuditLogEntry(
  entry: AuditLogEntry
) {
  const response = await fetch(`${API}/api/audit-logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      action: entry.action,
      details: entry.details ?? '',
    }),
  });

  return handleResponse(response);
}

