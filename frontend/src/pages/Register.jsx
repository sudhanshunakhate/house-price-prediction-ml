import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { user, register } = useAuth();
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register({ email, password, full_name });
    } catch (er) {
      const d = er.response?.data?.detail;
      setErr(typeof d === "string" ? d : Array.isArray(d) ? d.map((x) => x.msg).join(", ") : er.message || "Register failed");
    }
  }

  return (
    <div className="login-page">
      <div className="card login-card login-brand">
        <div>
          <h1>Create account</h1>
          <p>Join the workspace to run ML predictions and manage listings.</p>
        </div>
        <form onSubmit={onSubmit} style={{ marginTop: "1rem" }}>
          {err && <div className="alert alert-error">{err}</div>}
          <div className="field">
            <label>Full name</label>
            <input value={full_name} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password (min 6)</label>
            <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Register
          </button>
          <p className="muted" style={{ marginTop: "1rem", textAlign: "center" }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
