// Add Invoice type for InvoiceDetailPage
export type Invoice = {
  id?: string;
  _id?: string;
  customer: { name: string } | string;
  items: Array<{
    product: { name: string } | string;
    qty: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
};
// src/services/invoices.service.ts
// src/services/invoices.service.ts
import { API, handleResponse, getAuthHeaders } from './_fetch';

export type InvoiceItem = { productId: string; qty: number; price: number };
export type InvoicePayload = {
  invoiceNumber?: string;
  customerId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  total: number;
  notes?: string;
};

export async function listInvoices() {
  const res = await fetch(`${API}/api/invoices`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function getInvoice(id: string) {
  const res = await fetch(`${API}/api/invoices/${id}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function createInvoice(payload: InvoicePayload) {
  const res = await fetch(`${API}/api/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteInvoice(id: string) {
  const res = await fetch(`${API}/api/invoices/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}
