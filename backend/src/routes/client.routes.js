// backend/src/routes/client.routes.js
import { Router } from 'express';
import ClientController from '../controllers/client.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';
// --- Import Validation ---
import { validate } from '../middleware/validationMiddleware.js';
import {
    createClientSchema,
    updateClientSchema,
    clientIdParamSchema
} from '../validations/client.validations.js';
// --- End Imports ---

const router = Router();

// Apply authentication middleware to ALL client routes first
router.use(authMiddleware);

// --- Define Client CRUD routes with Validation ---

// POST /api/clients - Create a new client
// Validate request body using createClientSchema
router.post('/', validate(createClientSchema), ClientController.createClientController);

// GET /api/clients - Get all clients for the user's company
// No specific validation needed for query/params currently
router.get('/', ClientController.getCompanyClientsController);

// PUT /api/clients/:id - Update a specific client
// Validate URL param 'id' AND request body using updateClientSchema
router.put('/:id', validate(updateClientSchema), ClientController.updateClientController);

// DELETE /api/clients/:id - Delete a specific client
// Validate URL param 'id' using clientIdParamSchema
router.delete('/:id', validate(clientIdParamSchema), ClientController.deleteClientController);

// GET /api/clients/:id - Get single client (If you add this endpoint later)
// Example: router.get('/:id', validate(clientIdParamSchema), ClientController.getClientByIdController);

export default router;