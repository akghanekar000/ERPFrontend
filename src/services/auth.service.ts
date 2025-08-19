// src/services/auth.service.ts
import { API, handleResponse, getAuthHeaders } from './_fetch';

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  if (data?.token) localStorage.setItem('auth_token', data.token);
  return data;
}

export function logout() {
  localStorage.removeItem('auth_token');
}

export async function me() {
  const res = await fetch(`${API}/api/auth/me`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}
