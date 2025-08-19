// src/services/reports.service.ts
import { getApiBase, getAuthHeaders, handleJsonResponse } from './_base';

export async function getSalesSummary(): Promise<{
  totalSales: number;
  count: number;
}> {
  const res = await fetch(`${getApiBase()}/api/reports/sales`, {
    headers: { ...getAuthHeaders() },
  });
  return handleJsonResponse(res);
}
