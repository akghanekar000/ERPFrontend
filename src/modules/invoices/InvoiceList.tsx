import React, { useMemo, useState } from 'react';
import Table from '@components/Table';
import Button from '@components/Button';
import Input from '@components/Input';
import { Link } from 'react-router-dom';
import { listInvoices, removeInvoice } from '@services/invoices.service';
import { formatDate } from '@utils/formatDate';

export default function InvoiceList() {
  const [q, setQ] = useState('');
  const [tick, setTick] = useState(0);
  const invoices = useMemo(() => listInvoices(), [tick]);

  const filtered = invoices.filter(
    (i) =>
      i.invoiceNumber.toLowerCase().includes(q.toLowerCase()) ||
      i.customerName.toLowerCase().includes(q.toLowerCase())
  );

  const totalSales = invoices.reduce((sum, i) => sum + i.total, 0).toFixed(2);
  const unpaid = invoices
    .filter((i) => i.status === 'UNPAID')
    .reduce((s, i) => s + i.total, 0)
    .toFixed(2);

  return (
    <div>
      <div className="toolbar">
        <h2>Invoices</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            placeholder="Search invoice/customer..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Link to="/invoices/new" className="btn primary">
            New Invoice
          </Link>
        </div>
      </div>

      <div className="grid" style={{ marginBottom: 12 }}>
        <div className="stat">
          <div className="label">Total Sales</div>
          <div className="value">₹ {totalSales}</div>
        </div>
        <div className="stat">
          <div className="label">Unpaid</div>
          <div className="value">₹ {unpaid}</div>
        </div>
        <div className="stat">
          <div className="label">Invoices</div>
          <div className="value">{invoices.length}</div>
        </div>
      </div>

      <Table
        headers={[
          'No.',
          'Date',
          'Customer',
          'Subtotal',
          'Tax',
          'Total',
          'Status',
          'Actions',
        ]}
        rows={filtered.map((i) => [
          i.invoiceNumber,
          formatDate(i.date),
          i.customerName,
          i.subtotal.toFixed(2),
          i.tax.toFixed(2),
          i.total.toFixed(2),
          i.status,
          <div key={i.id} className="row">
            <Button
              variant="danger"
              onClick={() => {
                removeInvoice(i.id);
                setTick((x) => x + 1);
              }}
            >
              Delete
            </Button>
          </div>,
        ])}
      />
    </div>
  );
}
