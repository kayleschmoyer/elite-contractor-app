// frontend/src/api/projectApi.js
import axios from 'axios';

// Get backend URL from environment variable if set, otherwise default
// You might need to configure Vite for environment variables (.env file in frontend root)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getProjects = async () => {
    try {
        const response = await apiClient.get('/projects');
        return response.data;
    } catch (error) {
        console.error("Error fetching projects:", error);
        // Handle error appropriately in the UI
        throw error;
    }
};

export const getProjectById = async (id) => {
    try {
        const response = await apiClient.get(`/projects/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching project ${id}:`, error);
         // Handle error appropriately in the UI
        throw error;
    }
};

// Add functions for createProject, updateProject, deleteProject later