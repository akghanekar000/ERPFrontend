// src/modules/integrations/Integrations.tsx
import React, { useState } from 'react';
import { syncWithExternalSystem } from '../../services/integration.service';

const systems = [
  { name: 'Tally', id: 'tally' },
  { name: 'QuickBooks', id: 'quickbooks' },
  { name: 'Zoho Books', id: 'zoho' },
];

export default function Integrations() {
  const [selected, setSelected] = useState('');
  const [status, setStatus] = useState('');

  async function handleSync() {
    setStatus('Syncing...');
    try {
      await syncWithExternalSystem(selected, { /* example payload */ });
      setStatus('Sync successful!');
    } catch (e) {
      setStatus('Sync failed.');
    }
  }

  return (
    <div>
      <h2>Integrations</h2>
      <select value={selected} onChange={e => setSelected(e.target.value)}>
        <option value="">Select System</option>
        {systems.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <button onClick={handleSync} disabled={!selected}>Sync</button>
      <div>{status}</div>
    </div>
  );
}
