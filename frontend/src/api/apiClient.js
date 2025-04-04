// frontend/src/api/apiClient.js
import axios from 'axios';

// Key used to store the token in localStorage (should match AuthContext)
const AUTH_TOKEN_KEY = 'authToken';

// Get backend URL from environment variable if set, otherwise default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Axios Request Interceptor ---
// This function will run before every request is sent using this apiClient instance.
apiClient.interceptors.request.use(
    (config) => {
        // Get the token from localStorage on each request
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            // If the token exists, add the Authorization header
            config.headers.Authorization = `Bearer ${token}`;
            // console.log('Interceptor: Token added to headers'); // Optional: for debugging
        } else {
            // Optional: Delete header if no token exists, just in case
            delete config.headers.Authorization;
            // console.log('Interceptor: No token found'); // Optional: for debugging
        }
        return config; // Return the modified config object
    },
    (error) => {
        // Handle request configuration errors
        console.error('Axios Interceptor Request Error:', error);
        return Promise.reject(error);
    }
);

// Optional: Add a response interceptor later to handle global 401 errors (e.g., auto-logout)
// apiClient.interceptors.response.use(response => response, error => {
//     if (error.response && error.response.status === 401) {
//         console.error("Unauthorized access - logging out");
//         // Call logout function from AuthContext or trigger logout event
//         // window.location.href = '/login'; // Force redirect (or use react-router)
//     }
//     return Promise.reject(error);
// });


export default apiClient;