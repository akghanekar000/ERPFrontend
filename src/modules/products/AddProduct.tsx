import React, { useState } from 'react';
import Input from '@components/Input';
import Button from '@components/Button';
import { addProduct } from '@services/products.service';
import { useNavigate } from 'react-router-dom';

export default function AddProduct() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price === '') return alert('Name and price are required');
    addProduct({
      name,
      price: Number(price),
      stock: stock === '' ? undefined : Number(stock),
    });
    nav('/products');
  };

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <h3>Add Product</h3>
      <form onSubmit={submit} className="row">
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value === '' ? '' : Number(e.target.value))
          }
        />
        <Input
          placeholder="Stock (optional)"
          type="number"
          value={stock}
          onChange={(e) =>
            setStock(e.target.value === '' ? '' : Number(e.target.value))
          }
        />
        <Button variant="primary" type="submit">
          Save
        </Button>
      </form>
    </div>
  );
}
