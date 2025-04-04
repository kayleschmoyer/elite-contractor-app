// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
import App from './App.jsx';

// Import styles
import './index.css';
import './styles/variables.css';
import './styles/theme.css';
import './styles/base.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap App with BrowserRouter first, then AuthProvider */}
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);