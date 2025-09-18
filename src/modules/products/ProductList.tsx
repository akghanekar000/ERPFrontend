import { useEffect, useState } from 'react';
import { getProducts, Product } from '../../services/products.service';
import { useAuth } from '../../components/AuthContext';

export default function ProductList() {
  const [items, setItems] = useState<Product[]>([]);
  const { loading } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const data = await getProducts();
        setItems(data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading auth...</div>;

  return (
    <div>
      <h2>Products</h2>
      <ul>
        {items.map((p) => (
          <li key={p._id}>
            {p.name} — ₹{p.price} — stock {p.stock}
          </li>
        ))}
      </ul>
    </div>
  );
}
