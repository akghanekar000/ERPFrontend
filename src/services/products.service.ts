// src/services/products.service.ts
// src/services/products.service.ts
import { API, handleResponse, getAuthHeaders } from './_fetch';

export type Product = {
  id: string;
  name: string;
  price: number;
  sku?: string;
  description?: string;
  stock?: number;
};

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(`${API}/api/products`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${API}/api/products/${id}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function createProduct(payload: Partial<Product>) {
  const res = await fetch(`${API}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const res = await fetch(`${API}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API}/api/products/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return handleResponse(res);
}
