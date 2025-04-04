// backend/src/routes/users.routes.js
import { Router } from 'express';
import UserController from '../controllers/users.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/authorizationMiddleware.js'; // Assuming isAdmin is here

const router = Router();

// Apply auth and admin checks to ALL user management routes
router.use(authMiddleware);
router.use(isAdmin);

// Define routes relative to /api/users

// POST /api/users - Create a new user
router.post('/', UserController.createUser);

// GET /api/users - Get users in the admin's company
router.get('/', UserController.getCompanyUsers);

// --- NEW: Update and Delete Routes ---

// PUT /api/users/:id - Update a user by ID
router.put('/:id', UserController.updateUser);

// DELETE /api/users/:id - Delete a user by ID
router.delete('/:id', UserController.deleteUser);

export default router;