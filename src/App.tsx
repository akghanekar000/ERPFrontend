import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import Home from "./pages/Home";
import DashboardPage from "./pages/DashboardPage";
import Header from "./components/Header";
import NotFound from "./pages/NotFound";

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function AppRoutes() {
  const location = useLocation();
    const hideHeader =
        location.pathname.startsWith("/sign-in") ||
            location.pathname.startsWith("/sign-up") ||
                location.pathname === "/login" ||
                    location.pathname === "/register";

                      return (
                          <>
                                {!hideHeader && <Header />}
                                      <Routes>
                                              <Route path="/" element={<Home />} />
                                                      {CLERK_KEY && <Route path="/sign-in/*" element={<SignIn path="/sign-in" routing="path" />} />}
                                                              {CLERK_KEY && <Route path="/sign-up/*" element={<SignUp path="/sign-up" routing="path" />} />}
                                                                      {CLERK_KEY && <Route path="/login" element={<SignIn path="/sign-in" routing="path" />} />}
                                                                              {CLERK_KEY && <Route path="/register" element={<SignUp path="/sign-up" routing="path" />} />}
                                                                                      <Route path="/dashboard" element={<DashboardPage />} />
                                                                                              <Route path="*" element={<NotFound />} />
                                                                                                    </Routes>
                                                                                                        </>
                                                                                                          );
                                                                                                          }

                                                                                                          export default function App() {
                                                                                                            return (
                                                                                                                <BrowserRouter>
                                                                                                                      <AppRoutes />
                                                                                                                          </BrowserRouter>
                                                                                                                            );
                                                                                                                            }