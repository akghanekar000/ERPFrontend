// src/pages/LoginPage.tsx
import React from "react";
import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", padding: 16 }}>
      <h1>Login</h1>
      <SignIn path="/login" routing="path" signUpUrl="/register" />
    </div>
  );
}
