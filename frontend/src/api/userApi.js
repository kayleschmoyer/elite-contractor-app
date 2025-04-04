// frontend/src/api/userApi.js
import apiClient from './apiClient'; // Import the central configured Axios client

/**
 * Fetches the list of users for the currently authenticated admin's company.
 * Assumes the backend API at GET /api/users filters by the admin's company.
 * @returns {Promise<Array<object>>} An array of user objects.
 */
export const getCompanyUsers = async () => {
    try {
        // Token is automatically added by the apiClient interceptor
        const response = await apiClient.get('/users');
        return response.data;
    } catch (error) {
        console.error("API Error fetching company users:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Creates a new user (as an admin).
 * @param {object} userData - { email, password, name?, role? }
 * @returns {Promise<object>} The newly created user object.
 */
export const createUser = async (userData) => {
    try {
        // Token is automatically added by the apiClient interceptor
        const response = await apiClient.post('/users', userData);
        return response.data;
    } catch (error) {
        console.error("API Error creating user:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// Add functions for updating/deleting users later if needed
// export const updateUser = async (userId, updateData) => { ... }
// export const deleteUser = async (userId) => { ... }