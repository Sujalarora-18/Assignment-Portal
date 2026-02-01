// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Simple private route component.
 * Expects token and user in localStorage (set by login).
 * Optionally, pass `requiredRole` prop to restrict by role.
 */
export default function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) return <Navigate to="/" replace />;

  if (requiredRole && user.role !== requiredRole) {
    // if role mismatch, redirect to home or login
    return <Navigate to="/" replace />;
  }

  return children;
}
