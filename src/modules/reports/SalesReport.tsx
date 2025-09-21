import React, { useMemo, useState } from 'react';
import { listInvoices } from '../../services/invoices.service';
import Input from '../../components/Input';
import { Invoice } from '../../services/invoices.service'; 

export default function SalesReport() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  React.useEffect(() => {
    async function fetchInvoices() {
      const data = await listInvoices();
      setInvoices(data ?? []);
    }
    fetchInvoices();
  }, []);

  const within = invoices.filter((i: Invoice) => {
    const d = i.date.slice(0, 10);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
  const total = within.reduce((s: number, i: Invoice) => s + i.total, 0).toFixed(2);

  return (
    <div className="card">
      <h3>Sales Report</h3>
      <div className="row" style={{ marginBottom: 12 }}>
        <Input
          type="date"
          value={from}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFrom(e.target.value)}
        />
        <Input
          type="date"
          value={to}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
        />
      </div>
      <div>Total Sales: ₹ {total}</div>
    </div>
  );
}
