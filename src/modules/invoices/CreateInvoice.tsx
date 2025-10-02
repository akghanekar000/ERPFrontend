import React, { useEffect, useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { listCustomers } from '../../services/customers.service';
import { listProducts } from '../../services/products.service';
import { createInvoice } from '../../services/invoices.service';
import { calculateGST } from '../../utils/calculateGST';
import { v4 as uuid } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../services/products.service';
import { Customer } from '../../services/customers.service';

export default function CreateInvoice() {
  const nav = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState(
    () => 'INV-' + Math.random().toString(36).slice(2, 7).toUpperCase()
  );
  const [date, setDate] = useState(() => new Date().toISOString());
  const [customerId, setCustomerId] = useState('');
  const [gstRate, setGstRate] = useState<number | ''>(18);
  const [items, setItems] = useState<{
    id: string;
    productId: string;
    name: string;
    price: number;
    qty: number;
    amount: number;
  }[]>([]);

  useEffect(() => {
    listProducts().then(setProducts);
    listCustomers().then(setCustomers);
  }, []);

  const addItem = () => {
    if (!products.length) return alert('Add products first');
    const p = products[0];
    setItems((s) => [
      ...s,
      {
        id: uuid(),
        productId: p.id,
        name: p.name,
        price: p.price,
        qty: 1,
        amount: p.price,
      },
    ]);
  };

  const updateItem =
    (id: string, field: 'productId' | 'qty') =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.id !== id) return it;
          if (field === 'productId') {
            const p = products.find((x: Product) => x.id === e.target.value)!;
            return {
              ...it,
              productId: p.id,
              name: p.name,
              price: p.price,
              amount: +(p.price * it.qty).toFixed(2),
            };
          } else {
            const qty = Math.max(1, Number(e.target.value || 1));
            return { ...it, qty, amount: +(it.price * qty).toFixed(2) };
          }
        })
      );
    };

  const removeItem = (id: string) =>
    setItems((s) => s.filter((i) => i.id !== id));

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const gstAmount = calculateGST(Number(subtotal) || 0, Number(gstRate) || 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c: Customer) => c.id === customerId);
    if (!customer) return alert('Select customer');
    if (!items.length) return alert('Add at least one item');

    await createInvoice({
      invoiceNumber,
      customerId,
      items,
      subtotal,
      tax: gstAmount,
      total: subtotal + gstAmount,
    });
    nav('/invoices');
  };

  return (
    <div className="card">
      <h3>Create Invoice</h3>
      <form onSubmit={submit} className="row">
        <div className="row" style={{ width: '100%' }}>
          <Input
            placeholder="Invoice No."
            value={invoiceNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceNumber(e.target.value)}
          />
          <Input
            type="date"
            value={date.slice(0, 10)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(new Date(e.target.value).toISOString())}
          />
          <select
            className="input"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Select customer</option>
            {customers.map((c: Customer) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="GST %"
            value={gstRate}
            onChange={(e) =>
              setGstRate(e.target.value === '' ? '' : Number(e.target.value))
            }
          />
        </div>

        <div className="card" style={{ width: '100%' }}>
          <div className="toolbar">
            <strong>Items</strong>
            <Button onClick={addItem}>Add Item</Button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <select
                      className="input"
                      value={it.productId}
                      onChange={updateItem(it.id, 'productId')}
                    >
                      {products.map((p: Product) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>₹ {it.price.toFixed(2)}</td>
                  <td>
                    <Input
                      type="number"
                      value={it.qty}
                      onChange={updateItem(it.id, 'qty')}
                    />
                  </td>
                  <td>₹ {it.amount.toFixed(2)}</td>
                  <td>
                    <Button variant="danger" onClick={() => removeItem(it.id)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="row"
          style={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <div style={{ minWidth: 260 }} className="card">
            <div className="row">
              <div className="muted">Subtotal</div>
              <div>₹ {subtotal.toFixed(2)}</div>
            </div>
            <div className="row">
              <div className="muted">GST ({gstRate || 0}%)</div>
              <div>₹ {gstAmount.toFixed(2)}</div>
            </div>
            <div className="row">
              <div className="muted">Total</div>
              <div>
                <strong>₹ {(subtotal + gstAmount).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        <Button variant="primary" type="submit">
          Save Invoice
        </Button>
      </form>
    </div>
  );
}
