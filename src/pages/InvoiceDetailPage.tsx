// src/pages/InvoiceDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getInvoice, Invoice } from '../services/invoices.service';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getInvoice(id)
        .then(setInv)
        .catch(() => setError('Failed to load invoice.'));
    }
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!inv) return <div>Loading...</div>;

  return (
    <div>
  <h1 className="text-xl font-semibold mb-3">Invoice #{inv.id ?? 'N/A'}</h1>
      <div className="mb-3">
        Customer: {typeof inv.customer === 'object' ? inv.customer.name : inv.customer}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Product</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
            {(inv.items || []).map((it: any, idx: number) => (
            <tr key={idx}>
              <td>{typeof it.product === 'object' ? it.product.name : it.product}</td>
              <td className="text-center">{it.qty}</td>
              <td className="text-center">{it.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        Subtotal: {inv.subtotal} | Tax: {inv.tax} | Total: {inv.total}
      </div>
    </div>
  );
}
