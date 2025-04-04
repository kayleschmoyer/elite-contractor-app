// backend/src/controllers/task.controller.js
import TaskService from '../services/task.service.js';
import logger from '../utils/logger.js';

/**
 * Controller to handle creation of a new task.
 * Expects projectId and other task data in req.body.
 */
const createTaskController = async (req, res, next) => {
    try {
        const taskData = req.body;
        const companyId = req.user?.companyId; // From authMiddleware

        if (!companyId) {
             return res.status(401).json({ message: 'Authentication error: Company information missing.' });
        }
        // Basic validation (service layer does more)
        if (!taskData.title || !taskData.projectId) {
            return res.status(400).json({ message: 'Missing required fields: title and projectId.' });
        }

        const newTask = await TaskService.createTask(taskData, companyId);
        res.status(201).json(newTask);

    } catch (error) {
        // Handle specific errors from service
        if (error.message.includes('required fields')) return res.status(400).json({ message: error.message });
        if (error.message.includes('Project not found')) return res.status(404).json({ message: error.message });
        if (error.message.includes('Assignee user not found')) return res.status(400).json({ message: error.message }); // Bad request as assignee is invalid

        // Pass other errors (like generic DB errors) to global handler
        next(error);
    }
};

/**
 * Controller to get all tasks for a specific project.
 * Expects projectId as a query parameter (e.g., /api/tasks?projectId=...)
 */
const getProjectTasksController = async (req, res, next) => {
    try {
        const { projectId } = req.query; // Get projectId from query parameter
        const companyId = req.user?.companyId;

        if (!companyId) {
            return res.status(401).json({ message: 'Authentication error: Company information missing.' });
        }
        if (!projectId) {
            return res.status(400).json({ message: 'Missing required query parameter: projectId.' });
        }

        const tasks = await TaskService.getTasksByProjectId(projectId, companyId);
        res.status(200).json(tasks);

    } catch (error) {
         // Handle specific errors from service
        if (error.message.includes('Project not found')) return res.status(404).json({ message: error.message });

        next(error);
    }
};

 // --- Add getTaskByIdController, updateTaskController, deleteTaskController later ---

const TaskController = {
    createTaskController,
    getProjectTasksController,
    // getTaskByIdController,
    // updateTaskController,
    // deleteTaskController,
};

export default TaskController;