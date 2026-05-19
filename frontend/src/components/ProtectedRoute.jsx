import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // 1. Extract token and role from storage caught during yesterday's handshake
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Expected: 'ROLE_ADMIN'

  if (!token) {
    // No token? Boot them back to the login perimeter
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Wrong role? Access Denied
    return <Navigate to="/" replace />;
  }

  // Authorized? Render the requested dashboard view
  return children;
};

export default ProtectedRoute;