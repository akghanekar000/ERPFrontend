// src/modules/invoices/BulkInvoiceActions.tsx
import React, { useState } from 'react';

export default function BulkInvoiceActions() {
  const [selected, setSelected] = useState<string[]>([]);

  function handleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleBulkAction(action: string) {
    // Replace with actual bulk API call
    alert(`Performing '${action}' on invoices: ${selected.join(', ')}`);
  }

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await import('../../services/invoices.service').then(m => m.listInvoices());
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
    <div>
      <h2>Bulk Invoice Actions</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <ul>
          {invoices.map((inv) => (
            <li key={inv.id}>
              <input
                type="checkbox"
                checked={selected.includes(inv.id)}
                onChange={() => handleSelect(inv.id)}
              />
              {inv.invoiceNumber || inv.id} - ₹{inv.total ?? inv.amount}
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => handleBulkAction('Send')}>Send</button>
      <button onClick={() => handleBulkAction('Download')}>Download</button>
      <button onClick={() => handleBulkAction('Delete')}>Delete</button>
    </div>
  );
}
