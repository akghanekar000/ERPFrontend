// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import HomePage from "./pages/Home";
import LoginPage from "./pages/LoginPage"; // if you kept
import RegisterPage from "./pages/RegisterPage"; // optional custom wrapper
import DashboardPage from "./pages/DashboardPage"; // your existing pages

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Clerk sign-in / sign-up routes — important: use "/*" on the route path */}
        <Route
          path="/sign-in/*"
          element={<SignIn path="/sign-in" routing="path" />}
        />
        <Route
          path="/sign-up/*"
          element={<SignUp path="/sign-up" routing="path" />}
        />

        {/* Optional: user-facing aliases */}
        <Route
          path="/login"
          element={<SignIn path="/sign-in" routing="path" />}
        />
        <Route
          path="/register"
          element={<SignUp path="/sign-up" routing="path" />}
        />

        <Route path="/dashboard" element={<DashboardPage />} />
        {/* other routes... */}

        {/* catch-all: show 404 page or redirect */}
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
