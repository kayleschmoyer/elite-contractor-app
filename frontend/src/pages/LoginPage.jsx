// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Import RouterLink for use with MUI Link
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

// --- MUI Imports ---
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link'; // MUI Link component
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Example Icon
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress'; // Loading indicator
// --- End MUI Imports ---

function LoginPage() {
    // --- State Variables (Keep your existing state) ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // --- End State Variables ---

    // --- Hooks (Keep your existing hooks) ---
    const { login } = useAuth(); // Get login function from context
    const navigate = useNavigate(); // Get navigate function for redirection
    // --- End Hooks ---

    // --- Submit Handler (Keep your existing logic) ---
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Email and password are required.');
            setLoading(false);
            return;
        }

        try {
            console.log('Attempting login via context with:', { email });
            await login(email, password); // Call the login function from AuthContext
            navigate('/', { replace: true }); // Navigate to home/projects on successful login
        } catch (err) {
             console.error("Login page failed:", err);
             // Use the message from the error object if available (thrown from context/api)
             setError(err.message || 'Login failed. Please check credentials or server status.');
        } finally {
            setLoading(false);
        }
    };
    // --- End Submit Handler ---


    // --- MUI Component Rendering ---
    return (
        // Container centers content horizontally and sets max width (xs = extra-small)
        <Container component="main" maxWidth="xs">
            {/* Box provides layout structure (flexbox column) and spacing */}
            <Box
                sx={{
                    marginTop: 8, // Use theme spacing units (8 * theme.spacing unit)
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {/* Avatar with Icon */}
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}> {/* m: 1 => margin */}
                    <LockOutlinedIcon />
                </Avatar>
                {/* Page Title */}
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                {/* Form using Box */}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    {/* Email Text Field */}
                    <TextField
                        margin="normal" // Adds top/bottom margin
                        required // Adds '*' and basic HTML5 validation
                        fullWidth // Takes up full container width
                        id="email"
                        label="Email Address" // Acts as placeholder/label
                        name="email"
                        autoComplete="email" // Browser hint
                        autoFocus // Focus on mount
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        error={!!error} // Apply error styling if error state is truthy
                        helperText={error && error.toLowerCase().includes('email') ? error : ''} // Optionally show specific errors
                    />
                    {/* Password Text Field */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        error={!!error} // Apply error styling if error state is truthy
                        helperText={error && error.toLowerCase().includes('password') ? error : ''} // Optionally show specific errors
                    />

                    {/* General Error Display (if not shown as helperText) */}
                     {error && !(error.toLowerCase().includes('email') || error.toLowerCase().includes('password')) && (
                         <Typography color="error" align="center" sx={{ mt: 1, fontSize: '0.875rem' }}>
                             {error}
                         </Typography>
                     )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained" // Primary filled button style
                        sx={{ mt: 3, mb: 2 }} // Margin top = 3 theme units, margin bottom = 2
                        disabled={loading}
                    >
                        {/* Show spinner inside button when loading */}
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>

                    {/* Links Grid */}
                    <Grid container justifyContent="flex-end">
                        {/* <Grid item xs> // Example 'Forgot password?' link if needed
                            <Link href="#" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid> */}
                        <Grid item>
                            {/* MUI Link component using React Router DOM for navigation */}
                            <Link component={RouterLink} to="/register" variant="body2">
                                {"Don't have an account? Register"}
                            </Link>
                            {/* Ensure /register route exists in App.jsx if this is uncommented */}
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            {/* You can add a Copyright component here if desired later */}
            {/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
        </Container>
    );
}

export default LoginPage;