// backend/src/routes/projects.routes.js
import { Router } from 'express';
import ProjectController from '../controllers/projects.controller.js';
import authMiddleware from '../middleware/authMiddleware.js'; // <-- Import the middleware

// Create a new router instance specifically for project routes
const router = Router();

// --- Apply Authentication Middleware ---
// This line ensures that ALL routes defined in this file below this point
// will first pass through the authMiddleware. If the user is not authenticated
// (i.e., doesn't provide a valid JWT), the middleware will send back a 401
// response, and the ProjectController functions will not be reached.
router.use(authMiddleware);

// --- Protected Project Routes ---

// GET /api/projects - Get all projects for the logged-in user (needs controller update later)
router.get('/', ProjectController.getProjects);

// POST /api/projects - Create a new project for the logged-in user (needs controller update later)
router.post('/', ProjectController.createNewProject);

// GET /api/projects/:id - Get a specific project by ID (needs controller update for authorization later)
router.get('/:id', ProjectController.getSingleProject);

// PUT /api/projects/:id - Update a specific project by ID (needs controller update for authorization later)
router.put('/:id', ProjectController.updateExistingProject);

// DELETE /api/projects/:id - Delete a specific project by ID (needs controller update for authorization later)
router.delete('/:id', ProjectController.deleteSingleProject);


// Export the protected project router
export default router;