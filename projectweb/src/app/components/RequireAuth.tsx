import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({
  children,
  permission,
}: {
  children: React.ReactElement;
  permission?: string;
}) {
  const location = useLocation();
  const { user, isHydrated, hasPermission } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
