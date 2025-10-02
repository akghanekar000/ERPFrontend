// src/modules/mobile/MobileProductList.tsx
import React, { useEffect, useState } from 'react';
import { listProducts } from '../../services/products.service';

export default function MobileProductList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await listProducts();
        setProducts(data ?? []);
      } catch (e: any) {
        setError(e.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: '1.2rem' }}>Products</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {products.map((prod) => (
            <li key={prod.id} style={{ marginBottom: 12, border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
              <div>Name: {prod.name}</div>
              <div>Price: ₹{prod.price}</div>
              <button style={{ marginTop: 8 }}>View Details</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
