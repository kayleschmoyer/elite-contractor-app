// backend/src/controllers/projects.controller.js
import ProjectService from '../services/projects.service.js';
import logger from '../utils/logger.js';
import { Role } from '@prisma/client'; // <-- Import Role enum

/**
 * --- MODIFIED: Get projects based on user role ---
 * Admins get all projects for their company.
 * Standard Users get only projects they authored.
 */
const getProjects = async (req, res, next) => {
    try {
        // Get user details from the request object (attached by authMiddleware)
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const companyId = req.user?.companyId;

        // Defensive checks
        if (!userId || !userRole || !companyId) {
            return res.status(401).json({ message: 'Authentication error: User details incomplete.' });
        }

        let projects;
        // Check user role to decide which service function to call
        if (userRole === Role.ADMIN) {
            logger.info(`Admin ${userId} fetching all projects for company ${companyId}`);
            // Call the service function that gets all projects for the company
            projects = await ProjectService.getCompanyProjects(companyId); // Use the function added to the service
        } else { // Assumes any other role (e.g., USER) sees only their own authored projects
            logger.info(`User ${userId} fetching their authored projects for company ${companyId}`);
            // Call the original service function that gets projects by authorId
            projects = await ProjectService.getAllProjects(userId);
        }

        res.status(200).json(projects);

    } catch (error) {
        // Pass errors (e.g., DB errors from service) to the global error handler
        next(error);
    }
};

/**
 * Get a single project by ID, ensuring it belongs to the user's company.
 * (Your previous logic for author check is kept but commented out as 404 is preferred)
 */
const getSingleProject = async (req, res, next) => {
    try {
        const { id: projectId } = req.params;
        const userId = req.user?.userId;
        const companyId = req.user?.companyId; // Get user's company

        if (!userId || !companyId) {
            return res.status(401).json({ message: 'Authentication error: User details incomplete.' });
        }

        const project = await ProjectService.getProjectById(projectId);

        // Check if project exists AND belongs to the user's company
        if (!project || project.companyId !== companyId) {
            logger.warn(`User ${userId} / company ${companyId} failed access attempt for project ${projectId}`);
            // Return 404 Not Found whether it doesn't exist OR belongs to another company
            return res.status(404).json({ message: 'Project not found' });
        }

        // If within the company, allow access (further author check removed here, handled in update/delete)
        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};


/**
 * Create a new project, associating it with the logged-in user and their company.
 * (Function body is same as your provided version)
 */
const createNewProject = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication error: User ID not found.' });
        }
        const projectData = req.body;
        // Service layer now correctly handles companyId association using userId
        const newProject = await ProjectService.createProject(projectData, userId);
        res.status(201).json(newProject);
    } catch (error) {
        if (error.message.includes('Missing required project fields') || error.message.includes('Invalid Client ID') || error.message.includes('Invalid Start Date') || error.message.includes('Invalid End Date')) {
           return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

/**
 * --- MODIFIED: Update an existing project ---
 * Ensures project belongs to user's company.
 * Allows Admins to update any project in the company.
 * Allows Standard Users to update only projects they authored.
 */
const updateExistingProject = async (req, res, next) => {
    try {
         const { id: projectId } = req.params;
         const updateData = req.body;
         const userId = req.user?.userId;
         const companyId = req.user?.companyId;
         const userRole = req.user?.role; // Get role for authorization

         if (!userId || !companyId || !userRole) {
             return res.status(401).json({ message: 'Authentication error: User details incomplete.' });
         }
         if (Object.keys(updateData).length === 0) {
              return res.status(400).json({ message: 'No update data provided.'});
         }

         // Fetch project first to check company scope and ownership
         const project = await ProjectService.getProjectById(projectId);

         // Check 1: Does project exist and belong to the user's company?
         if (!project || project.companyId !== companyId) {
             return res.status(404).json({ message: 'Project not found' });
         }

         // Check 2: Authorization - Is user Admin OR the author of the project?
         if (userRole !== Role.ADMIN && project.authorId !== userId) {
             logger.warn(`User ${userId} attempted unauthorized update on project ${projectId} which they do not own.`);
             // Forbidden, as the project exists in their company but they aren't the author or admin
             return res.status(403).json({ message: 'Forbidden: You can only update your own projects.' });
         }

         // --- Proceed with Update ---
         const updatedProject = await ProjectService.updateProject(projectId, updateData); // Pass only ID and data now

         if (!updatedProject) {
             // This could happen if service returns null (e.g., P2025 error if deleted between checks)
             return res.status(404).json({ message: 'Project not found during update attempt.' });
         }

         res.status(200).json(updatedProject);
    } catch (error) {
         // Handle specific validation errors from service if needed
         if (error.message.includes('Invalid Client ID') || error.message.includes('Invalid Start Date') || error.message.includes('Invalid End Date')) {
            return res.status(400).json({ message: error.message });
         }
        next(error);
    }
};

/**
 * --- MODIFIED: Delete a project ---
 * Ensures project belongs to user's company.
 * Allows Admins to delete any project in the company.
 * Allows Standard Users to delete only projects they authored.
 */
const deleteSingleProject = async (req, res, next) => {
     try {
        const { id: projectId } = req.params;
        const userId = req.user?.userId;
        const companyId = req.user?.companyId;
        const userRole = req.user?.role;

        if (!userId || !companyId || !userRole) {
            return res.status(401).json({ message: 'Authentication error: User details incomplete.' });
        }

        // Fetch project first to check company scope and ownership
        const project = await ProjectService.getProjectById(projectId);
        if (!project || project.companyId !== companyId) { // Check company first
            return res.status(404).json({ message: 'Project not found' });
        }

        // Authorization check: Is user Admin OR the author?
        if (userRole !== Role.ADMIN && project.authorId !== userId) {
            logger.warn(`User ${userId} attempted unauthorized delete on project ${projectId} which they do not own.`);
            return res.status(403).json({ message: 'Forbidden: You can only delete your own projects.' });
        }

        // --- Proceed with Delete ---
        const success = await ProjectService.deleteProject(projectId); // Pass only ID

        if (!success) {
            // Service returns false if not found (e.g., P2025 if deleted between checks)
            return res.status(404).json({ message: 'Project not found or delete failed.' });
        }

        res.status(204).send(); // Success, no content
    } catch (error) {
        next(error);
    }
};


// --- Export Controller Object ---
const ProjectController = {
    getProjects,
    getSingleProject,
    createNewProject,
    updateExistingProject,
    deleteSingleProject
};

export default ProjectController;