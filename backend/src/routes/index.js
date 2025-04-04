// backend/src/routes/index.js
import { Router } from 'express';
import projectRoutes from './projects.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './users.routes.js'; // <-- Import user routes

const router = Router();

// Mount auth routes first
router.use('/auth', authRoutes);

// Mount user management routes (requires auth + admin role)
router.use('/users', userRoutes); // <-- Mount user routes under /api/users

// Mount project routes (requires auth)
router.use('/projects', projectRoutes);


// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

export default router;