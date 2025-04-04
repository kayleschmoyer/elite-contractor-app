// backend/src/services/task.service.js
import prisma from '../config/db.js';
import logger from '../utils/logger.js';
import { TaskStatus } from '@prisma/client'; // Import generated enum

// Helper selection for included user (assignee)
const assigneeSelection = {
    select: { id: true, name: true, email: true }
};
// Helper selection for included project
const projectSelection = {
    select: { id: true, name: true }
};

/**
 * Helper function to get a task by ID and verify company ownership. Includes related data.
 */
const getTaskById = async (taskId, companyId) => {
    if (!taskId || !companyId) throw new Error('Task ID and Company ID are required.');
    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { // Include related data
                assignee: assigneeSelection,
                project: projectSelection
            }
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
 * Creates a new task for a specific project within the user's company. Includes related data in response.
 */
const createTask = async (taskData, companyId) => {
    const { title, projectId, status, notes, priority, assigneeId, startDate, endDate } = taskData;

    if (!title || !projectId) throw new Error('Missing required fields: title and projectId are required.');
    if (!companyId) throw new Error('Internal Error: Company ID is required.');

    try {
        // Verify Project access
        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, companyId: true } });
        if (!project || project.companyId !== companyId) throw new Error('Project not found or not accessible.');

        // Verify Assignee access (if provided)
        if (assigneeId) {
            const assignee = await prisma.user.findUnique({ where: { id: assigneeId }, select: { id: true, companyId: true } });
            if (!assignee || assignee.companyId !== companyId) throw new Error('Assignee user not found or does not belong to this company.');
        }

        // Prepare data, handling dates
        const dataToCreate = {
            title, projectId, companyId,
            status: status || TaskStatus.TODO,
            notes: notes || null,
            priority: priority ? parseInt(priority) : null,
            assigneeId: assigneeId || null,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
        };
        // Validate converted dates
        if (startDate && isNaN(dataToCreate.startDate.getTime())) throw new Error("Invalid Start Date provided.");
        if (endDate && isNaN(dataToCreate.endDate.getTime())) throw new Error("Invalid End Date provided.");

        // Create the task
        const newTask = await prisma.task.create({
            data: dataToCreate,
            include: { // Include related data in the response
                assignee: assigneeSelection,
                project: projectSelection
            }
        });

        logger.info(`Task created: "${newTask.title}" for project ${projectId} in company ${companyId}`);
        return newTask;

    } catch (error) {
        logger.error(`Error creating task for project ${projectId}, company ${companyId}:`, error);
        if (error instanceof Error && (error.message.includes('required fields') || error.message.includes('Project not found') || error.message.includes('Assignee user not found') || error.message.includes('Invalid Start Date') || error.message.includes('Invalid End Date'))) {
            throw error; // Propagate specific validation errors
        }
        throw new Error('Database error during task creation.');
    }
};

/**
 * Gets all tasks for a specific project, ensuring user has access via company. Includes related data.
 */
const getTasksByProjectId = async (projectId, companyId) => {
     if (!projectId || !companyId) throw new Error('Project ID and Company ID are required.');
    try {
        // Verify Project access first
        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, companyId: true }});
        if (!project || project.companyId !== companyId) throw new Error('Project not found or not accessible.');

        // Fetch tasks for the validated project ID
        const tasks = await prisma.task.findMany({
            where: { projectId: projectId },
            include: { // Include assignee and project details
                assignee: assigneeSelection,
                project: projectSelection // Include project name/id
            },
            orderBy: { createdAt: 'asc' }
        });
        return tasks;
    } catch (error) {
        logger.error(`Error fetching tasks for project ${projectId}, company ${companyId}:`, error);
        if (error instanceof Error && error.message.includes('Project not found')) throw error;
        throw new Error('Could not retrieve tasks from database.');
    }
};

/**
 * --- NEW: Gets all tasks for a company that have a start or end date ---
 * Includes related assignee and project data. Sorted by start date.
 * @param {string} companyId - The company ID of the user making the request.
 * @returns {Promise<Array<object>>} Array of task objects.
 */
const getCompanyTasksWithDates = async (companyId) => {
    if (!companyId) {
        throw new Error('Company ID is required to fetch schedule tasks.');
    }
    try {
        const tasks = await prisma.task.findMany({
            where: {
                companyId: companyId,
                // Filter: only include tasks where startDate OR endDate is not null
                OR: [
                    { startDate: { not: null } },
                    { endDate: { not: null } },
                ]
            },
            include: { // Include needed related data
                assignee: assigneeSelection,
                project: projectSelection // Include project name/id
            },
            orderBy: [ // Sort primarily by start date (nulls last), then end date
                 // Prisma handles nulls intelligently in sorting by default in newer versions
                 // Explicit nulls handling if needed: { startDate: { sort: 'asc', nulls: 'last' } }
                { startDate: 'asc' },
                { endDate: 'asc' }
            ]
        });
        return tasks;
    } catch (error) {
        logger.error(`Error fetching dated tasks for company ${companyId}:`, error);
        throw new Error('Could not retrieve schedule tasks from database.');
    }
};


/**
 * Updates an existing task, verifying company ownership first. Includes related data in response.
 */
const updateTask = async (taskId, updateData, companyId) => {
    try {
        // 1. Verify task exists and belongs to the user's company
        const existingTask = await getTaskById(taskId, companyId); // getTaskById now includes project/assignee
        if (!existingTask) {
            return null; // Not found or not authorized
        }

        // 2. Prepare data (validate fields, prevent changing key IDs)
        const dataToUpdate = {};
        if (updateData.hasOwnProperty('title')) dataToUpdate.title = updateData.title;
        if (updateData.hasOwnProperty('status')) dataToUpdate.status = updateData.status;
        if (updateData.hasOwnProperty('notes')) dataToUpdate.notes = updateData.notes || null;
        if (updateData.hasOwnProperty('priority')) {
            dataToUpdate.priority = updateData.priority ? parseInt(updateData.priority) : null;
            if (updateData.priority && isNaN(dataToUpdate.priority)) throw new Error('Invalid priority value.');
        }
        // Handle assignee change/unset - verify new assignee is in the same company
        if (updateData.hasOwnProperty('assigneeId')) {
            const newAssigneeId = updateData.assigneeId || null;
            if (newAssigneeId) {
                 const assignee = await prisma.user.findUnique({ where: { id: newAssigneeId }, select: { id: true, companyId: true } });
                 if (!assignee || assignee.companyId !== companyId) throw new Error('Assignee user not found or does not belong to this company.');
            }
            dataToUpdate.assigneeId = newAssigneeId;
        }
         // Handle Date Updates
        if (updateData.hasOwnProperty('startDate')) {
            dataToUpdate.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
            if (updateData.startDate && isNaN(dataToUpdate.startDate.getTime())) throw new Error("Invalid Start Date provided.");
        }
        if (updateData.hasOwnProperty('endDate')) {
            dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
            if (updateData.endDate && isNaN(dataToUpdate.endDate.getTime())) throw new Error("Invalid End Date provided.");
        }

        // Check if there's anything actually to update
        if (Object.keys(dataToUpdate).length === 0) {
             logger.warn(`Update called for task ${taskId} with no changed data.`);
             return existingTask; // Return existing task data
        }

        // 3. Perform the update
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: dataToUpdate,
            include: { // Include relations in response
                 assignee: assigneeSelection,
                 project: projectSelection
                 }
        });
        logger.info(`Task updated: "${updatedTask.title}" (ID: ${taskId}) in company ${companyId}`);
        return updatedTask;

    } catch (error) {
        logger.error(`Error updating task ${taskId} in company ${companyId}:`, error);
         if (error instanceof Error && (error.message.includes('Assignee user not found') || error.message.includes('Invalid priority') || error.message.includes('Invalid Start Date') || error.message.includes('Invalid End Date'))) {
             throw error;
         }
         if (error.code === 'P2025') return null; // Record vanished
        throw new Error('Database error during task update.');
    }
};

/**
 * Deletes a task, verifying company ownership first.
 */
const deleteTask = async (taskId, companyId) => {
     try {
        const existingTask = await getTaskById(taskId, companyId); // Use helper to check ownership
        if (!existingTask) return false;
        await prisma.task.delete({ where: { id: taskId } });
        logger.info(`Task deleted: (ID: ${taskId}) in company ${companyId}`);
        return true;
    } catch (error) {
        logger.error(`Error deleting task ${taskId} in company ${companyId}:`, error);
        if (error.code === 'P2025') return false; // Record not found
        // Handle other FK issues if necessary
        throw new Error('Database error during task deletion.');
    }
};


// Export all service functions, including the new one
const TaskService = {
    createTask,
    getTasksByProjectId,
    getTaskById,
    updateTask,
    deleteTask,
    getCompanyTasksWithDates, // <-- Export new function
};

export default TaskService;