// frontend/src/App.jsx
import React from 'react';
// Import RouterLink separately for MUI components
import { Routes, Route, Link as RouterLink, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// --- Import MUI Components ---
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link'; // MUI Link component
import Container from '@mui/material/Container'; // <-- ADD THIS IMPORT
import CircularProgress from '@mui/material/CircularProgress';
// --- End MUI Imports ---

// --- Import Page/Feature Components ---
import ProjectList from './features/projects/ProjectList';
import LoginPage from './pages/LoginPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ClientListPage from './pages/ClientListPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SchedulePage from './pages/SchedulePage';

// --- Import Helper Components ---
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/routes/ProtectedRoute';
import RequireAdminRole from './components/routes/RequireAdminRole';

// --- Layout Style ---
// We can remove layoutStyle now as AppBar and main Box handle layout
// const layoutStyle = { /* ... */ };

function App() {
  // Get authentication state and user details from context
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  // Show a global loading indicator
  if (isLoading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <LoadingSpinner />
          </div>
      );
  }

  // Main application layout and routing
  return (
    // Use Box for flex column layout to push footer down (optional)
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
       {/* --- MUI Navigation Bar --- */}
        <AppBar position="static">
            {/* Container limits content width within AppBar to match potential page max-width */}
            <Container maxWidth="xl">
                 <Toolbar disableGutters> {/* disableGutters removes default padding */}

                    {/* App Title/Logo - Links to Home */}
                    <Typography
                        variant="h6"
                        noWrap
                        component={RouterLink}
                        to="/"
                        sx={{
                            mr: 2, // Margin right
                            flexGrow: 1, // Pushes items after it to the right
                            fontFamily: 'monospace', // Example font
                            fontWeight: 700,
                            letterSpacing: '.1rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        ELITE APP {/* Or Your App Name/Logo */}
                    </Typography>

                    {/* Navigation Links/Buttons */}
                    <Box sx={{ flexGrow: 0, display: 'flex', gap: { xs: 0.5, sm: 1 } }}> {/* Adjust gap */}
                        {isAuthenticated && (
                            <>
                                <Button component={RouterLink} to="/projects" sx={{ color: 'white' }}> Projects </Button>
                                <Button component={RouterLink} to="/clients" sx={{ color: 'white' }}> Clients </Button>
                                <Button component={RouterLink} to="/schedule" sx={{ color: 'white' }}> Schedule </Button>
                                {user?.role === 'ADMIN' && (
                                    <Button component={RouterLink} to="/admin/users" sx={{ color: 'white' }}> Manage Users </Button>
                                )}
                                <Button onClick={logout} sx={{ color: 'white' }}> Logout ({user?.email}) </Button>
                            </>
                        )}
                        {!isAuthenticated && (
                             <Button component={RouterLink} to="/login" sx={{ color: 'white' }}> Login </Button>
                        )}
                    </Box>

                </Toolbar>
            </Container>
        </AppBar>
        {/* --- End MUI Navigation Bar --- */}

       {/* --- Main Content Area --- */}
       {/* Apply consistent padding and centering for page content */}
       <Container component="main" sx={{ pt: 3, pb: 3, flexGrow: 1 }}> {/* pt=padding-top, pb=padding-bottom */}
            {/* --- Application Routes Definition (Keep existing routes) --- */}
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<ProjectList />} />
                    <Route path="/projects" element={<ProjectList />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/clients" element={<ClientListPage />} />
                    <Route path="/schedule" element={<SchedulePage />} />

                    {/* Admin-Only Routes */}
                    <Route path="/admin" element={<RequireAdminRole />}>
                         <Route path="users" element={<UserManagementPage />} />
                    </Route>
                </Route>

                {/* 404 Not Found Route */}
                <Route path="*" element={
                    <div>
                        <Typography variant="h4" component="h2" gutterBottom>404 Not Found</Typography>
                        <Typography>Sorry, the page you were looking for does not exist.</Typography>
                        <Link component={RouterLink} to="/">Go back to Home</Link> {/* Use MUI Link */}
                    </div>
                } />
            </Routes>
       </Container>
       {/* --- End Main Content Area --- */}

         {/* Optional Footer can go here */}
         {/* <Box component="footer" sx={{ py: 2, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800] }}> <Typography variant="body2" color="text.secondary" align="center"> {'Copyright © Your App '} {new Date().getFullYear()} {'.'} </Typography> </Box> */}
    </Box> // End outer Box flex container
  );
}

export default App;