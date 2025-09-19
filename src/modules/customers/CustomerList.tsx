import React, { useMemo, useState } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Link } from 'react-router-dom';
import { listCustomers, deleteCustomer } from '../../services/customers.service';

export default function CustomerList() {
  const [q, setQ] = useState('');
  const [tick, setTick] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Add type for customer
  type Customer = {
    id: string;
    name: string;
    phone?: string;
    gst?: string;
    address?: string;
  };

  // Fetch customers asynchronously
  React.useEffect(() => {
    let mounted = true;
    listCustomers().then((data: Customer[]) => {
      if (mounted) setCustomers(data);
    });
    return () => { mounted = false; };
  }, [tick]);

  const filtered = customers.filter(
    (c: Customer) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      (c.phone || '').includes(q) ||
      (c.gst || '').toLowerCase().includes(q.toLowerCase())
  );

  // Handle customer deletion with error handling
  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      setTick((x) => x + 1);
    } catch (err) {
      alert('Failed to delete customer.');
    }
  };

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
        rows={filtered.map((c: Customer) => [
          c.name,
          c.phone,
          c.gst || '-',
          c.address || '-',
          <div key={c.id} className="row">
            <Button
              variant="danger"
              onClick={() => handleDelete(c.id)}
            >
              Delete
            </Button>
          </div>,
        ])}
      />
    </div>
  );
}
