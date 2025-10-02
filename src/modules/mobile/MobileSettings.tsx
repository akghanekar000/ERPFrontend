// src/modules/mobile/MobileSettings.tsx
import React from 'react';

export default function MobileSettings() {
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: '1.2rem' }}>Settings</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: 12, border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
          <div>Business Info</div>
          <button style={{ marginTop: 8 }}>Edit</button>
        </li>
        <li style={{ marginBottom: 12, border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
          <div>Invoice Template</div>
          <button style={{ marginTop: 8 }}>Edit</button>
        </li>
        <li style={{ marginBottom: 12, border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
          <div>Inventory Settings</div>
          <button style={{ marginTop: 8 }}>Edit</button>
        </li>
      </ul>
    </div>
  );
}
