import { useEffect, useState } from "react";
import * as api from "../services/api.js";

const emptyForm = {
  location: "",
  sqft: 1200,
  bhk: 2,
  bathrooms: 2,
  parking: 1,
  amenities: "",
  price: "",
  image_url: "",
};

export default function Properties() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [predicting, setPredicting] = useState(false);

  async function autoPredict() {
    if (!form.location || !form.sqft || !form.bhk || !form.bathrooms) {
      setErr("Please fill location, sqft, bhk, and bathrooms first.");
      return;
    }
    setPredicting(true);
    setErr("");
    try {
      const data = await api.predict({
        location: form.location,
        sqft: Number(form.sqft),
        bhk: Number(form.bhk),
        bathrooms: Number(form.bathrooms),
        parking: Number(form.parking || 0),
        amenities: form.amenities,
      });
      setForm({ ...form, price: Math.round(data.predicted_price) });
      setMsg("✨ Price auto-predicted using AI!");
    } catch (e) {
      setErr(e.response?.data?.detail || e.message || "Failed to predict price.");
    } finally {
      setPredicting(false);
    }
  }

  async function refresh() {
    const data = await api.fetchProperties();
    setRows(data);
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.response?.data?.detail || e.message));
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      await api.createProperty({
        ...form,
        sqft: Number(form.sqft),
        bhk: Number(form.bhk),
        bathrooms: Number(form.bathrooms),
        parking: Number(form.parking),
        price: form.price === "" ? null : Number(form.price),
      });
      setForm(emptyForm);
      setMsg("Property saved.");
      await refresh();
    } catch (e) {
      setErr(e.response?.data?.detail || e.message);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this property?")) return;
    setErr("");
    try {
      await api.deleteProperty(id);
      await refresh();
    } catch (e) {
      setErr(e.response?.data?.detail || e.message);
    }
  }

  function startEdit(p) {
    setEditing(p.id);
    setForm({
      location: p.location,
      sqft: p.sqft,
      bhk: p.bhk,
      bathrooms: p.bathrooms,
      parking: p.parking,
      amenities: p.amenities || "",
      price: p.price ?? "",
      image_url: p.image_url || "",
    });
  }

  async function onUpdate(e) {
    e.preventDefault();
    if (!editing) return;
    setErr("");
    try {
      await api.updateProperty(editing, {
        location: form.location,
        sqft: Number(form.sqft),
        bhk: Number(form.bhk),
        bathrooms: Number(form.bathrooms),
        parking: Number(form.parking),
        amenities: form.amenities,
        price: form.price === "" ? null : Number(form.price),
        image_url: form.image_url,
      });
      setEditing(null);
      setForm(emptyForm);
      setMsg("Property updated.");
      await refresh();
    } catch (e) {
      setErr(e.response?.data?.detail || e.message);
    }
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm);
  }

  return (
    <div className="page">
      <h1 className="h1">Property management</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        CRUD listings used for analytics and portfolio context. Image URL is optional metadata.
      </p>
      {err && <div className="alert alert-error">{typeof err === "string" ? err : JSON.stringify(err)}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)",
          gap: "1.25rem",
          alignItems: "start",
        }}
        className="properties-grid"
      >
        <form className="card" onSubmit={editing ? onUpdate : onCreate}>
          <h2 className="h2">{editing ? "Edit property" : "Add property"}</h2>
          <div className="field">
            <label>Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
          <div className="field">
            <label>Sqft</label>
            <input type="number" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>BHK</label>
              <input type="number" value={form.bhk} onChange={(e) => setForm({ ...form, bhk: e.target.value })} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Baths</label>
              <input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Parking</label>
            <input type="number" value={form.parking} onChange={(e) => setForm({ ...form, parking: e.target.value })} />
          </div>
          <div className="field">
            <label>Amenities</label>
            <input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
          </div>
          <div className="field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ margin: 0 }}>Listed price (optional)</label>
              <button
                type="button"
                onClick={autoPredict}
                disabled={predicting}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: 0
                }}
              >
                {predicting ? "Predicting..." : "✨ AI Predict"}
              </button>
            </div>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="field">
            <label>Image URL (optional)</label>
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="btn btn-primary">
              {editing ? "Save changes" : "Create"}
            </button>
            {editing && (
              <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Location</th>
                <th>Sqft</th>
                <th>BHK</th>
                <th>Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.location}</td>
                  <td>{p.sqft}</td>
                  <td>{p.bhk}</td>
                  <td>{p.price != null ? `₹${Number(p.price).toLocaleString()}` : "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn btn-ghost" style={{ padding: "0.35rem 0.6rem", fontSize: "0.85rem" }} onClick={() => startEdit(p)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger" style={{ padding: "0.35rem 0.6rem", fontSize: "0.85rem" }} onClick={() => onDelete(p.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .properties-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
