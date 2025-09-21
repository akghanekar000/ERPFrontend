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
    try {
  const selectedProduct = products.find((p) => p.id === product);
      const price = selectedProduct ? selectedProduct.price : 0;
      const subtotal = price * qty;
      const total = subtotal + tax;
      await createInvoice({
        customerId: customer,
        items: [{ productId: product, qty, price }],
        tax,
        subtotal,
        total,
      });
      setCustomer('');
      setProduct('');
      setQty(1);
      setTax(0);
      load();
    } catch (err) {
      alert('Failed to create invoice.');
    }
  }

  async function remove(id: string) {
    try {
      await deleteInvoice(id);
      load();
    } catch (err) {
      alert('Failed to delete invoice.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <select
          className="border rounded p-2"
          value={customer}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCustomer(e.target.value)}
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
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProduct(e.target.value)}
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="border rounded p-2 w-24"
          value={qty}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQty(parseInt(e.target.value || '1'))}
        />
        <input
          type="number"
          className="border rounded p-2 w-24"
          placeholder="Tax"
          value={tax}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTax(parseFloat(e.target.value || '0'))}
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
          {rows.filter(r => r.id || r._id).map((r) => (
            <tr key={r.id ?? r._id}>
              <td>{typeof r.customer === 'object' ? r.customer.name : r.customer}</td>
              <td className="text-center">{r.items.length}</td>
              <td className="text-center">{r.total ?? 0}</td>
              <td className="text-right">
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => remove((r.id ?? r._id) as string)}
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
