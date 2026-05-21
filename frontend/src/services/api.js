import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("hp_token", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("hp_token");
  }
}

export function loadStoredToken() {
  const t = localStorage.getItem("hp_token");
  if (t) api.defaults.headers.common.Authorization = `Bearer ${t}`;
  return t;
}

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function register(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function me() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function fetchProperties() {
  const { data } = await api.get("/properties");
  return data;
}

export async function createProperty(body) {
  const { data } = await api.post("/properties", body);
  return data;
}

export async function updateProperty(id, body) {
  const { data } = await api.patch(`/properties/${id}`, body);
  return data;
}

export async function deleteProperty(id) {
  await api.delete(`/properties/${id}`);
}

export async function predict(body) {
  const { data } = await api.post("/predict", body);
  return data;
}

export async function analyticsSummary() {
  const { data } = await api.get("/analytics/summary");
  return data;
}

export async function analyticsHeatmap() {
  const { data } = await api.get("/analytics/heatmap");
  return data;
}

export async function adminStats() {
  const { data } = await api.get("/admin/stats");
  return data;
}

export async function adminUsers() {
  const { data } = await api.get("/admin/users");
  return data;
}

export async function adminSetRole(userId, role) {
  const { data } = await api.patch(`/admin/users/${userId}/role?role=${encodeURIComponent(role)}`);
  return data;
}

export default api;
