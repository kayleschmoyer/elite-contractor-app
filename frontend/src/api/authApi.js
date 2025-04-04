// frontend/src/api/authApi.js
import apiClient from './apiClient'; // Import the central client

/**
 * Logs in a user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Response data, typically { accessToken: string }
 */
export const login = async (email, password) => {
    try {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data; // Expected: { accessToken: "..." }
    } catch (error) {
        // Log error and re-throw for handling in the UI/context
        console.error("API Login Error:", error.response?.data || error.message);
        throw error.response?.data || error; // Throw structured error if possible
    }
};

/**
 * Registers a new user.
 * @param {object} userData - { email, password, name? }
 * @returns {Promise<object>} Response data, typically user object without password
 */
export const register = async (userData) => {
    try {
        const response = await apiClient.post('/auth/register', userData);
        return response.data; // Expected: { id, email, name, createdAt }
    } catch (error) {
        console.error("API Register Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Add function for fetching user profile later if needed
// export const fetchUserProfile = async () => { ... }