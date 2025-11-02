import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isTokenExpired } = useAuth();

  if (!isAuthenticated || isTokenExpired()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
