import React, { useMemo, useState, useEffect } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Link } from 'react-router-dom';
import { listInvoices, deleteInvoice, Invoice } from '../../services/invoices.service';
import { formatDate } from '../../utils/formatDate';
import Invoices from './Invoices';


const InvoiceList: React.FC = () => {
  const [q, setQ] = useState('');
  const [tick, setTick] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    async function load() {
      const data = await listInvoices();
      setInvoices(data ?? []);
    }
    load();
  }, [tick]);

  const filtered = invoices.filter((i: Invoice) =>
    (i.id ?? '').toLowerCase().includes(q.toLowerCase()) ||
    (typeof i.customer === 'object' ? i.customer.name : i.customer ?? '').toLowerCase().includes(q.toLowerCase())
  );

  const totalSales = invoices.reduce((sum: number, i: Invoice) => sum + (i.total ?? 0), 0).toFixed(2);

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
          <div className="label">Invoices</div>
          <div className="value">{invoices.length}</div>
        </div>
      </div>

      <Table
        headers={["No.", "Customer", "Subtotal", "Tax", "Total", "Actions"]}
        rows={filtered.map((i: Invoice, idx: number) => [
          (i.id ?? i._id ?? (idx + 1)).toString(),
          typeof i.customer === 'object' ? i.customer.name : i.customer ?? '',
          i.subtotal?.toFixed(2) ?? '',
          i.tax?.toFixed(2) ?? '',
          i.total?.toFixed(2) ?? '',
          <div key={i.id ?? i._id ?? idx} className="row">
            <Button
              variant="danger"
              onClick={() => {
                deleteInvoice(i.id ?? i._id ?? '');
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
};

export default InvoiceList;
