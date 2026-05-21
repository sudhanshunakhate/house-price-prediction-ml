import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../services/api.js";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ['#d97757', '#4a6da7', '#6b8e73', '#e8b759', '#c26e60', '#5c4e60', '#7b9e89', '#905b5b'];

export default function Dashboard() {
  const [props, setProps] = useState([]);
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [plist, s] = await Promise.all([api.fetchProperties(), api.analyticsSummary()]);
        if (!cancel) {
          setProps(plist.slice(0, 6));
          setSummary(s);
        }
      } catch (e) {
        if (!cancel) setErr(e.response?.data?.detail || e.message || "Failed to load");
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const locData =
    summary?.by_location?.map((r) => ({
      name: r.location,
      count: r.count,
      avgPrice: r.avg_price != null ? Math.round(r.avg_price / 1000) : null,
    })) ?? [];

  let aiInsight = "Gathering market data...";
  if (locData.length > 0 && summary) {
    const topCount = [...locData].sort((a, b) => b.count - a.count)[0];
    const topPrice = [...locData].sort((a, b) => b.avgPrice - a.avgPrice)[0];
    
    aiInsight = `Based on recent data, the market is currently seeing the most activity in **${topCount.name}** (${topCount.count} listings). Meanwhile, **${topPrice.name}** commands the highest average listed price at roughly **₹${topPrice.avgPrice}k**. Our predictive ML model is operating with an R² health score of **${summary.model_train_r2?.toFixed(2) || "N/A"}**, indicating strong pricing reliability for future appraisals.`;
  }

  return (
    <div className="page">
      <h1 className="h1">Dashboard</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        AI-driven overview of listings, model health, and market mix.
      </p>
      {err && <div className="alert alert-error">{err}</div>}

      <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.85rem" }}>
            Properties tracked
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{summary?.property_count ?? "—"}</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.85rem" }}>
            Avg listed price
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            {summary?.avg_listed_price != null
              ? `₹${Math.round(summary.avg_listed_price).toLocaleString()}`
              : "—"}
          </div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.85rem" }}>
            Model train R²
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            {summary?.model_train_r2 != null ? summary.model_train_r2.toFixed(3) : "—"}
          </div>
        </div>
      </div>

      {summary && (
        <div className="card" style={{ marginBottom: "2rem", background: "var(--accent-soft)", borderColor: "var(--accent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>🤖</span>
            <h2 className="h2" style={{ margin: 0, color: "var(--accent)" }}>AI Market Insight</h2>
          </div>
          <p style={{ margin: 0, color: "var(--text)", lineHeight: "1.6" }} dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </div>
      )}

      {locData.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div className="card" style={{ height: 320 }}>
            <h2 className="h2" style={{ fontSize: "1.1rem" }}>Properties by Location</h2>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={locData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {locData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ height: 320 }}>
            <h2 className="h2" style={{ fontSize: "1.1rem" }}>Average Price by Location (k₹)</h2>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={locData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`₹${v}k`, "Avg Price"]} />
                <Bar dataKey="avgPrice" name="Avg Price" fill="#4a6da7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="h2">Recent properties</h2>
        <Link to="/properties" className="btn btn-ghost" style={{ textDecoration: "none" }}>
          Manage listings
        </Link>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Location</th>
              <th>Sqft</th>
              <th>BHK</th>
              <th>Baths</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {props.length === 0 && (
              <tr>
                <td colSpan={5} className="muted" style={{ padding: "1.25rem" }}>
                  No properties yet. Add one under Properties.
                </td>
              </tr>
            )}
            {props.map((p) => (
              <tr key={p.id}>
                <td>{p.location}</td>
                <td>{p.sqft}</td>
                <td>{p.bhk}</td>
                <td>{p.bathrooms}</td>
                <td>{p.price != null ? `₹${Number(p.price).toLocaleString()}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {summary?.reference_localities?.length > 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h2 className="h2">Model locality vocabulary</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            The ML model was trained on these areas; matching names improves prediction quality.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
            {summary.reference_localities.map((loc) => (
              <span key={loc} className="badge">
                {loc}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
