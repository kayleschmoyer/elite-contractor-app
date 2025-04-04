// frontend/src/api/clientApi.js
import apiClient from './apiClient'; // Import the central configured Axios client

/**
 * Fetches the list of users for the currently authenticated admin's company.
 * @returns {Promise<Array<object>>} An array of client objects.
 */
export const getCompanyClients = async () => {
    try {
        const response = await apiClient.get('/clients');
        return response.data;
    } catch (error) {
        console.error("API Error fetching company clients:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Creates a new client.
 * @param {object} clientData - { name, email?, phone?, address? }
 * @returns {Promise<object>} The newly created client object.
 */
export const createClient = async (clientData) => {
    try {
        const response = await apiClient.post('/clients', clientData);
        return response.data;
    } catch (error) {
        console.error("API Error creating client:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Updates an existing client.
 * @param {string} clientId - The ID of the client to update.
 * @param {object} updateData - An object containing the fields to update.
 * @returns {Promise<object>} The updated client object.
 */
export const updateClient = async (clientId, updateData) => {
    try {
        const response = await apiClient.put(`/clients/${clientId}`, updateData);
        return response.data;
    } catch (error) {
        console.error(`API Error updating client ${clientId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Deletes a client.
 * @param {string} clientId - The ID of the client to delete.
 * @returns {Promise<void>}
 */
export const deleteClient = async (clientId) => {
    try {
        // DELETE requests usually return 204 No Content on success
        await apiClient.delete(`/clients/${clientId}`);
    } catch (error) {
        console.error(`API Error deleting client ${clientId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};