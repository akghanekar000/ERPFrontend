import React, { useState, useEffect } from 'react';
import { listProducts } from '../../services/products.service';
import { listCustomers } from '../../services/customers.service';
import { toast } from 'react-toastify';

export default function OrderForm() {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<{ productId: string; qty: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listProducts().then(setProducts);
    listCustomers().then(setCustomers);
  }, []);

  function addItem() {
    setItems([...items, { productId: '', qty: 1 }]);
  }

  function updateItem(idx: number, field: string, value: any) {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  async function submitOrder() {
    if (!customerId || items.length === 0 || items.some(i => !i.productId || i.qty < 1)) {
      toast.error('Please fill all fields and add at least one product.');
      return;
    }
    setLoading(true);
    try {
      // TODO: Integrate with backend order API
      toast.success('Order placed successfully!');
      setCustomerId('');
      setItems([]);
    } catch (e) {
      toast.error('Order failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4 border rounded bg-white">
      <h2 className="text-xl font-semibold mb-4">Place Order</h2>
      <div className="mb-3">
        <label>Customer:</label>
        <select className="border rounded p-2 w-full" value={customerId} onChange={e => setCustomerId(e.target.value)}>
          <option value="">Select customer</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="mb-3">
        <label>Order Items:</label>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <select className="border rounded p-2" value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}>
              <option value="">Select product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" className="border rounded p-2 w-20" min={1} value={item.qty} onChange={e => updateItem(idx, 'qty', parseInt(e.target.value))} />
            <button type="button" className="px-2 py-1 border rounded" onClick={() => removeItem(idx)}>Remove</button>
          </div>
        ))}
        <button type="button" className="px-3 py-2 border rounded" onClick={addItem}>Add Item</button>
      </div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading} onClick={submitOrder}>Submit Order</button>
    </div>
  );
}
