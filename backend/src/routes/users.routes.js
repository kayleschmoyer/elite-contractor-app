// backend/src/routes/users.routes.js
import { Router } from 'express';
import UserController from '../controllers/users.controller.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Middleware to check login token
import { isAdmin } from '../middleware/authorizationMiddleware.js'; // Middleware to check ADMIN role

const router = Router();

// Apply auth middleware FIRST to all user routes
router.use(authMiddleware);
// Apply isAdmin middleware NEXT to all user routes (only Admins can manage users)
router.use(isAdmin);

// Define routes (already protected by middleware above)

// POST /api/users - Create a new user (Admin only)
router.post('/', UserController.createUser);

// GET /api/users - Get users in the admin's company (Admin only)
router.get('/', UserController.getCompanyUsers);

// Add routes for GET /:id, PUT /:id, DELETE /:id later

export default router;