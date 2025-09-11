// src/pages/LoginPage.tsx
import React from "react";
import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", padding: 16 }}>
      <h1>Sign in</h1>
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}
