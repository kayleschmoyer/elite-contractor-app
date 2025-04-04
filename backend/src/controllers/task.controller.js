// backend/src/controllers/task.controller.js
import TaskService from '../services/task.service.js';
import logger from '../utils/logger.js';

/**
 * Controller to handle creation of a new task.
 * (Code provided by user - unchanged)
 */
const createTaskController = async (req, res, next) => {
    try {
        const taskData = req.body;
        const companyId = req.user?.companyId;
        if (!companyId) return res.status(401).json({ message: 'Authentication error: Company information missing.' });
        if (!taskData.title || !taskData.projectId) return res.status(400).json({ message: 'Missing required fields: title and projectId.' });

        const newTask = await TaskService.createTask(taskData, companyId);
        res.status(201).json(newTask);
    } catch (error) {
        if (error.message.includes('required fields')) return res.status(400).json({ message: error.message });
        if (error.message.includes('Project not found')) return res.status(404).json({ message: error.message });
        if (error.message.includes('Assignee user not found')) return res.status(400).json({ message: error.message });
        // Handle date validation errors potentially thrown by service
        if (error.message.includes('Invalid Start Date') || error.message.includes('Invalid End Date')) {
             return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

/**
 * --- MODIFIED: Controller to get tasks ---
 * If req.query.projectId is provided, gets tasks for that project.
 * Otherwise, gets all dated tasks for the user's company (for schedule).
 */
const getTasksController = async (req, res, next) => { // Renamed function
    try {
        const { projectId } = req.query; // Get projectId from query parameter
        const companyId = req.user?.companyId;

        if (!companyId) {
            return res.status(401).json({ message: 'Authentication error: Company information missing.' });
        }

        let tasks;
        if (projectId) {
            // If projectId IS provided, get tasks for that specific project
            logger.info(`Workspaceing tasks for project ${projectId}, company ${companyId}`);
            // Validate projectId format maybe? Or let service handle not found.
            tasks = await TaskService.getTasksByProjectId(projectId, companyId);
        } else {
            // If no projectId, get all dated tasks for the company schedule view
            logger.info(`Workspaceing dated schedule tasks for company ${companyId}`);
            tasks = await TaskService.getCompanyTasksWithDates(companyId);
        }

        res.status(200).json(tasks);

    } catch (error) {
         // Handle specific errors from service
        if (error.message.includes('Project not found')) return res.status(404).json({ message: error.message });
        // Pass other errors (like generic DB errors) to global handler
        next(error);
    }
};


/**
 * Controller to handle updating a task by Admin.
 * (Code provided by user - unchanged)
 */
const updateTaskController = async (req, res, next) => {
    try {
        const { id: taskId } = req.params;
        const updateData = req.body;
        const companyId = req.user?.companyId;

        if (!companyId) return res.status(401).json({ message: 'Authentication error: Company information missing.' });
        if (Object.keys(updateData).length === 0) return res.status(400).json({ message: 'No update data provided.'});

        const updatedTask = await TaskService.updateTask(taskId, updateData, companyId);

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found or access denied.' });
        }

        res.status(200).json(updatedTask);

    } catch (error) {
         if (error.message.includes('Assignee user not found') || error.message.includes('Invalid priority') || error.message.includes('Invalid Start Date') || error.message.includes('Invalid End Date')) {
             return res.status(400).json({ message: error.message });
         }
        next(error);
    }
};

/**
 * Controller to handle deleting a task by Admin.
 * (Code provided by user - unchanged)
 */
const deleteTaskController = async (req, res, next) => {
     try {
        const { id: taskId } = req.params;
        const companyId = req.user?.companyId;

        if (!companyId) return res.status(401).json({ message: 'Authentication error: Company information missing.' });

        const success = await TaskService.deleteTask(taskId, companyId);

        if (!success) {
            return res.status(404).json({ message: 'Task not found or access denied.' });
        }

        res.status(204).send();

    } catch (error) {
         if (error.message.includes('Cannot delete')) { // Catch specific delete constraint error from service if added
             return res.status(400).json({ message: error.message });
         }
        next(error);
    }
};


// Export all controller functions, using the new name for the GET handler
const TaskController = {
    createTaskController,
    getTasksController, // <-- Use renamed function
    updateTaskController,
    deleteTaskController,
};

export default TaskController;