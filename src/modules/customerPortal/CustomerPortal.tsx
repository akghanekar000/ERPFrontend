// src/modules/customerPortal/CustomerPortal.tsx
import React, { useEffect, useState } from 'react';
import { listInvoices } from '../../services/invoices.service';

export default function CustomerPortal() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await listInvoices();
      setInvoices(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <h2>My Invoices</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="customer-invoice-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id}>
                <td>{i.invoiceNumber}</td>
                <td>{new Date(i.date).toLocaleDateString()}</td>
                <td>₹{i.total}</td>
                <td>{i.status}</td>
                <td>
                  <button className="btn primary">Download PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
