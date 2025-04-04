// backend/src/services/projects.service.js
import prisma from '../config/db.js';
import logger from '../utils/logger.js';

// Helper to select client fields to return consistently
const clientSelection = {
    select: {
        id: true,
        name: true,
    }
};

/**
 * Gets all projects belonging to a specific user, including linked client name.
 * @param {string} userId - The ID of the user whose projects to retrieve.
 * @returns {Promise<Array<object>>}
 */
const getAllProjects = async (userId) => {
    if (!userId) throw new Error('User ID is required to fetch projects.');
    try {
        const projects = await prisma.project.findMany({
            where: { authorId: userId },
            include: { // Include related Client data
                client: clientSelection
            },
            orderBy: { createdAt: 'desc' }
        });
        return projects;
    } catch (error) {
        logger.error(`Error fetching projects for user ${userId}:`, error);
        throw new Error('Could not retrieve projects from database.');
    }
};

/**
 * Gets a single project by its ID, including linked client name.
 * @param {string} id - Project ID.
 * @returns {Promise<object|null>}
 */
const getProjectById = async (id) => {
     try {
        const project = await prisma.project.findUnique({
            where: { id: id },
            include: { // Include related Client data
                client: clientSelection
            }
        });
        return project;
    } catch (error) {
        logger.error(`Error fetching project by ID ${id}:`, error);
        throw new Error('Could not retrieve project details from database.');
    }
};

/**
 * Creates a new project linked to a user and potentially a client.
 * Assigns the project to the user's company.
 * @param {object} projectData - Data from req body { name, status, clientId?, address?, notes? }
 * @param {string} userId - The ID of the user creating the project.
 * @returns {Promise<object>} The newly created project object including client info.
 */
const createProject = async (projectData, userId) => {
    if (!userId) throw new Error('User ID is required to create a project.');
    try {
        // Basic validation
        if (!projectData.name || !projectData.status) {
            throw new Error('Missing required project fields: name, status');
        }

        // Handle optional clientId: convert empty string from form to null for DB
        const clientId = projectData.clientId || null;

        // --- FETCH USER TO GET companyId --- (This was missing/incorrect before)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { companyId: true } // Only select companyId
        });
        if (!user || !user.companyId) {
            // If user somehow has no companyId associated
            throw new Error('Could not determine user company to create project.');
        }
        // --- END FETCH USER ---

        // Create the project using the fetched companyId
        const newProject = await prisma.project.create({
            data: {
                name: projectData.name,
                status: projectData.status,
                address: projectData.address,
                notes: projectData.notes,
                authorId: userId,         // Link to the author
                companyId: user.companyId, // <-- Use the companyId from the user record
                clientId: clientId,       // Link to the client (can be null)
            },
            include: { // Include client data in the response
                client: clientSelection
            }
        });

        logger.info(`Project created: ${newProject.name} for user ${userId} in company ${user.companyId}`);
        return newProject;

    } catch (error) {
        logger.error(`Error creating project for user ${userId}:`, error);
        // Handle potential foreign key error if invalid clientId provided
        if (error.code === 'P2003' && error.meta?.field_name?.includes('clientId')) {
             throw new Error('Invalid Client ID provided.'); // Controller -> 400
        }
        // Throw the generic error for the controller's final catch block
        throw new Error('Could not save project to database.');
    }
};

/**
 * Updates an existing project by its ID. Ownership checked in controller.
 * @param {string} id - The ID of the project to update.
 * @param {object} updateData - An object containing the fields to update, potentially including clientId.
 * @returns {Promise<object|null>} The updated project object including client info, or null if not found.
 */
 const updateProject = async (id, updateData) => {
    try {
        // Prepare data, handle clientId explicitly to allow setting it to null
        const dataToUpdate = { ...updateData };
        if (updateData.hasOwnProperty('clientId')) {
            dataToUpdate.clientId = updateData.clientId || null; // Allow unsetting client
        }
        // Prevent critical fields from being changed via update if necessary
        delete dataToUpdate.id;
        delete dataToUpdate.authorId;
        delete dataToUpdate.companyId;

        const updatedProject = await prisma.project.update({
            where: { id: id },
            data: dataToUpdate,
            include: { // Include client data in the response
                client: clientSelection
            }
        });
        return updatedProject;
    } catch (error) {
         logger.error(`Error updating project ${id} in DB:`, error);
         if (error.code === 'P2025') { // Record not found
             return null;
         }
         if (error.code === 'P2003' && error.meta?.field_name?.includes('clientId')) {
             throw new Error('Invalid Client ID provided for update.'); // Controller -> 400
         }
        throw new Error('Could not update project in database.');
    }
};

/**
 * Deletes a project by its ID. Ownership checked in controller.
 * @param {string} id - The ID of the project to delete.
 * @returns {Promise<boolean>} True if deleted, false if not found.
 */
const deleteProject = async (id) => {
    try {
        await prisma.project.delete({
            where: { id: id },
        });
        return true;
    } catch (error) {
         logger.error(`Error deleting project ${id} from DB:`, error);
         if (error.code === 'P2025') { // Record not found
             return false;
         }
        throw new Error('Could not delete project from database.');
    }
};


// Export the service object
const ProjectService = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};

export default ProjectService;