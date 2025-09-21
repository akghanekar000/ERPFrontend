import React, { useEffect, useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';

const KEY = 'business_info';

export default function BusinessInfo() {
  const [name, setName] = useState('My Business');
  const [gst, setGst] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        setName(obj.name || '');
        setGst(obj.gst || '');
        setAddress(obj.address || '');
      }
    } catch {}
  }, []);

  const save = () => {
    localStorage.setItem(KEY, JSON.stringify({ name, gst, address }));
    alert('Saved');
  };

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <h3>Business Info</h3>
      <div className="row">
        <Input
          placeholder="Business Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="GSTIN"
          value={gst}
          onChange={(e) => setGst(e.target.value)}
        />
        <Input
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button variant="primary" onClick={save}>
          Save
        </Button>
      </div>
    </div>
  );
}
