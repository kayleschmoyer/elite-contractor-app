import apiClient from './apiClient';

// Get backend URL from environment variable if set, otherwise default
// Ensure you have VITE_API_URL in your frontend/.env file or adjust the default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Fetches all projects from the backend.
 * @returns {Promise<Array<object>>} An array of project objects.
 */
export const getProjects = async () => {
    try {
        const response = await apiClient.get('/projects');
        return response.data;
    } catch (error) {
        console.error("Error fetching projects:", error.response?.data || error.message);
        // Propagate error for UI handling
        throw error;
    }
};

/**
 * Fetches a single project by its ID.
 * @param {string} id - The ID of the project to fetch.
 * @returns {Promise<object>} The project object.
 */
export const getProjectById = async (id) => {
    try {
        const response = await apiClient.get(`/projects/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching project ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Creates a new project.
 * @param {object} projectData - Data for the new project (e.g., { name, client, status, ... })
 * @returns {Promise<object>} The newly created project object.
 */
export const createProject = async (projectData) => {
    try {
        const response = await apiClient.post('/projects', projectData);
        return response.data;
    } catch (error) {
        console.error("Error creating project:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Updates an existing project.
 * @param {string} id - The ID of the project to update.
 * @param {object} updateData - An object containing the fields to update.
 * @returns {Promise<object>} The updated project object.
 */
export const updateProject = async (id, updateData) => {
    try {
        const response = await apiClient.put(`/projects/${id}`, updateData);
        return response.data;
    } catch (error) {
        console.error(`Error updating project ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Deletes a project.
 * @param {string} id - The ID of the project to delete.
 * @returns {Promise<void>}
 */
export const deleteProject = async (id) => {
    try {
        // DELETE requests often return 204 No Content, so no response.data is expected on success
        await apiClient.delete(`/projects/${id}`);
    } catch (error) {
        console.error(`Error deleting project ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

// Optional: You could export the apiClient itself if needed elsewhere,
// or export all functions as a single object:
// export default { getProjects, getProjectById, createProject, updateProject, deleteProject };