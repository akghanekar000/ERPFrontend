

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type User = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
};

type AuthContextType = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

function readUserFromToken(): User | null {
  try {
    const token = localStorage.getItem("auth_token");

    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(
      decodeURIComponent(
        Array.from(atob(payload), (char) =>
          "%" + char.charCodeAt(0).toString(16).padStart(2, "0")
        ).join("")
      )
    );

    return {
      id: decoded.sub ?? decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    setUser(readUserFromToken());
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = async (
    _email: string,
    _password: string
  ): Promise<void> => {
    throw new Error(
      "Backend login will be connected in Problem 2."
    );
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, ready, login, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};


  
