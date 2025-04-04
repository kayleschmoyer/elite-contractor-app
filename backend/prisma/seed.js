// backend/prisma/seed.js
import { PrismaClient, Role } from '@prisma/client'; // Import Role enum
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Define details for your first admin user and their company
// IMPORTANT: Use a strong password and unique email!
const ADMIN_EMAIL = 'bob@abcflooring.example.com'; // Change as needed
const ADMIN_PASSWORD = 'SecurePassword123!'; // Change to a strong password
const ADMIN_NAME = 'Bob The Builder'; // Change as needed
const COMPANY_ID = 'abc_flooring'; // An identifier for Bob's company

async function main() {
    console.log(`Start seeding ...`);

    // Hash the admin password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
    console.log(`Password hashed for ${ADMIN_EMAIL}`);

    // Use upsert to create the admin user only if they don't exist
    const adminUser = await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: {
            // You could potentially update role/companyId here if needed
            // For now, we only update if it exists, but don't change anything
        },
        create: {
            email: ADMIN_EMAIL,
            password: hashedPassword,
            name: ADMIN_NAME,
            role: Role.ADMIN, // Assign the ADMIN role
            companyId: COMPANY_ID, // Assign the company ID
        },
    });

    console.log(`Admin user created/ensured: ${adminUser.email} (ID: ${adminUser.id}) with Role: ${adminUser.role} and Company ID: ${adminUser.companyId}`);

    // --- Seed Projects (Optional - Update to link to Admin/Company) ---
    // If you deleted projects earlier, you might want to re-add some linked to the admin/company

    // Example: Delete previous projects first if re-seeding projects
    // await prisma.project.deleteMany({ where: { companyId: COMPANY_ID }});

    // const project1 = await prisma.project.create({
    //     data: {
    //         name: 'Downtown Highrise HVAC Upgrade - ABC Flooring',
    //         client: 'Acme Corp Properties',
    //         status: 'In Progress',
    //         address: '123 Main St, Anytown USA',
    //         notes: 'Phase 1 nearing completion.',
    //         companyId: COMPANY_ID, // Link project to company
    //         authorId: adminUser.id // Link project to the admin user
    //     }
    // });
    // console.log(`Created project: ${project1.name}`);

    console.log(`Seeding finished.`);
}

main()
    .catch((e) => {
        console.error("Seeding Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });