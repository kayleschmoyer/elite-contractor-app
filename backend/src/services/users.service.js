// backend/src/services/users.service.js
import prisma from '../config/db.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client'; // Import Role enum

const SALT_ROUNDS = 10; // Same as in auth.service

/**
 * Creates a new user within a specific company by an admin.
 * @param {object} newUserData - Data for the new user { email, password, name?, role? }
 * @param {object} adminUser - The authenticated admin user object { userId, companyId, role, ... }
 * @returns {Promise<object>} The created user object (excluding password).
 * @throws {Error} If email exists, validation fails, or DB error.
 */
const createUserByAdmin = async (newUserData, adminUser) => {
    const { email, password, name } = newUserData;
    // Default to USER role if not specified, or use specified role
    const role = newUserData.role && Object.values(Role).includes(newUserData.role)
               ? newUserData.role
               : Role.USER;

    // Use the admin's company ID for the new user
    const companyId = adminUser.companyId;

    if (!email || !password || !companyId) {
        throw new Error('Missing required fields: email, password, or admin companyId.');
    }

    // Check if email already exists (globally or within company? For now, global)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('Email already in use.'); // Will be caught by controller -> 409
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    try {
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role, // Assign role (defaults to USER if not provided/invalid)
                companyId: companyId, // Assign admin's company ID
            },
            select: { // Select fields to return
                id: true, email: true, name: true, role: true, companyId: true, createdAt: true
            }
        });
        logger.info(`Admin ${adminUser.email} created user ${newUser.email} in company ${companyId}`);
        return newUser;
    } catch (error) {
        logger.error(`Error creating user by admin ${adminUser.email}:`, error);
        throw new Error('Database error during user creation.'); // Controller -> 500
    }
};

/**
 * Gets all users belonging to a specific company.
 * @param {string} companyId - The ID of the company.
 * @returns {Promise<Array<object>>} Array of user objects (excluding passwords).
 * @throws {Error} If database error occurs.
 */
const getUsersByCompany = async (companyId) => {
    if (!companyId) {
        throw new Error('Company ID is required to fetch users.');
    }
    try {
        const users = await prisma.user.findMany({
            where: { companyId: companyId },
            select: { // Exclude password!
                id: true, email: true, name: true, role: true, companyId: true, createdAt: true, updatedAt: true
            },
            orderBy: { createdAt: 'asc' }
        });
        return users;
    } catch (error) {
        logger.error(`Error fetching users for company ${companyId}:`, error);
        throw new Error('Could not retrieve users from database.');
    }
};


const UserService = {
    createUserByAdmin,
    getUsersByCompany,
    // Add functions for updating/deleting users by admin later
};

export default UserService;