// frontend/src/components/routes/RequireAdminRole.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// If you don't have a logger utility, you can just use console.warn
// const logger = { warn: console.warn };

/**
 * A component that wraps routes requiring ADMIN privileges.
 * It assumes the user is already authenticated (used within ProtectedRoute).
 * - If the authenticated user is an ADMIN, it renders the child route content via <Outlet />.
 * - If the authenticated user is NOT an ADMIN, it redirects them to the home page ('/').
 */
function RequireAdminRole() {
    const { user, isLoading } = useAuth(); // Get user info (which includes role)
    const location = useLocation();

    // Still wait for loading to finish, although ProtectedRoute likely handles this already
    if (isLoading) {
        return <div>Loading user data...</div>; // Or spinner
    }

    // Check if the authenticated user has the ADMIN role
    // Comparing with string 'ADMIN' assumes the JWT payload role is a string.
    // If using enums synced from backend, compare with the enum value.
    if (user?.role === 'ADMIN') {
        // If admin, render the nested route component
        return <Outlet />;
    } else {
        // If not admin, redirect to home page (or an unauthorized page)
        console.warn(`Authorization denied: User ${user?.email} with role ${user?.role} attempted to access admin route ${location.pathname}`); // <-- CHANGE logger to console
        // Redirect to home page, replacing the current entry in history
        return <Navigate to="/" state={{ from: location }} replace />;
    }
}

export default RequireAdminRole;