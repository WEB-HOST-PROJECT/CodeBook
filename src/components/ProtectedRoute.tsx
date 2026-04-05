import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<"student" | "teacher">;
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role } = useAuth();

  // If the user is missing, they need to log in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is loaded but not in the allowed roles list, redirect them back to their appropriate dashboard
  if (role && !allowedRoles.includes(role)) {
    return <Navigate to={role === "student" ? "/students" : "/teacher"} replace />;
  }

  // If user is authenticated and their role is valid, or role hasn't completely loaded but they are authenticated
  // and we don't want to flash an error, we keep them here. But our context only renders children when loading is false.
  return <>{children}</>;
};

export default ProtectedRoute;
