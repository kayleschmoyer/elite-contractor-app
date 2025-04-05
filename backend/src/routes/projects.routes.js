// backend/src/routes/projects.routes.js
import { Router } from 'express';
import ProjectController from '../controllers/projects.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';
// --- Import Validation ---
import { validate } from '../middleware/validationMiddleware.js';
import {
    createProjectSchema,
    updateProjectSchema,
    projectIdParamSchema
} from '../validations/project.validations.js';
// --- End Imports ---

const router = Router();

// Apply Authentication Middleware to ALL project routes first
router.use(authMiddleware);

// --- Protected Project Routes with Validation ---

// GET /api/projects - Get all projects for the logged-in user
// No specific validation needed for query/params currently, add later if filtering is added
router.get('/', ProjectController.getProjects);

// POST /api/projects - Create a new project
// Validate request body using createProjectSchema
router.post('/', validate(createProjectSchema), ProjectController.createNewProject);

// GET /api/projects/:id - Get a specific project by ID
// Validate URL parameter 'id' using projectIdParamSchema
router.get('/:id', validate(projectIdParamSchema), ProjectController.getSingleProject);

// PUT /api/projects/:id - Update a specific project by ID
// Validate URL param 'id' AND request body using updateProjectSchema
router.put('/:id', validate(updateProjectSchema), ProjectController.updateExistingProject);

// DELETE /api/projects/:id - Delete a specific project by ID
// Validate URL parameter 'id' using projectIdParamSchema
router.delete('/:id', validate(projectIdParamSchema), ProjectController.deleteSingleProject);


// Export the protected and validated project router
export default router;