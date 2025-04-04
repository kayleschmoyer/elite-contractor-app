// backend/src/models/project.model.js
// This is a placeholder. Replace with actual database model (e.g., using Mongoose, Sequelize, Prisma)
const projects = [
    { id: '1', name: 'Kitchen Remodel', client: 'John Doe', status: 'Planning' },
    { id: '2', name: 'Bathroom Addition', client: 'Jane Smith', status: 'In Progress' },
];

// Simulate async database operations
const findAll = async () => Promise.resolve(projects);
const findById = async (id) => Promise.resolve(projects.find(p => p.id === id));
// Add functions for create, update, delete later

const ProjectModel = {
    findAll,
    findById,
};

export default ProjectModel;