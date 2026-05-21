import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("User123!");
  const [err, setErr] = useState("");

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
    } catch (er) {
      setErr(er.response?.data?.detail || er.message || "Login failed");
    }
  }

  return (
    <div className="login-page">
      <div className="card login-card login-brand">
        <div>
          <h1>HousePrice AI</h1>
          <p>Sign in to access predictions, listings, and analytics.</p>
        </div>
        <form onSubmit={onSubmit} style={{ marginTop: "1rem" }}>
          {err && <div className="alert alert-error">{err}</div>}
          <div className="field">
            <label>Email</label>
            <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Sign in
          </button>
          <p className="muted" style={{ marginTop: "1rem", textAlign: "center" }}>
            No account? <Link to="/register">Create one</Link>
          </p>
          <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.75rem" }}>
            Demo: user@example.com / User123! — Admin: admin@example.com / Admin123!
          </p>
        </form>
      </div>
    </div>
  );
}
