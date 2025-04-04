// backend/src/services/client.service.js
import prisma from '../config/db.js';
import logger from '../utils/logger.js';

/**
 * Helper function to get a client by ID and verify company ownership.
 * @param {string} clientId - The ID of the client to retrieve.
 * @param {string} companyId - The company ID of the user making the request.
 * @returns {Promise<object|null>} The client object if found and owned, otherwise null.
 * @throws {Error} If database error occurs.
 */
const getClientById = async (clientId, companyId) => {
    if (!clientId || !companyId) {
        throw new Error('Client ID and Company ID are required.');
    }
    try {
        const client = await prisma.client.findUnique({
            where: { id: clientId },
        });

        // Verify the client exists and belongs to the correct company
        if (!client || client.companyId !== companyId) {
            return null; // Not found or not authorized for this company
        }
        return client;
    } catch (error) {
        logger.error(`Error fetching client ${clientId} for company ${companyId}:`, error);
        throw new Error('Could not retrieve client details from database.');
    }
};

/**
 * Creates a new client for a specific company.
 * @param {object} clientData - Data for the new client { name, email?, phone?, address? }
 * @param {string} companyId - The ID of the company this client belongs to.
 * @returns {Promise<object>} The created client object.
 */
const createClient = async (clientData, companyId) => {
    const { name, email, phone, address } = clientData;
    if (!name) throw new Error('Client name is required.');
    if (!companyId) throw new Error('Internal Error: Company ID is required to create a client.');

    try {
        const newClient = await prisma.client.create({
            data: { name, email, phone, address, companyId },
            select: { id: true, name: true, email: true, phone: true, address: true, companyId: true, createdAt: true }
        });
        logger.info(`Client created: ${newClient.name} for company ${companyId}`);
        return newClient;
    } catch (error) {
        logger.error(`Error creating client for company ${companyId}:`, error);
        throw new Error('Database error during client creation.');
    }
};

/**
 * Gets all clients belonging to a specific company.
 * @param {string} companyId - The ID of the company.
 * @returns {Promise<Array<object>>} Array of client objects.
 */
const getClientsByCompany = async (companyId) => {
    if (!companyId) throw new Error('Internal Error: Company ID is required to fetch clients.');
    try {
        const clients = await prisma.client.findMany({
            where: { companyId: companyId },
            select: { id: true, name: true, email: true, phone: true, address: true, companyId: true, createdAt: true, updatedAt: true },
            orderBy: { name: 'asc' }
        });
        return clients;
    } catch (error) {
        logger.error(`Error fetching clients for company ${companyId}:`, error);
        throw new Error('Could not retrieve clients from database.');
    }
};

/**
 * Updates an existing client, verifying company ownership first.
 * @param {string} clientId - The ID of the client to update.
 * @param {object} updateData - An object containing the fields to update.
 * @param {string} companyId - The company ID of the user making the request.
 * @returns {Promise<object|null>} The updated client object, or null if not found/authorized.
 */
 const updateClient = async (clientId, updateData, companyId) => {
    try {
        // 1. Verify ownership/existence first
        const existingClient = await getClientById(clientId, companyId);
        if (!existingClient) {
            return null; // Indicate not found or not authorized
        }

        // 2. Prepare data (prevent updating companyId or id)
        const dataToUpdate = { ...updateData };
        delete dataToUpdate.id;
        delete dataToUpdate.companyId;
        delete dataToUpdate.createdAt; // Don't allow changing createdAt

        // 3. Perform the update
        const updatedClient = await prisma.client.update({
            where: { id: clientId }, // ID verified by getClientById implicitly
            data: dataToUpdate,
            select: { id: true, name: true, email: true, phone: true, address: true, companyId: true, createdAt: true, updatedAt: true }
        });
        logger.info(`Client updated: ${updatedClient.name} (ID: ${clientId}) in company ${companyId}`);
        return updatedClient;
    } catch (error) {
        logger.error(`Error updating client ${clientId} in company ${companyId}:`, error);
        // Handle potential errors during update (e.g., unique constraints if added)
        throw new Error('Database error during client update.');
    }
};

/**
 * Deletes a client, verifying company ownership first.
 * @param {string} clientId - The ID of the client to delete.
 * @param {string} companyId - The company ID of the user making the request.
 * @returns {Promise<boolean>} True if deleted successfully, false if not found/authorized.
 */
const deleteClient = async (clientId, companyId) => {
    try {
        // 1. Verify ownership/existence first
        const existingClient = await getClientById(clientId, companyId);
        if (!existingClient) {
            return false; // Indicate not found or not authorized
        }

        // 2. Perform the delete
        // Note: This might fail if Projects have FK constraint (unless onDelete: SetNull works)
        await prisma.client.delete({
            where: { id: clientId },
        });
        logger.info(`Client deleted: (ID: ${clientId}) in company ${companyId}`);
        return true;
    } catch (error) {
        logger.error(`Error deleting client ${clientId} in company ${companyId}:`, error);
        // Handle specific errors like foreign key constraints (P2003) if needed
        if (error.code === 'P2003') { // Foreign key constraint failed (e.g., project linked with non-SetNull relation)
             throw new Error('Cannot delete client because they are linked to existing projects.');
        }
        throw new Error('Database error during client deletion.');
    }
};

// Export all service functions
const ClientService = {
    createClient,
    getClientsByCompany,
    getClientById, // Expose the helper if controller needs it, though update/delete use it internally
    updateClient,
    deleteClient,
};

export default ClientService;