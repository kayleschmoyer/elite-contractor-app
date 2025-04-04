// backend/src/controllers/projects.controller.js
import ProjectService from '../services/projects.service.js';

const getProjects = async (req, res, next) => {
    try {
        const projects = await ProjectService.getAllProjects();
        res.status(200).json(projects);
    } catch (error) {
        next(error); // Pass error to the error handling middleware
    }
};

const getSingleProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await ProjectService.getProjectById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};

// Add controllers for create, update, delete later

const ProjectController = {
    getProjects,
    getSingleProject,
};

export default ProjectController;