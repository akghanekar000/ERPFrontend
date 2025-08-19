import React, { useState } from 'react';
import Input from '@components/Input';
import Button from '@components/Button';
import { addCustomer } from '@services/customers.service';
import { useNavigate } from 'react-router-dom';

export default function AddCustomer() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gst, setGst] = useState('');
  const [address, setAddress] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return alert('Name and phone are required');
    addCustomer({ name, phone, gst, address });
    nav('/customers');
  };

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <h3>Add Customer</h3>
      <form onSubmit={submit} className="row">
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          placeholder="GST (optional)"
          value={gst}
          onChange={(e) => setGst(e.target.value)}
        />
        <Input
          placeholder="Address (optional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button variant="primary" type="submit">
          Save
        </Button>
      </form>
    </div>
  );
}
