import React, { useEffect, useState } from 'react';
import Table from '@components/Table';
import Button from '@components/Button';
import Input from '@components/Input';
import { Link } from 'react-router-dom';
import { listCustomers, removeCustomer } from '@services/customers.service';

export default function CustomerList() {
  const [q, setQ] = useState('');
  const [tick, setTick] = useState(0);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    listCustomers().then(setCustomers);
  }, [tick]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      (c.phone || '').includes(q) ||
      (c.gst || '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <div className="toolbar">
        <h2>Customers</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Link to="/customers/new" className="btn primary">
            Add Customer
          </Link>
        </div>
      </div>
      <Table
        headers={['Name', 'Phone', 'GST', 'Address', 'Actions']}
        rows={filtered.map((c) => [
          c.name,
          c.phone,
          c.gst || '-',
          c.address || '-',
          <div key={c.id} className="row">
            <Button
              variant="danger"
              onClick={() => {
                removeCustomer(c.id);
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
