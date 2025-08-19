// src/services/_fetch.ts
export const API = (import.meta.env.VITE_API_BASE as string) || '';

export function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function handleResponse(res: Response) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (data && data.message) || text || res.statusText;
    throw new Error(message);
  }
  return data;
}
