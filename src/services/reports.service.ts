import { getApiBase, getAuthHeaders, handleJsonResponse } from './_base';

export async function getSalesSummary(): Promise<{
  totalSales: number;
    count: number;
    }> {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const auth = getAuthHeaders();
          if (auth.Authorization) headers['Authorization'] = auth.Authorization;

            const res = await fetch(`${getApiBase()}/api/reports/sales`, {
                headers,
                  });
                    return handleJsonResponse(res);
                    }
                export type SalesSummary = {
                    totalSales: number;
                      count: number;
                      };
                   