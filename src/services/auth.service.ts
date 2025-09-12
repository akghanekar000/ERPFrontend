// src/services/auth.service.ts
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";

// Clerk manages login/register via components, so we replace functions with helpers

export async function login(email: string, password: string) {
  throw new Error(
    "Use Clerk <SignIn /> component instead of authService.login()"
  );
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  company?: string;
  mobile?: string;
  gstin?: string;
}) {
  throw new Error(
    "Use Clerk <SignUp /> component instead of authService.register()"
  );
}

export function logout() {
  const { signOut } = useAuth();
  signOut();
}
