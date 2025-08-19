// src/services/_base.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getApiBase() {
  return API_BASE;
}

export function getAuthHeaders(token?: string) {
  const t = token ?? localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function handleJsonResponse(res: Response) {
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw data || { message: res.statusText || 'Request failed' };
    return data;
  } catch (err) {
    // if parsing fails, throw generic
    if (!res.ok) throw { message: res.statusText || 'Request failed' };
    return null;
  }
}
