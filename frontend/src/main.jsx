// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.jsx';

// --- MUI Imports ---
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// --- End MUI Imports ---

// --- Your CSS Imports (Order might matter less with CssBaseline, but keep index.css first) ---
import './index.css'; // Contains @import for react-big-calendar CSS
import './styles/variables.css';
import './styles/theme.css';
import './styles/base.css';
// --- End CSS Imports ---

// --- Create a basic default MUI theme ---
// We start with the default light theme. Customization comes later.
const defaultTheme = createTheme({
  // You can define basic palette overrides here if needed immediately
  // palette: {
  //   primary: {
  //     main: '#0d6efd', // Example primary color
  //   },
  // },
});
// --- End Theme ---


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* --- Wrap with MUI ThemeProvider --- */}
      <ThemeProvider theme={defaultTheme}>
        {/* CssBaseline kickstarts an elegant, consistent baseline to build upon. */}
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
      {/* --- End ThemeProvider --- */}
    </BrowserRouter>
  </React.StrictMode>,
);