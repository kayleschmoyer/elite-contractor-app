// backend/src/routes/projects.routes.js
import { Router } from 'express';
import ProjectController from '../controllers/projects.controller.js';

const router = Router();

router.get('/', ProjectController.getProjects);
router.get('/:id', ProjectController.getSingleProject);
// Add routes for POST, PUT, DELETE later

export default router;