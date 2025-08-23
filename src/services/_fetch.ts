// src/services/_fetch.ts
/**
 * Single source of truth for backend base URL.
 * Priority:
 *  1) VITE_API_URL (recommended)
 *  2) VITE_API_BASE (legacy)
 *  3) http://localhost:5000 (dev)
 * Trailing slashes removed.
 */
function clean(u?: string | null) {
  if (!u) return '';
  return u.replace(/\/$/, '');
}

export const API: string =
  clean(import.meta.env.VITE_API_URL as string) ||
  clean(import.meta.env.VITE_API_BASE as string) ||
  'http://localhost:5000';

export function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function handleResponse(res: Response) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || text || res.statusText;
    throw new Error(message);
  }
  return data;
}
