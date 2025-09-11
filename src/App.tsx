// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import Home from "./pages/Home";
import DashboardPage from "./pages/DashboardPage";
import Header from "./components/Header";  // header with SignIn/SignOut buttons

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Clerk routes: include the wildcard "/*" so Clerk internal nested routes work */}
        <Route path="/sign-in/*" element={<SignIn path="/sign-in" routing="path" />} />
        <Route path="/sign-up/*" element={<SignUp path="/sign-up" routing="path" />} />

        {/* friendly aliases */}
        <Route path="/login" element={<SignIn path="/sign-in" routing="path" />} />
        <Route path="/register" element={<SignUp path="/sign-up" routing="path" />} />

        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
