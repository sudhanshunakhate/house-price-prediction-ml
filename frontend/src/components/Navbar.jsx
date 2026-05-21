import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linkStyle = ({ isActive }) => ({
  color: isActive ? "var(--accent)" : "var(--muted)",
  fontWeight: isActive ? 600 : 500,
  textDecoration: "none",
  padding: "0.35rem 0",
});

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header
      style={{
        height: 56,
        borderBottom: "1px solid var(--border)",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.25rem",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <NavLink to="/" style={{ textDecoration: "none", color: "var(--text)", fontWeight: 700 }}>
          HousePrice AI
        </NavLink>
        <nav style={{ display: "flex", gap: "1rem", fontSize: "0.92rem" }}>
          <NavLink to="/" style={linkStyle} end>
            Dashboard
          </NavLink>
          <NavLink to="/predict" style={linkStyle}>
            Predict
          </NavLink>
          <NavLink to="/properties" style={linkStyle}>
            Properties
          </NavLink>
          <NavLink to="/analytics" style={linkStyle}>
            Analytics
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" style={linkStyle}>
              Admin
            </NavLink>
          )}
        </nav>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem" }}>
        {user && (
          <>
            <span className="muted">
              {user.full_name || user.email}
              {user.role === "admin" && <span className="badge" style={{ marginLeft: 8 }}>Admin</span>}
            </span>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              Log out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
