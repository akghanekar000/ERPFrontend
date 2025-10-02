import React, { useEffect, useState } from 'react';
import { listInvoices } from '../../services/invoices.service';
import Input from '../../components/Input';

export default function SalesReport() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState('0.00');

  useEffect(() => {
    listInvoices().then(setInvoices);
  }, []);

  useEffect(() => {
    const within = invoices.filter((i: any) => {
      const d = i.date?.slice(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
    setFilteredInvoices(within);
    setTotal(within.reduce((s: number, i: any) => s + (i.total || 0), 0).toFixed(2));
  }, [invoices, from, to]);

  return (
    <div className="card">
      <h3>Sales Report</h3>
      <div className="row" style={{ marginBottom: 12 }}>
        <Input
          type="date"
          value={from}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFrom(e.target.value)}
        />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div>Total Sales: ₹ {total}</div>
    </div>
  );
}
