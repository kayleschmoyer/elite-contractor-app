// frontend/src/components/common/LoadingSpinner.jsx
import React from 'react';

// Basic spinner using CSS (you can replace this with a more complex SVG or library later)
const spinnerStyle = {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    borderLeftColor: 'var(--color-accent-primary)', // Use theme color
    animation: 'spin 1s ease infinite',
    margin: '20px auto', // Center it
};

const keyframes = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

function LoadingSpinner() {
    return (
        <div>
            {/* Inject the keyframes */}
            <style>{keyframes}</style>
            {/* Apply the inline styles */}
            <div style={spinnerStyle}></div>
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
    );
}

// Make sure to include the default export!
export default LoadingSpinner;