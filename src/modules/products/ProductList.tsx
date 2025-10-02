import React, { useEffect, useState } from 'react';
import { listProducts, Product } from '../../services/products.service';
import { deleteProduct } from '../../services/products.service';
import { addAuditLogEntry } from '../../services/auditlog.service';
import { useAuth } from '../../components/AuthContext';
import Papa from 'papaparse';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProductList() {
  const [q, setQ] = useState('');
  const [tick, setTick] = useState(0);
  const [items, setItems] = useState<Product[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      try {
  const data = await listProducts();
        setItems(data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function load() {
      try {
  const data = await listProducts();
        setItems(data);
      } catch (e) {
        toast.error('Failed to load products');
      }
    }
    load();
  }, [tick]);

  const filtered = items.filter((p) => {
    const query = q.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      (p.sku ?? '').toLowerCase().includes(query) ||
      (p.description ?? '').toLowerCase().includes(query)
    );
  });

  const handleExport = () => {
    const csv = Papa.unparse(items);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
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
        <h2>Products</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            placeholder="Search by name, SKU, description..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ minWidth: 180 }}
          />
          {user?.role === 'admin' || user?.role === 'manager' ? (
            <button className="btn primary">Add Product</button>
          ) : null}
          <button className="btn" onClick={handleExport}>Export CSV</button>
          <label className="btn">
            Import CSV
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
          </label>
        </div>
      </div>
      <ul>
        {filtered.map((p) => (
          <li key={p.id}>
            {p.name} — ₹{p.price} — stock {p.stock}
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <button
                className="btn danger"
                style={{ marginLeft: 8 }}
                onClick={async () => {
                  try {
                    await deleteProduct(p.id);
                    setTick((x) => x + 1);
                    await addAuditLogEntry({
                      user: user?.name || 'Unknown',
                      action: 'Delete Product',
                      timestamp: new Date().toISOString(),
                      details: `Product ID: ${p.id}`,
                    });
                    toast.success('Product deleted and logged');
                  } catch {
                    toast.error('Delete failed');
                  }
                }}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
