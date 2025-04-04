// backend/src/routes/index.js
import { Router } from 'express';
import projectRoutes from './projects.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './users.routes.js';
import clientRoutes from './client.routes.js';
import taskRoutes from './task.routes.js';

const router = Router();

// Mount auth routes first
router.use('/auth', authRoutes);

// Mount user management routes (requires auth + admin role)
router.use('/users', userRoutes); // <-- Mount user routes under /api/users

// Mount project routes (requires auth)
router.use('/projects', projectRoutes);

// Mount client routes (requires auth)
router.use('/clients', clientRoutes);

// Mount task routes (requires auth)
router.use('/tasks', taskRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

export default router;