// backend/src/controllers/task.controller.js
import TaskService from '../services/task.service.js';
import logger from '../utils/logger.js';

/**
 * Controller to handle creation of a new task.
 */
const createTaskController = async (req, res, next) => {
    // ... (createTaskController function remains the same) ...
    try { const taskData = req.body; const companyId = req.user?.companyId; if (!companyId) return res.status(401).json({ message: 'Auth error: Company missing.' }); if (!taskData.title || !taskData.projectId) return res.status(400).json({ message: 'Missing fields: title and projectId.' }); const newTask = await TaskService.createTask(taskData, companyId); res.status(201).json(newTask); }
    catch (error) { if (error.message.includes('required fields')) return res.status(400).json({ message: error.message }); if (error.message.includes('Project not found')) return res.status(404).json({ message: error.message }); if (error.message.includes('Assignee user not found')) return res.status(400).json({ message: error.message }); next(error); }
};

/**
 * Controller to get all tasks for a specific project.
 */
const getProjectTasksController = async (req, res, next) => {
    // ... (getProjectTasksController function remains the same) ...
    try { const { projectId } = req.query; const companyId = req.user?.companyId; if (!companyId) return res.status(401).json({ message: 'Auth error: Company missing.' }); if (!projectId) return res.status(400).json({ message: 'Missing query parameter: projectId.' }); const tasks = await TaskService.getTasksByProjectId(projectId, companyId); res.status(200).json(tasks); }
    catch (error) { if (error.message.includes('Project not found')) return res.status(404).json({ message: error.message }); next(error); }
};


// --- NEW: Controller to handle updating a task ---
const updateTaskController = async (req, res, next) => {
    try {
        const { id: taskId } = req.params; // Task ID from URL
        const updateData = req.body;
        const companyId = req.user?.companyId;

        if (!companyId) return res.status(401).json({ message: 'Authentication error: Company information missing.' });
        if (Object.keys(updateData).length === 0) return res.status(400).json({ message: 'No update data provided.'});

        const updatedTask = await TaskService.updateTask(taskId, updateData, companyId);

        if (!updatedTask) {
            // Service returns null if not found or doesn't belong to company
            return res.status(404).json({ message: 'Task not found or access denied.' });
        }

        res.status(200).json(updatedTask); // Return updated task

    } catch (error) {
         // Handle specific validation errors from service etc.
         if (error.message.includes('Assignee user not found') || error.message.includes('Invalid priority')) {
             return res.status(400).json({ message: error.message });
         }
        next(error);
    }
};

// --- NEW: Controller to handle deleting a task ---
const deleteTaskController = async (req, res, next) => {
    try {
        const { id: taskId } = req.params; // Task ID from URL
        const companyId = req.user?.companyId;

        if (!companyId) return res.status(401).json({ message: 'Authentication error: Company information missing.' });

        const success = await TaskService.deleteTask(taskId, companyId);

        if (!success) {
            // Service returns false if not found or doesn't belong to company
            return res.status(404).json({ message: 'Task not found or access denied.' });
        }

        res.status(204).send(); // Success, no content

    } catch (error) {
         // Handle specific errors like FK constraint from service
         if (error.message.includes('Cannot delete')) {
             return res.status(400).json({ message: error.message });
         }
        next(error);
    }
};


// Export all controller functions
const TaskController = {
    createTaskController,
    getProjectTasksController,
    updateTaskController,   // <-- Add new
    deleteTaskController,   // <-- Add new
};

export default TaskController;