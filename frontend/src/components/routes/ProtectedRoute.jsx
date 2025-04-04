// frontend/src/components/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
import LoadingSpinner from '../common/LoadingSpinner'; // Adjust path if needed

/**
 * A component that wraps routes requiring authentication.
 * - If the user is authenticated, it renders the child route content via <Outlet />.
 * - If the user is not authenticated, it redirects them to the /login page,
 * storing the intended destination path.
 * - Shows a loading indicator while the initial authentication status is being checked.
 */
function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation(); // Get the current location user is trying to access

    // 1. Show loading indicator while checking auth status on initial load
    if (isLoading) {
        // You can replace this with a more sophisticated loading screen
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <LoadingSpinner />
            </div>
        );
    }

    // 2. If not authenticated (and not loading), redirect to login
    if (!isAuthenticated) {
        console.log('ProtectedRoute: Not authenticated, redirecting to login.');
        // Redirect them to the /login page, but save the current location they were
        // trying to go to in the state. This allows us to redirect them back after login.
        return <Navigate to="/login" state={{ from: location }} replace />;
        // 'replace' prevents the protected route from getting added to the history stack.
    }

    // 3. If authenticated and not loading, render the child route component
    // <Outlet /> renders the nested route defined within this ProtectedRoute in App.jsx
    return <Outlet />;

    // Alternative if passing children directly:
    // return children;
}

export default ProtectedRoute;