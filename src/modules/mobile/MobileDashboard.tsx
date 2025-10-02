// src/modules/mobile/MobileDashboard.tsx
import React from 'react';

export default function MobileDashboard() {
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: '1.5rem' }}>Mobile Dashboard</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button style={{ fontSize: '1rem', padding: 12 }}>View Invoices</button>
        <button style={{ fontSize: '1rem', padding: 12 }}>View Products</button>
        <button style={{ fontSize: '1rem', padding: 12 }}>View Customers</button>
        <button style={{ fontSize: '1rem', padding: 12 }}>Reports</button>
        <button style={{ fontSize: '1rem', padding: 12 }}>Settings</button>
      </div>
      <div style={{ marginTop: 24 }}>
        <p>Quick KPIs:</p>
        <ul>
          <li>Total Sales: ₹0</li>
          <li>Pending Invoices: 0</li>
          <li>Inventory Items: 0</li>
        </ul>
      </div>
    </div>
  );
}
