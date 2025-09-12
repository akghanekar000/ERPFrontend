// src/pages/RegisterPage.tsx
import React from "react";
import { SignUp } from "@clerk/clerk-react";

export default function RegisterPage() {
  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", padding: 16 }}>
      <h1>Create an account</h1>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
}
