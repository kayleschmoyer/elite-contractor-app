// backend/src/services/task.service.js
import prisma from '../config/db.js';
import logger from '../utils/logger.js';
import { TaskStatus } from '@prisma/client'; // Import generated enum

// Helper selection for included user (assignee)
const assigneeSelection = {
    select: { id: true, name: true, email: true }
};

/**
 * Helper function to get a task by ID and verify company ownership.
 * @param {string} taskId - The ID of the task to retrieve.
 * @param {string} companyId - The company ID of the user making the request.
 * @returns {Promise<object|null>} The task object if found and accessible, otherwise null.
 * @throws {Error} If database error occurs.
 */
const getTaskById = async (taskId, companyId) => {
    if (!taskId || !companyId) {
        throw new Error('Task ID and Company ID are required.');
    }
    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { assignee: assigneeSelection } // Include assignee info
        });

        // Verify the task exists and belongs to the correct company
        if (!task || task.companyId !== companyId) {
            return null; // Not found or not authorized for this company
        }
        return task;
    } catch (error) {
        logger.error(`Error fetching task ${taskId} for company ${companyId}:`, error);
        throw new Error('Could not retrieve task details from database.');
    }
};


/**
 * Creates a new task for a specific project within the user's company.
 * @param {object} taskData - { title, projectId, status?, dueDate?, notes?, priority?, assigneeId? }
 * @param {string} companyId - The company ID of the user creating the task.
 * @returns {Promise<object>} The created task object.
 */
const createTask = async (taskData, companyId) => {
    // ... (createTask function remains the same as previous version) ...
    const { title, projectId, status, dueDate, notes, priority, assigneeId } = taskData;
    if (!title || !projectId) throw new Error('Missing required fields: title and projectId are required.');
    if (!companyId) throw new Error('Internal Error: Company ID is required.');
    try {
        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, companyId: true } });
        if (!project || project.companyId !== companyId) throw new Error('Project not found or not accessible.');
        if (assigneeId) {
            const assignee = await prisma.user.findUnique({ where: { id: assigneeId }, select: { id: true, companyId: true } });
            if (!assignee || assignee.companyId !== companyId) throw new Error('Assignee user not found or does not belong to this company.');
        }
        const dataToCreate = {
            title, projectId, companyId,
            status: status || TaskStatus.TODO,
            dueDate: dueDate ? new Date(dueDate) : null,
            notes,
            priority: priority ? parseInt(priority) : null, // Ensure priority is Int or null
            assigneeId: assigneeId || null,
        };
        const newTask = await prisma.task.create({
            data: dataToCreate,
            include: { assignee: assigneeSelection }
        });
        logger.info(`Task created: "${newTask.title}" for project ${projectId} in company ${companyId}`);
        return newTask;
    } catch (error) { /* ... (error handling as before) ... */
        logger.error(`Error creating task for project ${projectId}, company ${companyId}:`, error);
        if (error instanceof Error && (error.message.includes('required fields') || error.message.includes('Project not found') || error.message.includes('Assignee user not found'))) throw error;
        throw new Error('Database error during task creation.');
    }
};

/**
 * Gets all tasks for a specific project, ensuring user has access via company.
 * @param {string} projectId - The ID of the project.
 * @param {string} companyId - The company ID of the user making the request.
 * @returns {Promise<Array<object>>} Array of task objects.
 */
const getTasksByProjectId = async (projectId, companyId) => {
    // ... (getTasksByProjectId function remains the same as previous version) ...
     if (!projectId || !companyId) throw new Error('Project ID and Company ID are required.');
    try {
        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, companyId: true }});
        if (!project || project.companyId !== companyId) throw new Error('Project not found or not accessible.');
        const tasks = await prisma.task.findMany({
            where: { projectId: projectId },
            include: { assignee: assigneeSelection },
            orderBy: { createdAt: 'asc' }
        });
        return tasks;
    } catch (error) { /* ... (error handling as before) ... */
        logger.error(`Error fetching tasks for project ${projectId}, company ${companyId}:`, error);
        if (error instanceof Error && error.message.includes('Project not found')) throw error;
        throw new Error('Could not retrieve tasks from database.');
    }
};

/**
 * Updates an existing task, verifying company ownership first.
 * @param {string} taskId - The ID of the task to update.
 * @param {object} updateData - An object containing the fields to update.
 * @param {string} companyId - The company ID of the user making the request.
 * @returns {Promise<object|null>} The updated task object, or null if not found/authorized.
 */
const updateTask = async (taskId, updateData, companyId) => {
    try {
        // 1. Verify task exists and belongs to the user's company
        const existingTask = await getTaskById(taskId, companyId);
        if (!existingTask) {
            return null; // Not found or not authorized
        }

        // 2. Prepare data (validate fields, prevent changing key IDs)
        const dataToUpdate = { ...updateData };
        delete dataToUpdate.id;
        delete dataToUpdate.projectId; // Task shouldn't change project
        delete dataToUpdate.companyId; // Company scope shouldn't change
        delete dataToUpdate.createdAt; // Don't allow changing createdAt

        // Convert priority back to Int if present
        if (dataToUpdate.priority !== undefined) {
            dataToUpdate.priority = dataToUpdate.priority ? parseInt(dataToUpdate.priority) : null;
            if (dataToUpdate.priority && isNaN(dataToUpdate.priority)) throw new Error('Invalid priority value.');
        }
        // Handle assignee change - verify new assignee is in the same company
        if (dataToUpdate.assigneeId) {
             const assignee = await prisma.user.findUnique({ where: { id: dataToUpdate.assigneeId }, select: { id: true, companyId: true } });
             if (!assignee || assignee.companyId !== companyId) throw new Error('Assignee user not found or does not belong to this company.');
        } else if (dataToUpdate.hasOwnProperty('assigneeId')) { // Allow unsetting assignee
            dataToUpdate.assigneeId = null;
        }
         // Handle date
        if (dataToUpdate.dueDate !== undefined) {
             dataToUpdate.dueDate = dataToUpdate.dueDate ? new Date(dataToUpdate.dueDate) : null;
        }

        // 3. Perform the update
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: dataToUpdate,
            include: { assignee: assigneeSelection } // Include assignee in response
        });
        logger.info(`Task updated: "${updatedTask.title}" (ID: ${taskId}) in company ${companyId}`);
        return updatedTask;

    } catch (error) {
        logger.error(`Error updating task ${taskId} in company ${companyId}:`, error);
         if (error instanceof Error && (error.message.includes('Assignee user not found') || error.message.includes('Invalid priority'))) throw error; // Propagate specific validation errors
         if (error.code === 'P2025') return null; // Update failed b/c record vanished after check
        throw new Error('Database error during task update.');
    }
};

/**
 * Deletes a task, verifying company ownership first.
 * @param {string} taskId - The ID of the task to delete.
 * @param {string} companyId - The company ID of the user making the request.
 * @returns {Promise<boolean>} True if deleted successfully, false if not found/authorized.
 */
const deleteTask = async (taskId, companyId) => {
    try {
        // 1. Verify task exists and belongs to the user's company
        const existingTask = await getTaskById(taskId, companyId);
        if (!existingTask) {
            return false; // Indicate not found or not authorized
        }

        // 2. Perform the delete
        await prisma.task.delete({
            where: { id: taskId },
        });
        logger.info(`Task deleted: (ID: ${taskId}) in company ${companyId}`);
        return true;
    } catch (error) {
        logger.error(`Error deleting task ${taskId} in company ${companyId}:`, error);
        // Handle specific errors like P2025 if delete fails after check (rare)
        if (error.code === 'P2025') return false;
        throw new Error('Database error during task deletion.');
    }
};

// Export all service functions
const TaskService = {
    createTask,
    getTasksByProjectId,
    getTaskById, // Expose helper for potential GET /tasks/:id route later
    updateTask,
    deleteTask,
};

export default TaskService;