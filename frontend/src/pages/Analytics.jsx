import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as api from "../services/api.js";

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [heat, setHeat] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const [s, h] = await Promise.all([api.analyticsSummary(), api.analyticsHeatmap()]);
        if (!c) {
          setSummary(s);
          setHeat(h);
        }
      } catch (e) {
        if (!c) setErr(e.response?.data?.detail || e.message);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  const locData =
    summary?.by_location?.map((r) => ({
      name: r.location,
      count: r.count,
      avgPrice: r.avg_price != null ? Math.round(r.avg_price / 1000) : null,
    })) ?? [];

  const trendData =
    summary?.prediction_trend?.map((t) => ({
      name: `P${t.id}`,
      price: Math.round(t.predicted_price / 1000),
    })) ?? [];

  const heatData = heat.map((h) => ({
    name: h.location,
    avg: h.avg_predicted != null ? Math.round(h.avg_predicted / 1000) : 0,
    samples: h.samples,
  }));

  return (
    <div className="page">
      <h1 className="h1">Market analytics</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Area-wise mix, prediction activity, and heatmap-style aggregates from logged runs.
      </p>
      {err && <div className="alert alert-error">{err}</div>}

      <div style={{ display: "grid", gap: "1.25rem" }}>
        <div className="card" style={{ height: 360 }}>
          <h2 className="h2">Listings by location</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={locData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} k₹ (avg)`, "Avg price"]} />
              <Legend />
              <Bar dataKey="count" name="Count" fill="#d97757" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgPrice" name="Avg price (k₹)" fill="#4a6da7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ height: 360 }}>
          <h2 className="h2">Recent prediction trend (thousands INR)</h2>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#c26e60" strokeWidth={3} dot={false} name="Pred (k₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ height: 360 }}>
          <h2 className="h2">Prediction heatmap (avg predicted, k₹)</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={heatData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n, p) => [p.payload.samples ? `${v} k₹ (${p.payload.samples} runs)` : v, "Avg"]} />
              <Bar dataKey="avg" fill="#e8b759" radius={[0, 4, 4, 0]} name="Avg predicted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
