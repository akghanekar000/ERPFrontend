// src/pages/InvoicesPage.tsx
import React, { useEffect, useState } from 'react';
import {
  listInvoices,
  createInvoice,
  deleteInvoice,
  Invoice,
} from '../services/invoices.service';
import { listProducts } from '../services/products.service';
import { listCustomers } from '../services/customers.service';

export default function InvoicesPage() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customer, setCustomer] = useState('');
  const [product, setProduct] = useState('');
  const [qty, setQty] = useState<number>(1);
  const [tax, setTax] = useState<number>(0);

  async function load() {
    setRows(await listInvoices());
  }
  useEffect(() => {
    load();
    listCustomers().then(setCustomers);
    listProducts().then(setProducts);
  }, []);

  async function add() {
    if (!customer || !product) return;
    await createInvoice({ customer, items: [{ product, qty }], tax });
    setCustomer('');
    setProduct('');
    setQty(1);
    setTax(0);
    load();
  }

  async function remove(id: string) {
    await deleteInvoice(id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <select
          className="border rounded p-2"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        >
          <option value="">Select customer</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="border rounded p-2"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="border rounded p-2 w-24"
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value || '1'))}
        />
        <input
          type="number"
          className="border rounded p-2 w-24"
          placeholder="Tax"
          value={tax}
          onChange={(e) => setTax(parseFloat(e.target.value || '0'))}
        />
        <button className="px-3 py-2 border rounded" onClick={add}>
          Create
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              <td>{(r.customer as any)?.name || r.customer}</td>
              <td className="text-center">{r.items.length}</td>
              <td className="text-center">{r.total}</td>
              <td className="text-right">
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => remove(r._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
