import React from "react";
import { Navigate } from "react-router-dom";

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds, Date.now() is in ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // treat malformed token as expired
  }
}

function getDashboardForRole(role) {
  switch (String(role).toLowerCase()) {
    case "admin":     return "/admin/dashboard";
    case "student":   return "/student/dashboard";
    case "professor": return "/professor/dashboard";
    case "hod":       return "/hod/dashboard";
    default:          return "/";
  }
}

export default function PrivateRoute({ children, requiredRole }) {
  let token = null;
  let user = null;

  try {
    token = localStorage.getItem("token");
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    // Malformed localStorage data — clear and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  // No credentials at all → go to login
  if (!token || !user) return <Navigate to="/" replace />;

  // Expired token → clear stale data and go to login
  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  // Wrong role → redirect to their actual dashboard (not login)
  if (requiredRole && String(user.role).toLowerCase() !== String(requiredRole).toLowerCase()) {
    return <Navigate to={getDashboardForRole(user.role)} replace />;
  }

  return children;
}
