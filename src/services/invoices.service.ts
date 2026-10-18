// Add Invoice type for InvoiceDetailPage

import { API, handleResponse, getAuthHeaders } from './_fetch';

export type InvoiceItem = {
  product: string;
  qty: number;
  price: number;
  priceMode: 'inclusive' | 'exclusive';
  gstRate: number;
};

export type InvoicePayload = {
  customer: string;
  items: InvoiceItem[];
  notes?: string;
};

export type Invoice = {
  id?: string;
  _id?: string;
  invoiceNumber?: string;
  customer: { name: string } | string;
  items: Array<{
    product: { name: string } | string;
    qty: number;
    price: number;
    priceMode?: 'inclusive' | 'exclusive';
    gstRate?: number;
    taxableAmount?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    taxAmount?: number;
    lineTotal?: number;
  }>;
  subtotal: number;
  taxableAmount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  tax: number;
  total: number;
  status?: string;
  date?: string;
  createdAt?: string;
  notes?: string;
};

export async function listInvoices(): Promise<Invoice[]> {
  const res = await fetch(`${API}/api/invoices`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  return handleResponse(res);
}

export async function getInvoice(id: string): Promise<Invoice> {
  const res = await fetch(`${API}/api/invoices/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  return handleResponse(res);
}

export async function createInvoice(payload: InvoicePayload): Promise<Invoice> {
  const res = await fetch(`${API}/api/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteInvoice(id: string) {
  const res = await fetch(`${API}/api/invoices/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  return handleResponse(res);
}
