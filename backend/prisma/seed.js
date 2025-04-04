// backend/prisma/seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log(`Start seeding ...`);

    // Clear existing projects first (optional)
    await prisma.project.deleteMany();
    console.log('Deleted existing projects.');

    // Create seed projects
    const project1 = await prisma.project.create({
        data: {
            name: 'Downtown Highrise HVAC Upgrade',
            client: 'Acme Corp Properties',
            status: 'In Progress',
            address: '123 Main St, Anytown USA',
            notes: 'Phase 1 nearing completion. Need to schedule phase 2 ductwork.',
        },
    });

    const project2 = await prisma.project.create({
        data: {
            name: 'Suburban Office Park Landscaping',
            client: 'GreenScape Inc.',
            status: 'Planning',
            address: '456 Business Blvd, Suburbia',
            notes: 'Awaiting final approval on plant selection. Irrigation plan complete.',
        },
    });

     const project3 = await prisma.project.create({
        data: {
            name: 'Residential Kitchen Remodel - Johnson',
            client: 'Sarah Johnson',
            status: 'Completed',
            address: '789 Home Ave, Anytown USA',
            notes: 'Final payment received. Client happy.',
        },
    });

    console.log(`Created projects:`);
    console.log(project1);
    console.log(project2);
    console.log(project3);

    console.log(`Seeding finished.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect(); // Close the Prisma Client connection
    });