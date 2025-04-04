// backend/src/routes/auth.routes.js
import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';

const router = Router();

// POST /api/auth/register
router.post('/register', AuthController.register);

// POST /api/auth/login
router.post('/login', AuthController.login);

export default router;