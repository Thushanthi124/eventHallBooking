// src/components/RoleProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userToken = localStorage.getItem('userToken'); // Check for token

    // If not logged in or no token, redirect to login page
    if (!isLoggedIn || !userToken) {
        return <Navigate to="/login" replace />;
    }

    // If specific roles are required and user doesn't have permission
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate page based on role
        if (userRole === 'admin') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // User is logged in and has the right role, render the protected component
    return children;
};

export default RoleProtectedRoute;
