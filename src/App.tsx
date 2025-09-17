// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import Home from "./pages/Home";
import DashboardPage from "./pages/DashboardPage";
import Header from "./components/Header";  // header with SignIn/SignOut buttons


// Only include Clerk routes when a publishable key is present
const CLERK_KEY = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Clerk routes: include the wildcard "/*" so Clerk internal nested routes work */}
        {CLERK_KEY && <Route path="/sign-in/*" element={<SignIn path="/sign-in" routing="path" />} />}
        {CLERK_KEY && <Route path="/sign-up/*" element={<SignUp path="/sign-up" routing="path" />} />}

        {/* friendly aliases */}
        {CLERK_KEY && <Route path="/login" element={<SignIn path="/sign-in" routing="path" />} />}
        {CLERK_KEY && <Route path="/register" element={<SignUp path="/sign-up" routing="path" />} />}

        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
