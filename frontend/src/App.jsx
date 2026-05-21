import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PrivateLayout } from "./components/PrivateLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Predict from "./pages/Predict.jsx";
import Analytics from "./pages/Analytics.jsx";
import Properties from "./pages/Properties.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateLayout>
              <Dashboard />
            </PrivateLayout>
          }
        />
        <Route
          path="/predict"
          element={
            <PrivateLayout>
              <Predict />
            </PrivateLayout>
          }
        />
        <Route
          path="/properties"
          element={
            <PrivateLayout>
              <Properties />
            </PrivateLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateLayout>
              <Analytics />
            </PrivateLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateLayout adminOnly>
              <Admin />
            </PrivateLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
