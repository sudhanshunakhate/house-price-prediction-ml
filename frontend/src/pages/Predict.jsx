import { useState } from "react";
import * as api from "../services/api.js";

const LOCALITIES = [
  "Downtown",
  "Riverside",
  "Hills District",
  "Metro North",
  "Metro South",
  "Lakeview",
  "Industrial Zone",
  "University Area",
];

export default function Predict() {
  const [form, setForm] = useState({
    location: "Downtown",
    sqft: 1500,
    bhk: 2,
    bathrooms: 2,
    parking: 1,
    amenities: "gym, transit",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    setResult(null);
    try {
      const data = await api.predict({
        location: form.location,
        sqft: Number(form.sqft),
        bhk: Number(form.bhk),
        bathrooms: Number(form.bathrooms),
        parking: Number(form.parking),
        amenities: form.amenities,
      });
      setResult(data);
    } catch (er) {
      setErr(er.response?.data?.detail || er.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1 className="h1">Smart price prediction</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Random Forest regressor with explainable confidence and portfolio-aware insights.
      </p>
      {err && <div className="alert alert-error">{typeof err === "string" ? err : JSON.stringify(err)}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <form className="card" onSubmit={onSubmit}>
          <h2 className="h2">Property inputs</h2>
          <div className="field">
            <label>Locality</label>
            <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
              {LOCALITIES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Square feet</label>
            <input
              type="number"
              min={500}
              step={10}
              value={form.sqft}
              onChange={(e) => setForm({ ...form, sqft: e.target.value })}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>BHK</label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.bhk}
                onChange={(e) => setForm({ ...form, bhk: e.target.value })}
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Bathrooms</label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label>Parking slots</label>
            <input
              type="number"
              min={0}
              max={10}
              value={form.parking}
              onChange={(e) => setForm({ ...form, parking: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Amenities (comma-separated)</label>
            <textarea value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Running model…" : "Predict price"}
          </button>
        </form>

        <div className="card">
          <h2 className="h2">AI output</h2>
          {!result && <p className="muted">Submit the form to see predicted price, confidence, and guidance.</p>}
          {result && (
            <>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>
                ₹{Math.round(result.predicted_price).toLocaleString()}
              </div>
              <p className="muted" style={{ marginTop: "0.35rem" }}>
                Confidence score: {(result.confidence_score * 100).toFixed(1)}%
              </p>
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.85rem 1rem",
                  borderRadius: 10,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }}
              >
                <strong>Recommendation</strong>
                <p style={{ margin: "0.5rem 0 0", fontSize: "0.95rem" }}>{result.recommendation}</p>
              </div>
              <h3 className="h2" style={{ marginTop: "1.25rem" }}>
                Insights
              </h3>
              <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)" }}>
                {result.insights.map((t, i) => (
                  <li key={i} style={{ marginBottom: "0.35rem" }}>
                    {t.split(/\*\*(.*?)\*\*/g).map((chunk, j) => (j % 2 === 1 ? <strong key={j}>{chunk}</strong> : <span key={j}>{chunk}</span>))}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
