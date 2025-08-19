import React, { useMemo, useState } from 'react';
import { listInvoices } from '@services/invoices.service';
import Input from '@components/Input';

export default function SalesReport() {
  const invoices = useMemo(() => listInvoices(), []);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const within = invoices.filter((i) => {
    const d = i.date.slice(0, 10);
    if (from && d < from) return False;
    if (to && d > to) return False;
    return true;
  });
  const total = within.reduce((s, i) => s + i.total, 0).toFixed(2);

  return (
    <div className="card">
      <h3>Sales Report</h3>
      <div className="row" style={{ marginBottom: 12 }}>
        <Input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div>Total Sales: ₹ {total}</div>
    </div>
  );
}
