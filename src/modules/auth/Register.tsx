import React, { useState } from 'react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // simple local logging - integrate with real API later
    console.log('Register:', { name, email });
    alert('Registered (mock). Now login.');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h3>Create account</h3>
      <form onSubmit={onSubmit} className="row">
        <input
          className="input"
          name="name"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          name="password"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn primary" type="submit">
          Register
        </button>
      </form>
    </div>
  );
}
