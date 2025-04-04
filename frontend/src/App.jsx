// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Link, Navigate, Outlet } from 'react-router-dom'; // Import Outlet if using nested layout
import { useAuth } from './contexts/AuthContext';

// Import Page/Feature Components
import ProjectList from './features/projects/ProjectList';
import LoginPage from './pages/LoginPage';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/routes/ProtectedRoute'; // <-- Import ProtectedRoute

// Basic Layout styles (optional)
const layoutStyle = { padding: 'var(--spacing-lg)' };
const navStyle = { marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)' };
const navLinkStyle = { marginRight: 'var(--spacing-md)' };
const logoutButtonStyle = { /* Add basic styles if needed */
    background: 'none',
    border: 'none',
    color: 'var(--color-accent-primary)',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
    float: 'right' // Example positioning
};


function App() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Show main loading indicator while AuthProvider initializes
  if (isLoading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <LoadingSpinner />
          </div>
      );
  }

  return (
    <div style={layoutStyle}>
      {/* Basic Navigation */}
      <nav style={navStyle}>
        {/* Link to projects only if authenticated? Or always show? Decision for UX. Let's always show for now. */}
        <Link to="/" style={navLinkStyle}>Home/Projects</Link>

        {/* Show Login or Logout button */}
        {!isAuthenticated
            ? <Link to="/login" style={navLinkStyle}>Login</Link>
            : <button onClick={logout} style={logoutButtonStyle}>Logout</button>
        }
        {/* TODO: Add Link to Register */}
        {/* {!isAuthenticated && <Link to="/register" style={navLinkStyle}>Register</Link>} */}

        {/* Clear float if needed */}
        <div style={{ clear: 'both' }}></div>
      </nav>

      {/* Define Application Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
        {/* TODO: Add Registration Route */}
        {/* <Route path="/register" element={!isAuthenticated ? <RegistrationPage /> : <Navigate to="/" replace />} /> */}

        {/* Protected Routes */}
        {/* All routes nested inside here will first pass through ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
            {/* Outlet in ProtectedRoute will render these nested routes */}
            <Route path="/" element={<ProjectList />} />
            <Route path="/projects" element={<ProjectList />} />
            {/* Add other protected routes here later, e.g.: */}
            {/* <Route path="/projects/:id" element={<ProjectDetailsPage />} /> */}
            {/* <Route path="/settings" element={<SettingsPage />} /> */}
        </Route>

        {/* Catch-all 404 Not Found Route */}
        {/* This should usually be the last route */}
        <Route path="*" element={<div><h2>404 Not Found</h2><Link to="/">Go Home</Link></div>} />
      </Routes>
    </div>
  );
}

export default App;