// backend/src/routes/task.routes.js
import { Router } from 'express';
import TaskController from '../controllers/task.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';
// --- Import Validation ---
import { validate } from '../middleware/validationMiddleware.js';
import {
    createTaskSchema,
    updateTaskSchema,
    taskIdParamSchema,
    getTasksQuerySchema
} from '../validations/task.validations.js';
// --- End Imports ---

const router = Router();

// Apply authentication middleware to ALL task routes first
router.use(authMiddleware);

// --- Define Task CRUD routes with Validation ---

// POST /api/tasks - Create a new task
// Validate request body using createTaskSchema
router.post(
    '/',
    validate(createTaskSchema),
    TaskController.createTaskController
);

// GET /api/tasks - Get tasks (by project OR all dated for company)
// Validate query parameters (e.g., optional projectId) using getTasksQuerySchema
router.get(
    '/',
    validate(getTasksQuerySchema), // Add validation for query params
    TaskController.getTasksController
);

// PUT /api/tasks/:id - Update a specific task
// Validate URL param 'id' AND request body using updateTaskSchema
router.put(
    '/:id',
    validate(updateTaskSchema),
    TaskController.updateTaskController
);

// DELETE /api/tasks/:id - Delete a specific task
// Validate URL param 'id' using taskIdParamSchema
router.delete(
    '/:id',
    validate(taskIdParamSchema),
    TaskController.deleteTaskController
);

// --- Add GET /:id later if needed for fetching a single task directly ---
// Example: router.get('/:id', validate(taskIdParamSchema), TaskController.getTaskByIdController);

export default router;