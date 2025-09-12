import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth.service";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    company: "",
    mobile: "",
    gstin: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    if (!form.name.trim() || !form.email.trim() || !form.password) return "Name, email and password required";
    if (form.password !== form.confirm) return "Passwords do not match";
    if (form.mobile && !/^[0-9]{7,15}$/.test(form.mobile)) return "Invalid mobile number";
    if (form.gstin && !/^[0-9A-Z]{15}$/.test(form.gstin)) return "Invalid GSTIN (15 chars, uppercase)";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) { setError(v); return; }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        company: form.company,
        mobile: form.mobile,
        gstin: form.gstin,
      };
      await register(payload);
      // success -> go to home
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Registration error");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form onSubmit={onSubmit} className="max-w-lg w-full border rounded p-6 space-y-4 shadow-sm">
        <h1 className="text-2xl font-bold">Create account</h1>
        {error && <div role="alert" className="text-red-700">{error}</div>}

        <label className="block">
          <div className="text-sm font-medium">Full name</div>
          <input name="name" value={form.name} onChange={onChange} className="w-full p-2 border rounded" required />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Email</div>
          <input type="email" name="email" value={form.email} onChange={onChange} className="w-full p-2 border rounded" required />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Company</div>
          <input name="company" value={form.company} onChange={onChange} className="w-full p-2 border rounded" />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Mobile</div>
          <input name="mobile" value={form.mobile} onChange={onChange} inputMode="numeric" className="w-full p-2 border rounded" placeholder="9876543210" />
        </label>

        <label className="block">
          <div className="text-sm font-medium">GSTIN (optional)</div>
          <input name="gstin" value={form.gstin} onChange={onChange} className="w-full p-2 border rounded" placeholder="15 char GSTIN uppercase" />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <div className="text-sm font-medium">Password</div>
            <input name="password" value={form.password} onChange={onChange} type={showPass ? "text" : "password"} className="w-full p-2 border rounded" required />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Confirm</div>
            <input name="confirm" value={form.confirm} onChange={onChange} type={showPass ? "text" : "password"} className="w-full p-2 border rounded" required />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showPass} onChange={() => setShowPass(!showPass)} /> Show password
        </label>

        <button type="submit" disabled={loading} className="w-full p-3 rounded bg-black text-white">
          {loading ? "Creating account…" : "Create account"}
        </button>

        <div className="text-sm">
          Already have an account? <a className="text-blue-600" href="/login">Sign in</a>
        </div>
      </form>
    </div>
  );
}
