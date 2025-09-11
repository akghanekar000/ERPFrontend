// src/components/Header.tsx
import React from "react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header style={{ display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
      <Link to="/" style={{ fontWeight: "bold", fontSize: 18 }}>My App</Link>

      <nav style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <Link to="/dashboard">Dashboard</Link>

        <SignedOut>
          {/* these open Clerk sign-in / sign-up UI (routing or modal depending on setup) */}
          <SignInButton>
            <button>Sign in</button>
          </SignInButton>
          <SignUpButton>
            <button>Sign up</button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          {/* shows avatar and account menu for signed-in users */}
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
}
