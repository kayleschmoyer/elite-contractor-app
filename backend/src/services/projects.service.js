// backend/src/services/projects.service.js
import prisma from '../config/db.js';
import logger from '../utils/logger.js';

// Helper to select client fields to return consistently
const clientSelection = {
    select: { id: true, name: true }
};

/**
 * Gets all projects belonging to a specific user, including linked client name and dates.
 */
const getAllProjects = async (userId) => {
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
 * Gets a single project by its ID, including linked client name and dates.
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
 */
const createProject = async (projectData, userId) => {
    if (!userId) throw new Error('User ID is required to create a project.');
    try {
        if (!projectData.name || !projectData.status) {
            throw new Error('Missing required project fields: name, status');
        }

        const clientId = projectData.clientId || null;

        // Fetch user to get their companyId
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { companyId: true }
        });
        if (!user || !user.companyId) {
            throw new Error('Could not determine user company to create project.');
        }

        // --- Prepare data, handling dates ---
        const dataToCreate = {
            name: projectData.name,
            status: projectData.status,
            address: projectData.address,
            notes: projectData.notes,
            authorId: userId,
            companyId: user.companyId,
            clientId: clientId,
            // Convert date strings to Date objects or null
            startDate: projectData.startDate ? new Date(projectData.startDate) : null,
            endDate: projectData.endDate ? new Date(projectData.endDate) : null,
        };
        // Basic validation: Ensure dates are valid if provided
        if (projectData.startDate && isNaN(dataToCreate.startDate.getTime())) throw new Error("Invalid Start Date provided.");
        if (projectData.endDate && isNaN(dataToCreate.endDate.getTime())) throw new Error("Invalid End Date provided.");
        // --- End Prepare data ---

        const newProject = await prisma.project.create({
            data: dataToCreate,
            include: { client: clientSelection }
        });

        logger.info(`Project created: ${newProject.name} for user ${userId} in company ${user.companyId}`);
        return newProject;

    } catch (error) {
        logger.error(`Error creating project for user ${userId}:`, error);
        if (error instanceof Error && (error.message.includes('required fields') || error.message.includes('Invalid Client ID') || error.message.includes('Invalid Start Date') || error.message.includes('Invalid End Date'))) {
            throw error; // Propagate specific validation errors
        }
        throw new Error('Could not save project to database.');
    }
};

/**
 * Updates an existing project by its ID. Ownership checked in controller. Handles dates.
 */
 const updateProject = async (id, updateData) => {
    try {
        // Prepare data, handle optional fields and dates explicitly
        const dataToUpdate = {};

        // Add fields only if they exist in updateData to allow partial updates
        if (updateData.hasOwnProperty('name')) dataToUpdate.name = updateData.name;
        if (updateData.hasOwnProperty('status')) dataToUpdate.status = updateData.status;
        if (updateData.hasOwnProperty('address')) dataToUpdate.address = updateData.address;
        if (updateData.hasOwnProperty('notes')) dataToUpdate.notes = updateData.notes;

        // Handle clientId update (allow setting to null)
        if (updateData.hasOwnProperty('clientId')) {
            dataToUpdate.clientId = updateData.clientId || null;
        }

        // --- Handle Date Updates (allow setting to null) ---
        if (updateData.hasOwnProperty('startDate')) {
            dataToUpdate.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
            if (updateData.startDate && isNaN(dataToUpdate.startDate.getTime())) throw new Error("Invalid Start Date provided.");
        }
        if (updateData.hasOwnProperty('endDate')) {
            dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
            if (updateData.endDate && isNaN(dataToUpdate.endDate.getTime())) throw new Error("Invalid End Date provided.");
        }
        // --- End Date Updates ---


        // Prevent changing key identifiers
        // delete dataToUpdate.id; // Not needed as it's not typically in updateData
        // delete dataToUpdate.authorId;
        // delete dataToUpdate.companyId;

        // Check if there's anything actually to update
        if (Object.keys(dataToUpdate).length === 0) {
             // If only ID was passed, maybe just fetch and return existing? Or return error?
             // Let's return existing data if nothing else was changed.
            logger.warn(`Update called for project ${id} with no changed data.`);
            return await getProjectById(id); // Need to ensure getProjectById exists and works
        }


        const updatedProject = await prisma.project.update({
            where: { id: id },
            data: dataToUpdate,
            include: { client: clientSelection }
        });
        return updatedProject;
    } catch (error) {
         logger.error(`Error updating project ${id} in DB:`, error);
         if (error.code === 'P2025') { // Record not found
             return null;
         }
         if (error.code === 'P2003' && error.meta?.field_name?.includes('clientId')) {
             throw new Error('Invalid Client ID provided for update.');
         }
         if (error instanceof Error && (error.message.includes('Invalid Start Date') || error.message.includes('Invalid End Date'))) {
             throw error; // Propagate date validation errors
         }
        throw new Error('Could not update project in database.');
    }
};

/**
 * Deletes a project by its ID. Ownership checked in controller.
 */
const deleteProject = async (id) => {
    // ... (deleteProject function remains the same) ...
    try { await prisma.project.delete({ where: { id: id } }); return true; }
    catch (error) { logger.error(`Error deleting project ${id} from DB:`, error); if (error.code === 'P2025') return false; throw new Error('Could not delete project from database.'); }
};


// Export all service functions
const ProjectService = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};

export default ProjectService;