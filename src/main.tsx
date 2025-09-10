// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = "pk_test_bG92aW5nLWJsdWViaXJkLTUwLmNsZXJrLmFjY291bnRzLmRldiQ"; // 🔑 from Clerk dashboard

// make sure root element exists
let rootEl = document.getElementById("root");
if (!rootEl) {
  rootEl = document.createElement("div");
  rootEl.id = "root";
  document.body.prepend(rootEl);
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
