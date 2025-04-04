// backend/src/services/projects.service.js
import ProjectModel from '../models/project.model.js';
import logger from '../utils/logger.js';

const getAllProjects = async () => {
    try {
        // Business logic could go here (e.g., filtering based on user roles)
        const projects = await ProjectModel.findAll();
        return projects;
    } catch (error) {
        logger.error('Error fetching projects:', error);
        // You might want specific error types here
        throw new Error('Could not retrieve projects');
    }
};

const getProjectById = async (id) => {
     try {
        const project = await ProjectModel.findById(id);
        // Business logic: Check if user has permission to view this project?
        if (!project) {
            return null; // Service indicates not found
        }
        return project;
    } catch (error) {
        logger.error(`Error fetching project ${id}:`, error);
        throw new Error('Could not retrieve project');
    }
};

// --- Add Services for Create, Update, Delete ---
const createProject = async (projectData) => {
    try {
        // Add validation logic here (e.g., using a library like Zod or Joi)
        // Ensure required fields are present, data types are correct, etc.
        // Example basic check:
        if (!projectData.name || !projectData.client || !projectData.status) {
            throw new Error('Missing required project fields: name, client, status');
        }

        const newProject = await ProjectModel.create(projectData);
        return newProject;
    } catch (error) {
        logger.error('Error creating project:', error);
        // Re-throw validation errors or database errors appropriately
        throw error; // Let controller handle specific error types if needed
    }
};

 const updateProject = async (id, updateData) => {
    try {
        // Add validation for update data
        const updatedProject = await ProjectModel.update(id, updateData);
        return updatedProject;
    } catch (error) {
         logger.error(`Error updating project ${id}:`, error);
         // Handle specific Prisma errors (e.g., P2025 Record not found)
         if (error.code === 'P2025') {
             return null; // Indicate not found for update
         }
        throw new Error('Could not update project');
    }
};

const deleteProject = async (id) => {
    try {
        await ProjectModel.remove(id);
        // No return value needed on successful delete usually
        return true; // Indicate success
    } catch (error) {
         logger.error(`Error deleting project ${id}:`, error);
         if (error.code === 'P2025') {
             return false; // Indicate not found for delete
         }
        throw new Error('Could not delete project');
    }
};


const ProjectService = {
    getAllProjects,
    getProjectById,
    createProject, // Add new service functions
    updateProject,
    deleteProject
};

export default ProjectService;