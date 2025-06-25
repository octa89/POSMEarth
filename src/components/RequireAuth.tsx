// src/components/RequireAuth.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getSession } from "../auth/arcgis-oauth";

type Props = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: Props): JSX.Element {
  const authed = !!getSession(); // re-evaluated on every render

  return authed ? <>{children}</> : <Navigate to="/login" replace />;
}
