import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyEmailPage() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");
  useEffect(() => {
    const q = new URLSearchParams(loc.search);
    const token = q.get("token");
    if (!token) { setStatus("error"); return; }
    fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE}/api/auth/verify?token=${token}`)
      .then(r => r.json())
      .then(j => {
        if (j?.success) { setStatus("ok"); setTimeout(()=>navigate("/", { replace: true }), 1500); }
        else setStatus("error");
      }).catch(()=>setStatus("error"));
  }, []);
  return (
    <div className="min-h-screen grid place-items-center p-6">
      {status === "checking" && <div>Verifying…</div>}
      {status === "ok" && <div>Your email is verified — redirecting…</div>}
      {status === "error" && <div>Verification failed or expired. You can request a new link from login.</div>}
    </div>
  );
}
