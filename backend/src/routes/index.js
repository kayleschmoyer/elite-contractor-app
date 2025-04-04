// backend/src/routes/index.js
import { Router } from 'express';
import projectRoutes from './projects.routes.js';
// Import other route files here (e.g., userRoutes, authRoutes)

const router = Router();

router.use('/projects', projectRoutes);
// router.use('/users', userRoutes);
// router.use('/auth', authRoutes);

// Simple health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});


export default router;