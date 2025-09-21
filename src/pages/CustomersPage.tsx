// src/pages/CustomersPage.tsx
import React, { useEffect, useState } from 'react';
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
  Customer,
} from '../services/customers.service';

export default function CustomersPage() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  async function load() {
    const data = await listCustomers();
    setRows(data);
  }
  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!name) return;
    await createCustomer({ name, email });
    setName('');
    setEmail('');
    load();
  }

  async function remove(id: string) {
    await deleteCustomer(id);
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
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="px-3 py-2 border rounded" onClick={add}>
          Add
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Name</th>
            <th className="text-left">Email</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td className="text-right">
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => remove(r.id)}
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