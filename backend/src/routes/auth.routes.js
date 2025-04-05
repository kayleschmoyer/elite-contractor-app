// backend/src/routes/auth.routes.js
import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validationMiddleware.js'; // <-- Import validate middleware
import { registerSchema, loginSchema } from '../validations/auth.validations.js'; // <-- Import Zod schemas

const router = Router();

// POST /api/auth/register
// Add validate(registerSchema) before the controller
//router.post('/register', validate(registerSchema), AuthController.register);

// POST /api/auth/login
// Add validate(loginSchema) before the controller
router.post('/login', validate(loginSchema), AuthController.login);

// Maybe add routes for refresh token, password reset later

export default router;