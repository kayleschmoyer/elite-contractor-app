// backend/src/controllers/projects.controller.js
import ProjectService from '../services/projects.service.js';

const getProjects = async (req, res, next) => {
    try {
        const projects = await ProjectService.getAllProjects();
        res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
};

const getSingleProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await ProjectService.getProjectById(id);
        if (!project) {
            // Consistent 'not found' response
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};

// --- Add Controllers for Create, Update, Delete ---
const createNewProject = async (req, res, next) => {
    try {
        // req.body contains the JSON payload from the frontend
        const newProject = await ProjectService.createProject(req.body);
        // Return 201 Created status code for new resources
        res.status(201).json(newProject);
    } catch (error) {
        // Handle validation errors specifically if thrown by the service
        if (error.message.includes('Missing required project fields')) {
           return res.status(400).json({ message: error.message }); // Bad Request
        }
        next(error); // Pass other errors to generic handler
    }
};

const updateExistingProject = async (req, res, next) => {
    try {
         const { id } = req.params;
         const updatedProject = await ProjectService.updateProject(id, req.body);
         if (!updatedProject) {
             return res.status(404).json({ message: 'Project not found' });
         }
         res.status(200).json(updatedProject);
    } catch (error) {
        next(error);
    }
};

const deleteSingleProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const success = await ProjectService.deleteProject(id);
         if (!success) {
             return res.status(404).json({ message: 'Project not found' });
         }
         // Return 204 No Content on successful deletion
         res.status(204).send();
    } catch (error) {
        next(error);
    }
};


const ProjectController = {
    getProjects,
    getSingleProject,
    createNewProject,     // Add new controller functions
    updateExistingProject,
    deleteSingleProject
};

export default ProjectController;