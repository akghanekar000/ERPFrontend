// src/modules/invoices/InvoiceTemplateSettings.tsx
import React, { useState } from 'react';

const defaultTemplate = {
  color: '#1976d2',
  logo: '',
  showGST: true,
  showSignature: false,
};

export default function InvoiceTemplateSettings() {
  const [template, setTemplate] = useState(defaultTemplate);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setTemplate((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setTemplate((prev) => ({ ...prev, logo: reader.result as string }));
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <h2>Invoice Template Settings</h2>
      <form>
        <label>
          Theme Color
          <input type="color" name="color" value={template.color} onChange={handleChange} />
        </label>
        <label>
          Logo
          <input type="file" accept="image/*" onChange={handleLogoUpload} />
        </label>
        {template.logo && <img src={template.logo} alt="Logo" style={{ height: 40, marginTop: 8 }} />}
        <label>
          Show GST
          <input type="checkbox" name="showGST" checked={template.showGST} onChange={handleChange} />
        </label>
        <label>
          Show Signature
          <input type="checkbox" name="showSignature" checked={template.showSignature} onChange={handleChange} />
        </label>
      </form>
    </div>
  );
}
