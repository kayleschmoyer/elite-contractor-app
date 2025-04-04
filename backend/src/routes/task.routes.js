// backend/src/routes/task.routes.js
import { Router } from 'express';
import TaskController from '../controllers/task.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Apply authentication middleware to ALL task routes
router.use(authMiddleware);

// Define routes for /api/tasks

// POST /api/tasks - Create a new task
router.post('/', TaskController.createTaskController);

// GET /api/tasks - Get tasks for a specific project (requires ?projectId=...)
router.get('/', TaskController.getTasksController);

// --- NEW: Update and Delete Routes ---

// PUT /api/tasks/:id - Update a specific task
router.put('/:id', TaskController.updateTaskController);

// DELETE /api/tasks/:id - Delete a specific task
router.delete('/:id', TaskController.deleteTaskController);

// --- Add GET /:id later if needed for fetching a single task directly ---
// router.get('/:id', TaskController.getTaskByIdController);

export default router;