import { API } from "./_fetch";

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch(e) { data = { raw: text } }

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText || "Login failed";
    throw new Error(message);
  }

  const token = data?.token;
  if (!token) throw new Error("No token returned");
  localStorage.setItem("auth_token", token);
  return data;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  company?: string;
  mobile?: string;
  gstin?: string;
}) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch(e) { data = { raw: text } }

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText || "Registration failed";
    throw new Error(message);
  }

  const token = data?.token;
  if (!token) throw new Error("No token returned from server");
  localStorage.setItem("auth_token", token);
  return data;
}

export function logout() {
  localStorage.removeItem("auth_token");
}
