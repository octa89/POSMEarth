// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login        from "./pages/Login";
import Map          from "./pages/Map";
import Config       from "./pages/Config";      
import AuthRedirect from "./pages/AuthRedirect";
import RequireAuth  from "./components/RequireAuth";
import { getSession } from "./auth/arcgis-oauth";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth"  element={<AuthRedirect />} />

      <Route
        path="/map"
        element={
          <RequireAuth>
            <Map />
          </RequireAuth>
        }
      />

      {/* NEW – config page */}
      <Route
        path="/config"
        element={
          <RequireAuth>
            <Config />
          </RequireAuth>
        }
      />

      {/* fallback */}
      <Route
        path="*"
        element={<Navigate to={getSession() ? "/map" : "/login"} replace />}
      />
    </Routes>
  );
}
