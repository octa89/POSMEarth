import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Map from "./pages/Map";
import Config from "./pages/Config";
import AuthRedirect from "./pages/AuthRedirect";
import RequireAuth from "./components/RequireAuth";
import { getSession } from "./auth/arcgis-oauth";
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/auth", element: _jsx(AuthRedirect, {}) }), _jsx(Route, { path: "/map", element: _jsx(RequireAuth, { children: _jsx(Map, {}) }) }), _jsx(Route, { path: "/config", element: _jsx(RequireAuth, { children: _jsx(Config, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: getSession() ? "/map" : "/login", replace: true }) })] }));
}
