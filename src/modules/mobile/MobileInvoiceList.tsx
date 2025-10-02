// src/modules/mobile/MobileInvoiceList.tsx
import React, { useEffect, useState } from 'react';
import { listInvoices } from '../../services/invoices.service';

export default function MobileInvoiceList() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await listInvoices();
        setInvoices(data ?? []);
      } catch (e: any) {
        setError(e.message || 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: '1.2rem' }}>Invoices</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {invoices.map((inv) => (
            <li key={inv.id} style={{ marginBottom: 12, border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
              <div>ID: {inv.invoiceNumber || inv.id}</div>
              <div>Amount: ₹{inv.total ?? inv.amount}</div>
              <div>Status: {inv.status}</div>
              <button style={{ marginTop: 8 }}>Download PDF</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
