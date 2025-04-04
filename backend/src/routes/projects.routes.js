// backend/src/routes/projects.routes.js
import { Router } from 'express';
import ProjectController from '../controllers/projects.controller.js';
// Import authentication middleware later

const router = Router();

// Apply auth middleware here later: router.use(authenticateToken);

router.get('/', ProjectController.getProjects);
router.post('/', ProjectController.createNewProject); // POST to collection

router.get('/:id', ProjectController.getSingleProject);
router.put('/:id', ProjectController.updateExistingProject); // PUT to specific item
router.delete('/:id', ProjectController.deleteSingleProject); // DELETE specific item


export default router;