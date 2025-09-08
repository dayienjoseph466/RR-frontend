import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./App.jsx";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ user: "", pass: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (msg) setMsg("");
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");

    const user = form.user.trim();
    const pass = form.pass.trim();
    if (!user || !pass) {
      setMsg("Please fill in both fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMsg(data.message || "Login failed");
        return;
      }

      const { token } = await res.json();
      localStorage.setItem("token", token);
      setMsg("Login successful");

      // redirect to the new dashboard route
      navigate("/admindashboard", { replace: true });
      // HashRouter hard redirect fallback
      if (!location.hash || !location.hash.includes("/admindashboard")) {
        window.location.replace("#/admindashboard");
      }
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="auth-wrap">
          <form className="auth-card" onSubmit={submit}>
            <div className="auth-head">
              <div className="auth-pill">Staff</div>
              <h2>Admin Login</h2>
              <p className="auth-sub">Secure access to reservations and reports</p>
            </div>

            <label className="input-with-icon">
              <span className="icon" aria-hidden>👤</span>
              <input
                name="user"
                value={form.user}
                onChange={onChange}
                placeholder="Username"
                autoComplete="username"
              />
            </label>

            <label className="input-with-icon">
              <span className="icon" aria-hidden>🔒</span>
              <input
                name="pass"
                type={showPass ? "text" : "password"}
                value={form.pass}
                onChange={onChange}
                placeholder="Password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="ghost small"
                onClick={() => setShowPass(v => !v)}
                aria-label="Show password"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </label>

            <div className="auth-actions">
              <label className="remember">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="muted">Forgot password</a>
            </div>

            {msg && (
              <div className={`auth-msg ${msg.includes("successful") ? "ok" : "err"}`}>
                {msg}
              </div>
            )}

            <button className="btn primary wide" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            <div className="auth-foot">
              <span className="muted">Need help</span>
              <a href="#" className="link">Contact support</a>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
