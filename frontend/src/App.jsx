// frontend/src/App.jsx
import React from 'react';
// Make sure Outlet is imported if using nested routes within admin/other sections later
import { Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // Import authentication context hook

// --- Import Page/Feature Components ---
import ProjectList from './features/projects/ProjectList';
import LoginPage from './pages/LoginPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ClientListPage from './pages/ClientListPage';
import ProjectDetailPage from './pages/ProjectDetailPage'; // <-- Import Project Detail Page

// --- Import Helper Components ---
import LoadingSpinner from './components/common/LoadingSpinner'; // Adjust path if needed
import ProtectedRoute from './components/routes/ProtectedRoute'; // Handles login check
import RequireAdminRole from './components/routes/RequireAdminRole'; // Handles ADMIN role check

// --- Basic Layout Styles (Optional - Consider moving to CSS) ---
const layoutStyle = {
    padding: 'var(--spacing-lg)',
    maxWidth: '1200px', // Example max width
    margin: '0 auto' // Center layout
};
const navStyle = {
    marginBottom: 'var(--spacing-lg)',
    paddingBottom: 'var(--spacing-md)',
    borderBottom: '1px solid var(--color-border)' ,
    display: 'flex', // Use flexbox for alignment
    justifyContent: 'space-between', // Space out nav groups
    alignItems: 'center'
};
const navGroupStyle = { // Group links together
    display: 'flex',
    gap: 'var(--spacing-md)', // Space between links
    alignItems: 'center'
};
const navLinkStyle = {
    textDecoration: 'none',
    color: 'var(--color-accent-primary)'
};
const logoutButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--color-accent-primary)',
    cursor: 'pointer',
    padding: 0,
    fontSize: 'inherit',
    textDecoration: 'underline',
};


function App() {
  // Get authentication state and user details from context
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  // Show a global loading indicator while the authentication status is being checked initially
  if (isLoading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <LoadingSpinner />
          </div>
      );
  }

  // Main application layout and routing
  return (
    <div style={layoutStyle}>
      {/* --- Navigation Bar --- */}
      <nav style={navStyle}>
         <div style={navGroupStyle}> {/* Left group */}
            {/* Link to home/projects always visible */}
            <Link to="/" style={navLinkStyle}>Projects</Link> {/* Updated label */}

            {/* --- Clients Link (visible if logged in) --- */}
            {isAuthenticated && (
                <Link to="/clients" style={navLinkStyle}>Clients</Link>
            )}

            {/* Conditional Admin Link */}
            {isAuthenticated && user?.role === 'ADMIN' && (
                 <Link to="/admin/users" style={navLinkStyle}>Manage Users</Link>
            )}
            {/* Add other navigation links here */}
         </div>

         <div style={navGroupStyle}> {/* Right group */}
            {/* Show Login or Logout button */}
            {!isAuthenticated
                ? <Link to="/login" style={navLinkStyle}>Login</Link>
                : <button onClick={logout} style={logoutButtonStyle}>Logout ({user?.email})</button> // Show email if logged in
            }
            {/* TODO: Add Register Link if needed */}
            {/* {!isAuthenticated && <Link to="/register" style={navLinkStyle}>Register</Link>} */}
         </div>
      </nav>

      {/* --- Application Routes Definition --- */}
      <Routes>
        {/* Public Routes */}
        <Route
            path="/login"
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
            // If user is already authenticated, redirect from /login to home
        />
        {/* Add Registration Route here if needed later */}
        {/* <Route path="/register" element={!isAuthenticated ? <RegistrationPage /> : <Navigate to="/" replace />} /> */}


        {/* Protected Routes (Require User to be Logged In) */}
        <Route element={<ProtectedRoute />}> {/* Level 1 Protection: Must be logged in */}

            {/* Standard Authenticated Routes */}
            <Route path="/" element={<ProjectList />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/clients" element={<ClientListPage />} />

            {/* --- Add Project Detail Route --- */}
            {/* The ':id' part makes 'id' available as a URL parameter */}
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            {/* --- End Project Detail Route --- */}


            {/* Admin-Only Protected Routes */}
            <Route path="/admin" element={<RequireAdminRole />}> {/* Level 2 Protection: Must have ADMIN role */}
                 {/* Define specific admin pages relative to "/admin" */}
                 {/* Outlet in RequireAdminRole renders these based on matched path */}
                 <Route path="users" element={<UserManagementPage />} />
                 {/* Add other admin-only pages here */}
                 {/* <Route path="settings" element={<AdminSettingsPage />} /> */}
            </Route>

        </Route>
        {/* --- End Protected Routes --- */}


        {/* Catch-all 404 Not Found Route */}
        {/* This should be the last route defined */}
        <Route path="*" element={
            <div>
                <h2>404 Not Found</h2>
                <p>Sorry, the page you were looking for does not exist.</p>
                <Link to="/">Go back to Home</Link>
            </div>
        } />
      </Routes>
    </div>
  );
}

export default App;