// src/services/customers.service.ts
// src/services/customers.service.ts
import { API, handleResponse, getAuthHeaders } from './_fetch';

export type Customer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
};

export async function listCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API}/api/customers`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function getCustomer(id: string): Promise<Customer> {
  const res = await fetch(`${API}/api/customers/${id}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function createCustomer(payload: Partial<Customer>) {
  const res = await fetch(`${API}/api/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateCustomer(id: string, payload: Partial<Customer>) {
  const res = await fetch(`${API}/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteCustomer(id: string) {
  const res = await fetch(`${API}/api/customers/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}
