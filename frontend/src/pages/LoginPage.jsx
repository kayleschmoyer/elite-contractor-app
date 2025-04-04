// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate and Link

// Styles (keep existing styles)
const pageStyle = { maxWidth: '400px', margin: '40px auto', padding: 'var(--spacing-lg)' };
const formStyle = { padding: 'var(--spacing-lg)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-background-secondary)'};
const inputGroupStyle = { marginBottom: 'var(--spacing-md)' };
const labelStyle = { display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', fontSize: 'inherit' };
const buttonStyle = { width: '100%', padding: 'var(--spacing-md)', border: 'none', borderRadius: 'var(--border-radius)', cursor: 'pointer', fontSize: 'inherit', backgroundColor: 'var(--color-accent-primary)', color: 'white', marginTop: 'var(--spacing-md)' };
const errorStyle = { color: 'var(--color-error)', marginTop: 'var(--spacing-md)', textAlign: 'center', fontSize: 'var(--font-size-sm)' };
const linkStyle = { display: 'block', textAlign: 'center', marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)'};


function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); // Get login function from context
    const navigate = useNavigate(); // Get navigate function for redirection

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Email and password are required.');
            setLoading(false);
            return;
        }

        try {
            console.log('Attempting login via context with:', { email }); // Don't log password
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

    return (
        <div style={pageStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>Login</h2>
                <div style={inputGroupStyle}>
                    <label htmlFor="email" style={labelStyle}>Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                        disabled={loading}
                        autoComplete="email"
                    />
                </div>
                <div style={inputGroupStyle}>
                    <label htmlFor="password" style={labelStyle}>Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        required
                        disabled={loading}
                        autoComplete="current-password"
                    />
                </div>
                {error && <p style={errorStyle}>{error}</p>}
                <button type="submit" style={buttonStyle} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                 {/* Add link to Registration page later */}
                 <Link to="/register" style={linkStyle}>Don't have an account? Register</Link>
            </form>
        </div>
    );
}

export default LoginPage;