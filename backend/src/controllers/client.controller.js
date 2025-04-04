// backend/src/controllers/client.controller.js
import ClientService from '../services/client.service.js';
import logger from '../utils/logger.js';

/**
 * Controller to handle creation of a new client.
 */
const createClientController = async (req, res, next) => {
    try {
        const clientData = req.body;
        const companyId = req.user?.companyId;
        if (!companyId) return res.status(401).json({ message: 'Authentication error: Company information missing.' });
        if (!clientData.name) return res.status(400).json({ message: 'Client name is required.' });

        const newClient = await ClientService.createClient(clientData, companyId);
        res.status(201).json(newClient);
    } catch (error) {
        if (error.message.includes('already exists')) return res.status(409).json({ message: error.message });
        if (error.message.includes('required')) return res.status(400).json({ message: error.message });
        next(error);
    }
};

/**
 * Controller to get all clients for the logged-in user's company.
 */
const getCompanyClientsController = async (req, res, next) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) return res.status(401).json({ message: 'Authentication error: Company information missing.' });

        const clients = await ClientService.getClientsByCompany(companyId);
        res.status(200).json(clients);
    } catch (error) {
        next(error);
    }
};

// --- NEW: Controller to handle updating a client ---
const updateClientController = async (req, res, next) => {
    try {
        const { id: clientId } = req.params; // Get ID from URL parameter
        const updateData = req.body;
        const companyId = req.user?.companyId;

        if (!companyId) return res.status(401).json({ message: 'Authentication error: Company information missing.' });
        if (Object.keys(updateData).length === 0) return res.status(400).json({ message: 'No update data provided.'});
        // Add more validation on updateData if needed

        const updatedClient = await ClientService.updateClient(clientId, updateData, companyId);

        if (!updatedClient) {
            // Service returns null if not found or doesn't belong to company
            return res.status(404).json({ message: 'Client not found or access denied.' });
        }

        res.status(200).json(updatedClient); // Return updated client
    } catch (error) {
        // Handle specific errors from service if needed
        next(error);
    }
};

// --- NEW: Controller to handle deleting a client ---
const deleteClientController = async (req, res, next) => {
    try {
        const { id: clientId } = req.params; // Get ID from URL parameter
        const companyId = req.user?.companyId;

        if (!companyId) return res.status(401).json({ message: 'Authentication error: Company information missing.' });

        const success = await ClientService.deleteClient(clientId, companyId);

        if (!success) {
            // Service returns false if not found or doesn't belong to company
            return res.status(404).json({ message: 'Client not found or access denied.' });
        }

        res.status(204).send(); // Success, no content to return

    } catch (error) {
         // Handle specific errors like foreign key constraint from service
         if (error.message.includes('Cannot delete client')) {
             return res.status(400).json({ message: error.message }); // Bad request
         }
        next(error);
    }
};


// Export all controller functions
const ClientController = {
    createClientController,
    getCompanyClientsController,
    updateClientController,   // <-- Add new function
    deleteClientController,   // <-- Add new function
};

export default ClientController;