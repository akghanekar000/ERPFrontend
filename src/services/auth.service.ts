// src/services/auth.service.ts (Clerk-compatible stubs)
import { useAuth } from "@clerk/clerk-react";

export async function login(email: string, password: string) {
  throw new Error("Use Clerk <SignIn /> component instead of authService.login()");
}

export async function register(payload: { name: string; email: string; password: string; company?: string; mobile?: string; gstin?: string; }) {
  throw new Error("Use Clerk <SignUp /> component instead of authService.register()");
}

export function logout() {
  try {
    const { signOut } = useAuth() as any;
    if (signOut) signOut();
  } catch (e) {
    // noop in non-React contexts
  }
}
