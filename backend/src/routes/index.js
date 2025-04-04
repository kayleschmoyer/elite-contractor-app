// backend/src/routes/index.js
import { Router } from 'express';
import projectRoutes from './projects.routes.js'; // Routes for project CRUD
import authRoutes from './auth.routes.js'; // Routes for user registration and login

// Create the main router instance
const router = Router();

// --- Mount Authentication Routes ---
// Requests to /api/auth/... will be handled by authRoutes
router.use('/auth', authRoutes);

// --- Mount Project Routes ---
// Requests to /api/projects/... will be handled by projectRoutes
// We will add authentication middleware here later to protect these routes
router.use('/projects', projectRoutes);


// --- Simple Health Check Route ---
// Accessible at /api/health
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    // You could add checks for database connectivity here later
  });
});


// Export the main router to be used in server.js
export default router;