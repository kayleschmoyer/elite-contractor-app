// backend/src/models/project.model.js
import prisma from '../config/db.js'; // Import the Prisma client instance

// NOTE: With Prisma, the 'model' file often becomes much simpler,
// as the core logic resides in Prisma Client generated from your schema.
// We often put the direct Prisma calls in the 'service' layer instead.
// However, if you want to keep a dedicated model file for potential
// complex queries or data shaping later, you can do it like this:

const findAll = async () => {
    return await prisma.project.findMany({
        orderBy: { // Optional: Order by creation date
            createdAt: 'desc',
        }
    });
};

const findById = async (id) => {
    return await prisma.project.findUnique({
        where: { id: id },
    });
};

const create = async (projectData) => {
    // Add validation or data transformation here if needed before saving
    return await prisma.project.create({
        data: projectData, // e.g., { name: 'New Roof', client: 'Bob', status: 'Lead' }
    });
};

const update = async (id, updateData) => {
    return await prisma.project.update({
        where: { id: id },
        data: updateData,
    });
};

const remove = async (id) => {
    return await prisma.project.delete({
        where: { id: id },
    });
};


const ProjectModel = {
    findAll,
    findById,
    create, // Add new functions
    update,
    remove
};

export default ProjectModel;