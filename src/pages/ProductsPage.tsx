// src/pages/ProductsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  Product,
} from '../services/products.service';

export default function ProductsPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);

  async function load() {
    setRows(await listProducts());
  }
  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!name) return;
    await createProduct({ name, price, stock: 0, description: '' });
    setName('');
    setPrice(0);
    load();
  }

  async function remove(id: string) {
    await deleteProduct(id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          className="border rounded p-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border rounded p-2"
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
        />
        <button className="px-3 py-2 border rounded" onClick={add}>
          Add
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Name</th>
            <th>Price</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              <td>{r.name}</td>
              <td className="text-center">{r.price}</td>
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
