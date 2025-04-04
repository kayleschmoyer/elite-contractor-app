// frontend/src/api/taskApi.js
import apiClient from './apiClient'; // Import the central configured Axios client

/**
 * Gets all tasks associated with a specific project ID.
 * @param {string} projectId - The ID of the project.
 * @returns {Promise<Array<object>>} An array of task objects.
 */
export const getTasksByProjectId = async (projectId) => {
    if (!projectId) {
        console.warn("getTasksByProjectId called without projectId");
        return [];
    }
    try {
        // Token added by interceptor
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
 * @param {object} taskData - { title, projectId, status?, notes?, assigneeId?, dueDate?, priority? }
 * @returns {Promise<object>} The newly created task object.
 */
export const createTask = async (taskData) => {
    if (!taskData.title || !taskData.projectId) {
        throw new Error("Title and Project ID are required to create a task.");
    }
    try {
        // Token added by interceptor
        const response = await apiClient.post('/tasks', taskData);
        return response.data;
    } catch (error) {
        console.error("API Error creating task:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Updates an existing task.
 * @param {string} taskId - The ID of the task to update.
 * @param {object} updateData - An object containing the fields to update.
 * @returns {Promise<object>} The updated task object.
 */
export const updateTask = async (taskId, updateData) => {
    if (!taskId) throw new Error("Task ID is required for updating.");
    try {
        // Token added by interceptor
        const response = await apiClient.put(`/tasks/${taskId}`, updateData);
        return response.data; // Backend should return the updated task
    } catch (error) {
        console.error(`API Error updating task ${taskId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Deletes a task.
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<void>} Resolves on successful deletion.
 */
export const deleteTask = async (taskId) => {
    if (!taskId) throw new Error("Task ID is required for deleting.");
    try {
        // Token added by interceptor
        // DELETE requests usually return 204 No Content on success
        await apiClient.delete(`/tasks/${taskId}`);
    } catch (error) {
        console.error(`API Error deleting task ${taskId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// --- Add getTaskById later if needed ---
// export const getTaskById = async (taskId) => { ... }