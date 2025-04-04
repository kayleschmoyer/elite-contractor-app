// backend/src/controllers/projects.controller.js
import ProjectService from '../services/projects.service.js';
import logger from '../utils/logger.js';

/**
 * Get all projects belonging to the currently authenticated user.
 */
const getProjects = async (req, res, next) => {
    try {
        // Get user ID from the request object (attached by authMiddleware)
        const userId = req.user?.userId;
        if (!userId) {
            // Should be caught by authMiddleware, but defensively check
            return res.status(401).json({ message: 'Authentication error: User ID not found.' });
        }

        // Pass the userId to the service function to filter projects
        const projects = await ProjectService.getAllProjects(userId);
        res.status(200).json(projects);
    } catch (error) {
        // Pass errors to the global error handler
        next(error);
    }
};

/**
 * Get a single project by ID, ensuring the logged-in user owns it.
 */
const getSingleProject = async (req, res, next) => {
    try {
        const { id: projectId } = req.params; // Rename id to projectId for clarity
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication error: User ID not found.' });
        }

        // Fetch the project using the service
        const project = await ProjectService.getProjectById(projectId);

        // Check if the project exists
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // --- Ownership Check ---
        if (project.authorId !== userId) {
            logger.warn(`User ${userId} attempted unauthorized access to project ${projectId} owned by ${project.authorId}`);
            // Return 404 to mask project existence from unauthorized users
            return res.status(404).json({ message: 'Project not found' });
            // Alternatively, return 403 Forbidden if you don't mind revealing existence:
            // return res.status(403).json({ message: 'Forbidden: You do not have permission to access this project.' });
        }

        // If ownership is verified, return the project
        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};


/**
 * Create a new project, associating it with the logged-in user.
 */
const createNewProject = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication error: User ID not found.' });
        }

        // Pass both the project data from the request body AND the userId to the service
        const projectData = req.body;
        const newProject = await ProjectService.createProject(projectData, userId);

        res.status(201).json(newProject);
    } catch (error) {
        // Handle potential validation errors from the service specifically
        if (error.message.includes('Missing required project fields')) {
           return res.status(400).json({ message: error.message });
        }
        // Handle other specific errors if needed (e.g., Prisma unique constraint errors)
        // Pass generic errors to the global handler
        next(error);
    }
};

/**
 * Update an existing project, ensuring the logged-in user owns it.
 */
const updateExistingProject = async (req, res, next) => {
    try {
         const { id: projectId } = req.params;
         const userId = req.user?.userId;
         if (!userId) {
            return res.status(401).json({ message: 'Authentication error: User ID not found.' });
         }

         // --- Ownership Check (fetch before update) ---
         // It's often better to check ownership before attempting the update
         const project = await ProjectService.getProjectById(projectId);
         if (!project) {
             return res.status(404).json({ message: 'Project not found' });
         }
         if (project.authorId !== userId) {
             logger.warn(`User ${userId} attempted unauthorized update on project ${projectId} owned by ${project.authorId}`);
             return res.status(404).json({ message: 'Project not found' }); // Mask existence, or 403 Forbidden
         }

         // --- Proceed with Update ---
         // If ownership is verified, call the update service
         const updatedProject = await ProjectService.updateProject(projectId, req.body);

         // The service might return null if the update failed (e.g., Prisma P2025)
         // though the initial check should prevent this specific case.
         if (!updatedProject) {
             // This might indicate a race condition or other issue if the project disappeared
             // between the check and the update attempt.
             return res.status(404).json({ message: 'Project not found during update attempt.' });
         }

         res.status(200).json(updatedProject);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a project, ensuring the logged-in user owns it.
 */
const deleteSingleProject = async (req, res, next) => {
    try {
        const { id: projectId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
           return res.status(401).json({ message: 'Authentication error: User ID not found.' });
        }

        // --- Ownership Check (fetch before delete) ---
        const project = await ProjectService.getProjectById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.authorId !== userId) {
             logger.warn(`User ${userId} attempted unauthorized delete on project ${projectId} owned by ${project.authorId}`);
            return res.status(404).json({ message: 'Project not found' }); // Mask existence, or 403 Forbidden
        }

        // --- Proceed with Delete ---
        // If ownership is verified, call the delete service
        const success = await ProjectService.deleteProject(projectId);

        // Check if the service indicated success
        if (!success) {
            // This might occur if the service failed after the check for some reason,
            // or if the service layer handles the 'not found' case by returning false.
            return res.status(404).json({ message: 'Project not found or delete failed.' });
        }

        // Standard success response for DELETE is 204 No Content
        res.status(204).send();
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