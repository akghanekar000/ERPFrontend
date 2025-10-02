// src/modules/inventory/InventoryList.tsx
import React, { useEffect, useState } from 'react';
import { getInventory } from '../../services/inventory.service';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  location: string;
}

export default function InventoryList() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInventory()
      .then(setItems)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading inventory...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Inventory</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.sku}</td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
              <td>{item.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
