import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { getSession } from "../auth/arcgis-oauth";
export default function RequireAuth({ children }) {
    const authed = !!getSession(); // re-evaluated on every render
    return authed ? _jsx(_Fragment, { children: children }) : _jsx(Navigate, { to: "/login", replace: true });
}
