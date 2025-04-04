// backend/src/routes/client.routes.js
import { Router } from 'express';
import ClientController from '../controllers/client.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Apply authentication middleware to ALL client routes
router.use(authMiddleware);

// --- Define Client CRUD routes ---

// POST /api/clients - Create a new client
router.post('/', ClientController.createClientController);

// GET /api/clients - Get all clients for the user's company
router.get('/', ClientController.getCompanyClientsController);

// --- NEW: Update and Delete Routes ---

// PUT /api/clients/:id - Update a specific client
router.put('/:id', ClientController.updateClientController);

// DELETE /api/clients/:id - Delete a specific client
router.delete('/:id', ClientController.deleteClientController);

// --- Add GET /:id later if needed ---
// router.get('/:id', ClientController.getClientByIdController); // Need to add getClientByIdController

export default router;