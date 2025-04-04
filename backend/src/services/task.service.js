// backend/src/services/task.service.js
import prisma from '../config/db.js';
import logger from '../utils/logger.js';
import { TaskStatus } from '@prisma/client'; // Import generated enum

// Helper selection for included user (assignee)
const assigneeSelection = {
    select: { id: true, name: true, email: true }
};

/**
 * Creates a new task for a specific project within the user's company.
 * @param {object} taskData - Data for the new task { title, projectId, status?, dueDate?, notes?, priority?, assigneeId? }
 * @param {string} companyId - The company ID of the user creating the task.
 * @returns {Promise<object>} The created task object, potentially including assignee info.
 * @throws {Error} If validation fails, project/assignee not found/accessible, or DB error.
 */
const createTask = async (taskData, companyId) => {
    const { title, projectId, status, dueDate, notes, priority, assigneeId } = taskData;

    // 1. Validate required fields
    if (!title || !projectId) {
        throw new Error('Missing required fields: title and projectId are required.'); // Controller -> 400
    }
    if (!companyId) {
        throw new Error('Internal Error: Company ID is required.'); // Should be passed from controller
    }

    try {
        // 2. Verify the project exists and belongs to the user's company
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, companyId: true } // Select only needed fields
        });

        if (!project || project.companyId !== companyId) {
            logger.warn(`User in company ${companyId} attempted to create task for inaccessible project ${projectId}`);
            throw new Error('Project not found or not accessible.'); // Controller -> 404 or 403
        }

        // 3. Optional: Verify assignee exists and belongs to the same company
        if (assigneeId) {
            const assignee = await prisma.user.findUnique({
                where: { id: assigneeId },
                select: { id: true, companyId: true }
            });
            if (!assignee || assignee.companyId !== companyId) {
                logger.warn(`Attempt to assign task to invalid/inaccessible user ${assigneeId} in company ${companyId}`);
                throw new Error('Assignee user not found or does not belong to this company.'); // Controller -> 400 or 404
            }
        }

        // 4. Prepare data for creation
        const dataToCreate = {
            title,
            projectId,
            companyId, // Set companyId (matches project's)
            status: status || TaskStatus.TODO, // Default status if not provided
            dueDate: dueDate ? new Date(dueDate) : null, // Ensure dueDate is Date object or null
            notes,
            priority,
            assigneeId: assigneeId || null, // Assignee ID or null
        };

        // 5. Create the task
        const newTask = await prisma.task.create({
            data: dataToCreate,
            include: { // Include assignee details in the response
                assignee: assigneeSelection
            }
        });

        logger.info(`Task created: "${newTask.title}" for project ${projectId} in company ${companyId}`);
        return newTask;

    } catch (error) {
        logger.error(`Error creating task for project ${projectId}, company ${companyId}:`, error);
        // Handle specific errors if needed (e.g., invalid date format?)
        if (error instanceof Error && error.message.includes('required fields')) throw error; // Propagate validation error
        if (error instanceof Error && error.message.includes('Project not found')) throw error; // Propagate authz/not found error
        if (error instanceof Error && error.message.includes('Assignee user not found')) throw error; // Propagate assignee error
        throw new Error('Database error during task creation.'); // Fallback
    }
};

/**
 * Gets all tasks for a specific project, ensuring user has access via company.
 * @param {string} projectId - The ID of the project.
 * @param {string} companyId - The company ID of the user making the request.
 * @returns {Promise<Array<object>>} Array of task objects, potentially including assignee info.
 * @throws {Error} If project not found/accessible or DB error occurs.
 */
const getTasksByProjectId = async (projectId, companyId) => {
    if (!projectId || !companyId) {
        throw new Error('Project ID and Company ID are required.');
    }
    try {
        // 1. Verify the project exists and belongs to the user's company first
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, companyId: true }
        });

        if (!project || project.companyId !== companyId) {
             logger.warn(`User in company ${companyId} attempted to access tasks for inaccessible project ${projectId}`);
             throw new Error('Project not found or not accessible.'); // Controller -> 404 or 403
        }

        // 2. Fetch tasks for the validated project ID
        const tasks = await prisma.task.findMany({
            where: { projectId: projectId },
            include: { // Include assignee details
                assignee: assigneeSelection
            },
            orderBy: { createdAt: 'asc' } // Or order by status, priority, dueDate etc.
        });
        return tasks;

    } catch (error) {
        logger.error(`Error fetching tasks for project ${projectId}, company ${companyId}:`, error);
        if (error instanceof Error && error.message.includes('Project not found')) throw error;
        throw new Error('Could not retrieve tasks from database.');
    }
};

// --- Add getTaskById, updateTask, deleteTask later ---

const TaskService = {
    createTask,
    getTasksByProjectId,
    // getTaskById,
    // updateTask,
    // deleteTask,
};

export default TaskService;