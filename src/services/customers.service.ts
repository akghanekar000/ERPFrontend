// src/services/customers.service.ts

import { API, handleResponse, getAuthHeaders } from './_fetch';

export type Customer = {
  id?: string;
  _id?: string;
  name: string;
  phone?: string;
  email?: string;
  gst?: string;
  gstin?: string;
  address?: string;
  state?: string;
  stateCode?: string;
};

function normalizeCustomer(customer: any): Customer {
  return {
    ...customer,
    id: customer.id || customer._id,
    gst: customer.gst || customer.gstin || '',
    gstin: customer.gstin || customer.gst || '',
  };
}

export async function listCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API}/api/customers`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  const data = await handleResponse(res);
  return Array.isArray(data) ? data.map(normalizeCustomer) : [];
}

export async function getCustomer(id: string): Promise<Customer> {
  const res = await fetch(`${API}/api/customers/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  return normalizeCustomer(await handleResponse(res));
}

export async function addCustomer(payload: Partial<Customer>) {
  const res = await fetch(`${API}/api/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return normalizeCustomer(await handleResponse(res));
}

export async function updateCustomer(
  id: string,
  payload: Partial<Customer>,
) {
  const res = await fetch(`${API}/api/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return normalizeCustomer(await handleResponse(res));
}

export async function deleteCustomer(id: string) {
  const res = await fetch(`${API}/api/customers/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  return handleResponse(res);
}

