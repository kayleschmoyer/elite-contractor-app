// backend/src/services/projects.service.js
import ProjectModel from '../models/project.model.js';
import logger from '../utils/logger.js';

const getAllProjects = async () => {
    try {
        // Add business logic here if needed (validation, transformation)
        const projects = await ProjectModel.findAll();
        return projects;
    } catch (error) {
        logger.error('Error fetching projects:', error);
        throw new Error('Could not retrieve projects'); // Or a more specific error
    }
};

const getProjectById = async (id) => {
     try {
        const project = await ProjectModel.findById(id);
        if (!project) {
            return null; // Or throw a NotFoundError
        }
        return project;
    } catch (error) {
        logger.error(`Error fetching project ${id}:`, error);
        throw new Error('Could not retrieve project');
    }
};

// Add services for create, update, delete later

const ProjectService = {
    getAllProjects,
    getProjectById,
};

export default ProjectService;