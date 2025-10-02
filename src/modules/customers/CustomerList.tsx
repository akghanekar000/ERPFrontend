import React, { useEffect, useState } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Link } from 'react-router-dom';
import { listCustomers, deleteCustomer, Customer } from '../../services/customers.service';
import { addAuditLogEntry } from '../../services/auditlog.service';
import { useAuth } from '../../components/AuthContext';
import Papa from 'papaparse';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CustomerList() {
  const [q, setQ] = useState('');
  const [tick, setTick] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const data = await listCustomers();
        setCustomers(data ?? []);
      } catch (e) {
        toast.error('Failed to load customers');
      }
    }
    load();
  }, [tick]);

  const filtered = customers.filter((c) => {
    const query = q.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      (c.phone ?? '').toLowerCase().includes(query) ||
      (c.gst ?? '').toLowerCase().includes(query) ||
      (c.address ?? '').toLowerCase().includes(query)
    );
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      setTick((x) => x + 1);
      await addAuditLogEntry({
        user: user?.name || 'Unknown',
        action: 'Delete Customer',
        timestamp: new Date().toISOString(),
        details: `Customer ID: ${id}`,
      });
      toast.success('Customer deleted and logged');
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const handleExport = () => {
    const csv = Papa.unparse(customers);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: (results: any) => {
        // TODO: send imported data to backend
        toast.success('Imported CSV');
        setTick((x) => x + 1);
      },
      error: () => toast.error('Import failed'),
    });
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="toolbar">
        <h2>Customers</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Input
            placeholder="Search by name, phone, GST, address..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ minWidth: 180 }}
          />
          {/* Example filter: status (active/inactive) */}
          <select style={{ minWidth: 120 }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {user?.role === 'admin' || user?.role === 'manager' ? (
            <Link to="/customers/new" className="btn primary">
              Add Customer
            </Link>
          ) : null}
          <Button onClick={handleExport}>Export CSV</Button>
          <label className="btn">
            Import CSV
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
          </label>
        </div>
      </div>
      <Table
        headers={['Name', 'Phone', 'GST', 'Address', 'Actions']}
        rows={filtered.map((c) => [
          c.name,
          c.phone ?? '-',
          c.gst ?? '-',
          c.address ?? '-',
          <div key={c.id} className="row">
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Button
                variant="danger"
                onClick={() => handleDelete(c.id)}
              >
                Delete
              </Button>
            )}
          </div>
        ])}
      />
    </div>
  );
}
