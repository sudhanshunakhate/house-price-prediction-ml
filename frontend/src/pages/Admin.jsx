import { useEffect, useState } from "react";
import * as api from "../services/api.js";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    const [s, u] = await Promise.all([api.adminStats(), api.adminUsers()]);
    setStats(s);
    setUsers(u);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.response?.data?.detail || e.message));
  }, []);

  async function toggleRole(u) {
    const next = u.role === "admin" ? "user" : "admin";
    if (!window.confirm(`Set ${u.email} to ${next}?`)) return;
    setErr("");
    try {
      await api.adminSetRole(u.id, next);
      await load();
    } catch (e) {
      setErr(e.response?.data?.detail || e.message);
    }
  }

  return (
    <div className="page">
      <h1 className="h1">Admin panel</h1>
        <p className="muted" style={{ marginTop: 0 }}>
        Monitor adoption, roles, and system activity. Demo admin: admin@example.com / Admin123!
      </p>
      {err && <div className="alert alert-error">{err}</div>}

      <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.85rem" }}>
            Users
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{stats?.users ?? "—"}</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.85rem" }}>
            Properties
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{stats?.properties ?? "—"}</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.85rem" }}>
            Predictions logged
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{stats?.predictions_logged ?? "—"}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="h2">Users & roles</h2>
        <div className="table-wrap" style={{ border: "none" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.full_name}</td>
                  <td>
                    <span className="badge">{u.role}</span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost" style={{ fontSize: "0.85rem" }} onClick={() => toggleRole(u)}>
                      Toggle admin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
