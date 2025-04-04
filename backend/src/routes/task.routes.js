// backend/src/routes/task.routes.js
import { Router } from 'express';
import TaskController from '../controllers/task.controller.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Auth checks JWT

const router = Router();

// Apply authentication middleware to ALL task routes
// Ensures req.user (with companyId) is available
router.use(authMiddleware);

// Define routes for /api/tasks

// POST /api/tasks - Create a new task (expects projectId in body)
router.post('/', TaskController.createTaskController);

// GET /api/tasks - Get tasks for a specific project (requires ?projectId=... query param)
router.get('/', TaskController.getProjectTasksController);

// --- Add GET /:id, PUT /:id, DELETE /:id later ---
// router.get('/:id', TaskController.getTaskByIdController);
// router.put('/:id', TaskController.updateTaskController);
// router.delete('/:id', TaskController.deleteTaskController);

export default router;