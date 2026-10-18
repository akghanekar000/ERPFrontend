
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiFetch } from "../services/_fetch";

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

function decodeToken(token: string): User | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(
      decodeURIComponent(
        Array.from(atob(base64), (char) =>
          "%" +
          char.charCodeAt(0).toString(16).padStart(2, "0")
        ).join("")
      )
    );

    return {
      id: decoded.sub ?? decoded.id ?? decoded.userId,
      email: decoded.email,
      name: decoded.name ?? decoded.fullName,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

function readStoredUser(): User | null {
  try {
    const token = localStorage.getItem("auth_token");
    return token ? decodeToken(token) : null;
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
    setUser(readStoredUser());
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    const response = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const token =
      response?.token ??
      response?.accessToken ??
      response?.data?.token ??
      response?.data?.accessToken;

    if (typeof token !== "string" || !token) {
      throw new Error(
        response?.message ||
          "Login response did not contain a token. The backend response format must be checked."
      );
    }

    const tokenUser = decodeToken(token);

    const responseUser =
      response?.user ?? response?.data?.user;

    try {
      localStorage.setItem("auth_token", token);
    } catch {
      throw new Error(
        "Could not save the login token in this browser."
      );
    }

    setUser(
      responseUser && typeof responseUser === "object"
        ? {
            ...tokenUser,
            ...responseUser,
            id:
              responseUser.id ??
              responseUser._id ??
              tokenUser?.id,
            name:
              responseUser.name ??
              responseUser.fullName ??
              tokenUser?.name,
          }
        : tokenUser
    );

    setReady(true);
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


