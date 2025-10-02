// src/modules/mobile/MobileCustomerList.tsx
import React, { useEffect, useState } from 'react';
import { listCustomers } from '../../services/customers.service';

export default function MobileCustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await listCustomers();
        setCustomers(data ?? []);
      } catch (e: any) {
        setError(e.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: '1.2rem' }}>Customers</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {customers.map((cust) => (
            <li key={cust.id} style={{ marginBottom: 12, border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
              <div>Name: {cust.name}</div>
              <div>Email: {cust.email}</div>
              <button style={{ marginTop: 8 }}>View Invoices</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
