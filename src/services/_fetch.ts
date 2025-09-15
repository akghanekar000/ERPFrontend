// src/services/fetch.ts

/**
 * Clean trailing slashes from URLs
 */
function clean(u?: string | null): string {
  if (!u) return '';
  return u.replace(/\/+$/, '');
}

/**
 * Backend API base URL.
 * Priority:
 *   1. VITE_API_URL (recommended)
 *   2. VITE_API_BASE (legacy)
 *   3. http://localhost:5000 (dev fallback)
 */
export const API: string =
  clean(import.meta.env.VITE_API_URL) ||
  clean(import.meta.env.VITE_API_BASE) ||
  'http://localhost:5000';

/**
 * Get authorization headers.
 * Works with:
 *  - Clerk JWT (via localStorage or Clerk SDK if you prefer)
 *  - Custom tokens stored as "auth_token"
 */
export function getAuthHeaders(): Record<string, string> {
  try {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    // If localStorage not available (SSR, Node)
    return {};
  }
}

/**
 * Handle API response safely.
 * - Supports JSON and non-JSON responses
 * - Throws clear errors with status code + message
 */
export async function handleResponse(res: Response): Promise<any> {
  let data: any = null;
  const contentType = res.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
  } catch {
    // Ignore parsing error, keep data = null
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      res.statusText ||
      `Request failed with status ${res.status}`;

    throw new Error(message);
  }

  return data;
}

/**
 * Helper for making requests
 * Example:
 *   apiFetch('/users', { method: 'GET' })
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  return handleResponse(response);
}
