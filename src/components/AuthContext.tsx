// src/components/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

type AuthContextType = {
  user: string | null;
  login: (username: string) => void;
  logout: () => void;
  ready: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // simulate reading persisted auth (localStorage) safely
  useEffect(() => {
    try {
      const stored = localStorage.getItem('app_user');
      if (stored) setUser(stored);
    } catch (e) {
      console.warn('AuthProvider: failed to read localStorage', e);
    } finally {
      setReady(true);
    }
  }, []);

  const login = (username: string) => {
    setUser(username);
    try {
      localStorage.setItem('app_user', username);
    } catch (e) {
      console.warn('AuthProvider: failed to write localStorage', e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('app_user');
    } catch (e) {
      console.warn('AuthProvider: failed to remove localStorage', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
