// backend/src/services/projects.service.js
import prisma from '../config/db.js';
import logger from '../utils/logger.js';

// Helper to select client fields to return consistently
const clientSelection = {
    select: { id: true, name: true }
};

/**
 * Gets all projects AUTHORED BY a specific user.
 * Includes linked client name and dates.
 * (This is the version kept from your provided code)
 * @param {string} userId - The ID of the user whose authored projects to retrieve.
 * @returns {Promise<Array<object>>}
 */
const getAllProjects = async (userId) => { // This specifically gets by authorId
    if (!userId) throw new Error('User ID is required to fetch projects.');
    try {
        const projects = await prisma.project.findMany({
            where: { authorId: userId },
            include: { client: clientSelection },
            orderBy: { createdAt: 'desc' }
            // startDate and endDate are included by default
        });
        return projects;
    } catch (error) {
        logger.error(`Error fetching projects for user ${userId}:`, error);
        throw new Error('Could not retrieve projects from database.');
    }
};

/**
 * --- NEW: Gets ALL projects belonging to a specific company. ---
 * Includes linked client name and dates.
 * Used for Admin users.
 * @param {string} companyId - The ID of the company whose projects to retrieve.
 * @returns {Promise<Array<object>>}
 */
const getCompanyProjects = async (companyId) => {
    if (!companyId) throw new Error('Company ID is required to fetch company projects.');
    try {
        const projects = await prisma.project.findMany({
            where: { companyId: companyId }, // Filter by company
            include: { client: clientSelection }, // Include client info
            orderBy: { createdAt: 'desc' } // Order as desired
             // startDate and endDate included by default
        });
        return projects;
    } catch (error) {
        logger.error(`Error fetching projects for company ${companyId}:`, error);
        throw new Error('Could not retrieve company projects from database.');
    }
};


/**
 * Gets a single project by its ID, including linked client name and dates.
 * (This is the version kept from your provided code)
 */
const getProjectById = async (id) => {
     try {
        const project = await prisma.project.findUnique({
            where: { id: id },
            include: { client: clientSelection }
            // startDate and endDate are included by default
        });
        return project;
    } catch (error) {
        logger.error(`Error fetching project by ID ${id}:`, error);
        throw new Error('Could not retrieve project details from database.');
    }
};

/**
 * Creates a new project linked to a user and potentially a client, including dates.
 * (This is the version kept from your provided code)
 */
const createProject = async (projectData, userId) => {
    if (!userId) throw new Error('User ID is required to create a project.');
    try {
        if (!projectData.name || !projectData.status) {
            throw new Error('Missing required project fields: name, status');
        }
        const clientId = projectData.clientId || null;
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
        if (!user || !user.companyId) throw new Error('Could not determine user company to create project.');
        const dataToCreate = {
            name: projectData.name, status: projectData.status, address: projectData.address,
            notes: projectData.notes, authorId: userId, companyId: user.companyId, clientId: clientId,
            startDate: projectData.startDate ? new Date(projectData.startDate) : null,
            endDate: projectData.endDate ? new Date(projectData.endDate) : null,
        };
        if (projectData.startDate && isNaN(dataToCreate.startDate.getTime())) throw new Error("Invalid Start Date provided.");
        if (projectData.endDate && isNaN(dataToCreate.endDate.getTime())) throw new Error("Invalid End Date provided.");
        const newProject = await prisma.project.create({ data: dataToCreate, include: { client: clientSelection } });
        logger.info(`Project created: ${newProject.name} for user ${userId} in company ${user.companyId}`);
        return newProject;
    } catch (error) {
        logger.error(`Error creating project for user ${userId}:`, error);
        if (error instanceof Error && (error.message.includes('required fields') || error.message.includes('Invalid Client ID') || error.message.includes('Invalid Start Date') || error.message.includes('Invalid End Date'))) { throw error; }
        // Handle Prisma specific errors if needed, e.g. P2003 for bad foreign key
        throw new Error('Could not save project to database.');
    }
};

/**
 * Updates an existing project by its ID. Ownership checked in controller. Handles dates.
 * (This is the version kept from your provided code)
 */
 const updateProject = async (id, updateData) => {
    try {
        const dataToUpdate = {};
        if (updateData.hasOwnProperty('name')) dataToUpdate.name = updateData.name;
        if (updateData.hasOwnProperty('status')) dataToUpdate.status = updateData.status;
        if (updateData.hasOwnProperty('address')) dataToUpdate.address = updateData.address;
        if (updateData.hasOwnProperty('notes')) dataToUpdate.notes = updateData.notes || null; // Allow unsetting notes
        if (updateData.hasOwnProperty('clientId')) dataToUpdate.clientId = updateData.clientId || null;
        if (updateData.hasOwnProperty('startDate')) { dataToUpdate.startDate = updateData.startDate ? new Date(updateData.startDate) : null; if (updateData.startDate && isNaN(dataToUpdate.startDate.getTime())) throw new Error("Invalid Start Date."); }
        if (updateData.hasOwnProperty('endDate')) { dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null; if (updateData.endDate && isNaN(dataToUpdate.endDate.getTime())) throw new Error("Invalid End Date."); }

        if (Object.keys(dataToUpdate).length === 0) {
            logger.warn(`Update called for project ${id} with no changed data.`);
            const existingProject = await getProjectById(id); // Fetch current data if nothing to update
            if (!existingProject) throw new Error('Project not found for no-op update.'); // Should ideally be caught by controller check first
            return existingProject; // Return existing data
        }

        const updatedProject = await prisma.project.update({
            where: { id: id },
            data: dataToUpdate,
            include: { client: clientSelection }
        });
        return updatedProject;
    } catch (error) {
        logger.error(`Error updating project ${id} in DB:`, error);
        if (error.code === 'P2025') { return null; } // Record not found
        if (error.code === 'P2003' && error.meta?.field_name?.includes('clientId')) { throw new Error('Invalid Client ID provided for update.'); }
        if (error instanceof Error && (error.message.includes('Invalid Start Date') || error.message.includes('Invalid End Date'))) { throw error; }
        throw new Error('Could not update project in database.');
    }
};

/**
 * Deletes a project by its ID. Ownership checked in controller.
 * (This is the version kept from your provided code)
 */
const deleteProject = async (id) => {
    try {
        await prisma.project.delete({ where: { id: id } });
        return true;
    } catch (error) {
        logger.error(`Error deleting project ${id} from DB:`, error);
        if (error.code === 'P2025') return false; // Record not found
        throw new Error('Could not delete project from database.');
    }
};


// Export all service functions including the new one
const ProjectService = {
    getAllProjects,      // Gets projects by Author ID (for standard users)
    getCompanyProjects,  // <-- ADDED THIS: Gets all projects for a Company ID (for admins)
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};

export default ProjectService;