import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const item = ({ isActive }) => ({
  display: "block",
  padding: "0.55rem 0.85rem",
  borderRadius: 10,
  color: isActive ? "var(--accent)" : "var(--text)",
  background: isActive ? "var(--accent-soft)" : "transparent",
  fontWeight: isActive ? 600 : 500,
  textDecoration: "none",
  fontSize: "0.9rem",
});

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside
      style={{
        width: 220,
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "1rem 0.75rem",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div className="muted" style={{ fontSize: "0.75rem", padding: "0 0.85rem", marginBottom: 4 }}>
        Workspace
      </div>
      <NavLink to="/" style={item} end>
        Overview
      </NavLink>
      <NavLink to="/predict" style={item}>
        ML prediction
      </NavLink>
      <NavLink to="/properties" style={item}>
        Listings
      </NavLink>
      <NavLink to="/analytics" style={item}>
        Market analytics
      </NavLink>
      {user?.role === "admin" && (
        <NavLink to="/admin" style={item}>
          Admin console
        </NavLink>
      )}
    </aside>
  );
}
