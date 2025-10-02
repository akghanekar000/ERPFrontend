// src/modules/inventory/InventorySettings.tsx
import React, { useState } from 'react';

const defaultSettings = {
  lowStockThreshold: 10,
  autoReorder: false,
  reorderAmount: 50,
};

export default function InventorySettings() {
  const [settings, setSettings] = useState(defaultSettings);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  return (
    <div>
      <h2>Inventory Settings</h2>
      <form>
        <label>
          Low Stock Threshold
          <input
            type="number"
            name="lowStockThreshold"
            value={settings.lowStockThreshold}
            onChange={handleChange}
          />
        </label>
        <label>
          Auto Reorder
          <input
            type="checkbox"
            name="autoReorder"
            checked={settings.autoReorder}
            onChange={handleChange}
          />
        </label>
        <label>
          Reorder Amount
          <input
            type="number"
            name="reorderAmount"
            value={settings.reorderAmount}
            onChange={handleChange}
            disabled={!settings.autoReorder}
          />
        </label>
      </form>
    </div>
  );
}
