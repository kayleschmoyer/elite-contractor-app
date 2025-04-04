// frontend/src/api/userApi.js
import apiClient from './apiClient';

/**
 * Fetches the list of users for the currently authenticated admin's company.
 * @returns {Promise<Array<object>>} An array of user objects.
 */
export const getCompanyUsers = async () => {
    try {
        // Token added by interceptor, admin role checked by backend route
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
        // Token added by interceptor, admin role checked by backend route
        const response = await apiClient.post('/users', userData);
        return response.data;
    } catch (error) {
        console.error("API Error creating user:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Updates an existing user (as an admin).
 * @param {string} userId - The ID of the user to update.
 * @param {object} updateData - { name?, password?, role? } - Password should only be sent if changing.
 * @returns {Promise<object>} The updated user object.
 */
export const updateUser = async (userId, updateData) => {
     if (!userId) throw new Error("User ID is required for updating.");
    try {
        // Token added by interceptor, admin role checked by backend route
        const response = await apiClient.put(`/users/${userId}`, updateData);
        return response.data;
    } catch (error) {
        console.error(`API Error updating user ${userId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Deletes a user (as an admin).
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<void>} Resolves on successful deletion.
 */
export const deleteUser = async (userId) => {
     if (!userId) throw new Error("User ID is required for deleting.");
    try {
        // Token added by interceptor, admin role checked by backend route
        // DELETE requests usually return 204 No Content on success
        await apiClient.delete(`/users/${userId}`);
    } catch (error) {
        console.error(`API Error deleting user ${userId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};