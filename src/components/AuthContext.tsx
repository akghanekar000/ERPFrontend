// src/components/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthState = { user: any | null; loading: boolean };
type Ctx = AuthState & { login: (t: string) => void; logout: () => void };

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // example: load token from storage and set user
    const token = localStorage.getItem('auth_token');
    setUser(token ? { token } : null);
    setLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('auth_token', token);
    setUser({ token });
  };
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
