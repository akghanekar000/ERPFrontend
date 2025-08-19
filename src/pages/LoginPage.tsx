// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      navigate('/');
    } catch (e: any) {
      setErr(e.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={onSubmit} className="w-80 border rounded p-4 space-y-3">
        <h1 className="text-xl font-semibold">Login</h1>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input
          className="w-full border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />
        <input
          className="w-full border rounded p-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
        />
        <button className="w-full px-3 py-2 border rounded">Sign in</button>
      </form>
    </div>
  );
}
