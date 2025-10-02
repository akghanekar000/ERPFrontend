// src/modules/mobile/MobileReports.tsx
import React from 'react';

export default function MobileReports() {
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: '1.2rem' }}>Reports</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: 12, border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
          <div>Sales Report</div>
          <button style={{ marginTop: 8 }}>Download</button>
        </li>
        <li style={{ marginBottom: 12, border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
          <div>Inventory Report</div>
          <button style={{ marginTop: 8 }}>Download</button>
        </li>
      </ul>
    </div>
  );
}
