// backend/src/services/projects.service.js
import prisma from '../config/db.js'; // Import the Prisma client instance
import logger from '../utils/logger.js'; // Import logger utility

/**
 * Gets all projects belonging to a specific user.
 * @param {string} userId - The ID of the user whose projects to retrieve.
 * @returns {Promise<Array<object>>} An array of project objects belonging to the user.
 * @throws {Error} If there's an error querying the database.
 */
const getAllProjects = async (userId) => {
    if (!userId) {
        // Should be caught by controller, but good to be defensive
        throw new Error('User ID is required to fetch projects.');
    }
    try {
        const projects = await prisma.project.findMany({
            // Filter projects where the authorId matches the provided userId
            where: {
                authorId: userId
            },
            orderBy: {
                createdAt: 'desc', // Optional: Order projects by creation date, newest first
            }
        });
        return projects;
    } catch (error) {
        logger.error(`Error fetching projects for user ${userId}:`, error);
        // Re-throw a more generic error or handle specific Prisma errors
        throw new Error('Could not retrieve projects from database.');
    }
};

/**
 * Gets a single project by its ID.
 * Note: Ownership check is primarily handled in the controller in this iteration.
 * @param {string} id - The ID of the project to retrieve.
 * @returns {Promise<object|null>} The project object if found, otherwise null.
 * @throws {Error} If there's an error querying the database.
 */
const getProjectById = async (id) => {
     try {
        const project = await prisma.project.findUnique({
            where: { id: id },
            // Ensure necessary fields like authorId are selected if not default
        });
        return project; // Prisma returns null if findUnique doesn't find a record
    } catch (error) {
        logger.error(`Error fetching project by ID ${id}:`, error);
        throw new Error('Could not retrieve project details from database.');
    }
};

/**
 * Creates a new project and associates it with the provided user ID.
 * @param {object} projectData - Data for the new project (e.g., { name, client, status, ...}).
 * @param {string} userId - The ID of the user creating the project.
 * @returns {Promise<object>} The newly created project object.
 * @throws {Error} If validation fails or there's an error saving to the database.
 */
const createProject = async (projectData, userId) => {
    if (!userId) {
        throw new Error('User ID is required to create a project.');
    }
    try {
        // Basic validation example (can be expanded with libraries like Zod/Joi)
        if (!projectData.name || !projectData.client || !projectData.status) {
            // Throwing error here will be caught by the controller's catch block
            throw new Error('Missing required project fields: name, client, status');
        }

        const newProject = await prisma.project.create({
            data: {
                name: projectData.name,
                client: projectData.client,
                status: projectData.status,
                address: projectData.address, // Will be null if not provided
                notes: projectData.notes,     // Will be null if not provided
                // --- Link to the author ---
                authorId: userId
            },
        });
        return newProject;
    } catch (error) {
        logger.error(`Error creating project for user ${userId}:`, error);
        // Handle potential Prisma-specific errors (e.g., unique constraints) if necessary
        // Re-throw a more generic error
        throw new Error('Could not save project to database.');
    }
};

/**
 * Updates an existing project by its ID.
 * Note: Ownership check should be performed in the controller *before* calling this function.
 * @param {string} id - The ID of the project to update.
 * @param {object} updateData - An object containing the fields to update.
 * @returns {Promise<object|null>} The updated project object, or null if the project was not found.
 * @throws {Error} If there's an error updating the database.
 */
 const updateProject = async (id, updateData) => {
    try {
        // Prisma's update throws P2025 error if record to update not found.
        const updatedProject = await prisma.project.update({
            where: { id: id },
            data: updateData, // Only includes fields to be changed
        });
        return updatedProject;
    } catch (error) {
         logger.error(`Error updating project ${id} in DB:`, error);
         // Check for Prisma's specific "Record not found" error
         if (error.code === 'P2025') {
             // 'Record to update not found.' - Service layer indicates not found by returning null.
             return null;
         }
         // Re-throw other database errors
        throw new Error('Could not update project in database.');
    }
};

/**
 * Deletes a project by its ID.
 * Note: Ownership check should be performed in the controller *before* calling this function.
 * @param {string} id - The ID of the project to delete.
 * @returns {Promise<boolean>} True if the project was successfully deleted, false if it was not found.
 * @throws {Error} If there's an error deleting from the database.
 */
const deleteProject = async (id) => {
    try {
        // Prisma's delete throws P2025 error if record to delete not found.
        await prisma.project.delete({
            where: { id: id },
        });
        return true; // Indicate successful deletion
    } catch (error) {
         logger.error(`Error deleting project ${id} from DB:`, error);
         // Check for Prisma's specific "Record not found" error
         if (error.code === 'P2025') {
             // 'Record to delete not found.' - Service layer indicates not found by returning false.
             return false;
         }
         // Re-throw other database errors
        throw new Error('Could not delete project from database.');
    }
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