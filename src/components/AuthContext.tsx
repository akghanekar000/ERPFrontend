// src/components/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import * as authService from "../services/auth.service";
import { API, getAuthHeaders, handleResponse } from "../services/_fetch";

type User = {
  id?: string;
  email?: string;
  name?: string;
  [k: string]: any;
};

type AuthContextType = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // On app start: if token present, try to fetch /me
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setReady(true);
          return;
        }
        // fetch user
        const res = await fetch(`${API}/api/auth/me`, {
          method: "GET",
          headers: getAuthHeaders(),
        });
        const data = await handleResponse(res);
        setUser(data?.user ?? data ?? null);
      } catch (err) {
        console.warn("Auth restore failed", err);
        // if restore failed, clear token
        localStorage.removeItem("auth_token");
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // login: use existing auth.service.login (it stores auth_token)
  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    // auth.service stores auth_token; now fetch /me
    const res = await fetch(`${API}/api/auth/me`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const me = await handleResponse(res);
    setUser(me?.user ?? me ?? null);
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  const refresh = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) throw new Error("No refresh token saved");
      const r = await fetch(`${API}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refreshToken }),
      });
      const d = await handleResponse(r);
      // backend may return { token } or { accessToken }
      const newToken = d?.token || d?.accessToken;
      if (newToken) {
        localStorage.setItem("auth_token", newToken);
      }
      return newToken;
    } catch (err) {
      console.warn("refresh failed", err);
      logout();
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
