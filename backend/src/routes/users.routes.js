// backend/src/routes/users.routes.js
import { Router } from 'express';
import UserController from '../controllers/users.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/authorizationMiddleware.js'; // Assuming isAdmin is here
// --- Import Validation ---
import { validate } from '../middleware/validationMiddleware.js';
import {
    createUserAdminSchema,
    updateUserAdminSchema,
    userIdParamSchema
} from '../validations/user.validations.js';
// --- End Imports ---

const router = Router();

// Apply auth and admin checks to ALL user management routes
// These run BEFORE the validation middleware for specific routes
router.use(authMiddleware);
router.use(isAdmin);

// --- Define routes relative to /api/users with Validation ---

// POST /api/users - Create a new user (Admin Only)
// Validate request body using createUserAdminSchema
router.post(
    '/',
    validate(createUserAdminSchema), // <-- Add validation
    UserController.createUser
);

// GET /api/users - Get users in the admin's company (Admin Only)
// No specific query/param validation needed currently
router.get(
    '/',
    UserController.getCompanyUsers
);

// PUT /api/users/:id - Update a user by ID (Admin Only)
// Validate URL param 'id' AND request body using updateUserAdminSchema
router.put(
    '/:id',
    validate(updateUserAdminSchema), // <-- Add validation
    UserController.updateUser
);

// DELETE /api/users/:id - Delete a user by ID (Admin Only)
// Validate URL param 'id' using userIdParamSchema
router.delete(
    '/:id',
    validate(userIdParamSchema), // <-- Add validation
    UserController.deleteUser
);

export default router;