import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (e: any) {
      setErr(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '48px auto', padding: 20 }}>
      <h1>Login</h1>

      <form onSubmit={onSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          disabled={loading}
          style={{
            display: 'block',
            width: '100%',
            padding: 12,
            marginBottom: 12,
            boxSizing: 'border-box'
          }}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          disabled={loading}
          style={{
            display: 'block',
            width: '100%',
            padding: 12,
            marginBottom: 12,
            boxSizing: 'border-box'
          }}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {err && (
          <div style={{ color: 'red', marginTop: 8 }}>
            {err}
          </div>
        )}
      </form>

      <p style={{ marginTop: 16 }}>
        Don't have an account? <Link to="/register">Create Account</Link>
      </p>
    </div>
  );
}
