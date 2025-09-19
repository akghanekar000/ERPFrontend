// src/components/AuthContext.tsx (Clerk adapter)
import React, { createContext, useContext, ReactNode } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";

// Define a stricter User type
type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerkAuth();

  // Only include necessary user fields
  const convertedUser: User | null = user && user.id && user.primaryEmailAddress?.emailAddress && user.fullName
    ? {
        id: user.id,
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName,
      }
    : null;

  // Login is handled by Clerk's SignIn component
  const login = async () => {
    throw new Error("Use Clerk SignIn component instead of login()");
  };

  // Logout using Clerk's signOut
  const logout = () => {
    signOut();
  };

  // Provide user, ready, login, and logout in context
  return (
    <AuthContext.Provider value={{ user: convertedUser, ready: isLoaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
