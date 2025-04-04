// frontend/src/api/taskApi.js
import apiClient from './apiClient'; // Import the central configured Axios client

/**
 * Gets all tasks associated with a specific project ID.
 * @param {string} projectId - The ID of the project.
 * @returns {Promise<Array<object>>} An array of task objects.
 */
export const getTasksByProjectId = async (projectId) => {
    if (!projectId) {
         // Or throw an error if projectId is essential for the call
        console.warn("getTasksByProjectId called without projectId");
        return [];
    }
    try {
        // Token is added automatically by interceptor
        // Send projectId as a query parameter
        const response = await apiClient.get('/tasks', {
            params: { projectId: projectId }
        });
        return response.data;
    } catch (error) {
        console.error(`API Error fetching tasks for project ${projectId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Creates a new task.
 * @param {object} taskData - { title, projectId, status?, notes?, assigneeId?, ... }
 * @returns {Promise<object>} The newly created task object.
 */
export const createTask = async (taskData) => {
    // Ensure required fields are present (though backend validates too)
    if (!taskData.title || !taskData.projectId) {
        throw new Error("Title and Project ID are required to create a task.");
    }
    try {
        // Token is added automatically by interceptor
        const response = await apiClient.post('/tasks', taskData);
        return response.data;
    } catch (error) {
        console.error("API Error creating task:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// --- Add getTaskById, updateTask, deleteTask later ---
// export const getTaskById = async (taskId) => { ... }
// export const updateTask = async (taskId, updateData) => { ... }
// export const deleteTask = async (taskId) => { ... }