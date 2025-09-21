import { useEffect, useState } from 'react';
import { listProducts, Product } from '../../services/products.service';
import { useAuth } from '../../components/AuthContext';

export default function ProductList() {
  const [items, setItems] = useState<Product[]>([]);
  const { ready } = useAuth();

  useEffect(() => {
    async function load() {
      try {
  const data = await listProducts();
        setItems(data ?? []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  if (!ready) return <div>Loading auth...</div>;

  return (
    <div>
      <h2>Products</h2>
      <ul>
        {items.map((p) => (
          <li key={p.id}>
            {p.name} — ₹{p.price} — stock {p.stock ?? 0}
          </li>
        ))}
      </ul>
    </div>
  );
}
