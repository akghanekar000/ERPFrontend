// src/pages/Home.tsx

import React from 'react';
import { Link } from 'react-router-dom';

const items = [
  {
    title: 'Customers',
    description: 'Manage your customer records',
    path: '/customers',
  },
  {
    title: 'Products',
    description: 'Manage products and stock',
    path: '/products',
  },
  {
    title: 'Invoices',
    description: 'View and manage invoices',
    path: '/invoices',
  },
  {
    title: 'Create Invoice',
    description: 'Prepare a new sales invoice',
    path: '/invoices/new',
  },
  {
    title: 'Sales Reports',
    description: 'Review your sales reports',
    path: '/reports/sales',
  },
  {
    title: 'Business Settings',
    description: 'Manage your business information',
    path: '/settings',
  },
];

export default function Home() {
  return (
    <main
      style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: 24,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>A K TRADERS</h1>
      <h2>Business Dashboard</h2>
      <p>Welcome to your Billing ERP system.</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginTop: 28,
        }}
      >
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'block',
              padding: 20,
              border: '1px solid #ddd',
              borderRadius: 10,
              color: 'inherit',
              textDecoration: 'none',
              background: '#fff',
            }}
          >
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span style={{ color: '#2563eb' }}>
              Open →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
