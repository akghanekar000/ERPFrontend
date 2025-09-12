// src/components/AuthContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";

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
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerkAuth();

  // Convert Clerk user object to your User type
  const convertedUser: User | null = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        ...user, // keep other Clerk fields if needed
      }
    : null;

  // Dummy login & refresh since Clerk handles it via UI
  const login = async () => {
    throw new Error("Use Clerk SignIn component instead of login()");
  };

  const refresh = async () => {
    return ""; // Clerk auto-refreshes, so no manual refresh
  };

  const logout = () => {
    signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user: convertedUser, ready: isLoaded, login, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
