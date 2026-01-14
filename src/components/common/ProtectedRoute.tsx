import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { restoreAuth } from "../../redux/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * ProtectedRoute component - guards routes to only authenticated users with specific roles
 * @param children - Component to render if authorized
 * @param allowedRoles - Array of roles allowed to access this route (e.g., ['admin', 'superAdmin'])
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ["admin", "superAdmin", "clubAdmin"],
}) => {
  const dispatch = useAppDispatch();
  const { token, user, isAdmin } = useAppSelector((state) => state.auth);

  // Ensure auth is restored from localStorage
  useEffect(() => {
    if (!token && !user) {
      dispatch(restoreAuth());
    }
  }, [dispatch, token, user]);

  // Check if user is authenticated
  if (!token || !user) {
    return <Navigate to="/auth/signin" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role || "")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
