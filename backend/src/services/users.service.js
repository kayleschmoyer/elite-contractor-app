// backend/src/services/users.service.js
import prisma from '../config/db.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt'; // <-- Import bcrypt
import { Role } from '@prisma/client';

const SALT_ROUNDS = 10;

// Helper for selecting user fields (exclude password)
const userSelection = {
    id: true, email: true, name: true, role: true, companyId: true, createdAt: true, updatedAt: true
};

/**
 * Creates a new user within a specific company by an admin.
 * @param {object} newUserData - { email, password, name?, role? }
 * @param {object} adminUser - { userId, companyId, role, ... }
 * @returns {Promise<object>} The created user object (excluding password).
 */
const createUserByAdmin = async (newUserData, adminUser) => {
    // ... (createUserByAdmin function remains the same as previous version) ...
    const { email, password, name } = newUserData;
    const role = newUserData.role && Object.values(Role).includes(newUserData.role) ? newUserData.role : Role.USER;
    const companyId = adminUser.companyId;
    if (!email || !password || !companyId) throw new Error('Missing fields: email, password, or admin companyId.');
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email already in use.');
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    try {
        const newUser = await prisma.user.create({
            data: { email, password: hashedPassword, name, role: role, companyId: companyId },
            select: userSelection // Use the selection helper
        });
        logger.info(`Admin ${adminUser.email} created user ${newUser.email} in company ${companyId}`);
        return newUser;
    } catch (error) { /* ... error handling ... */
        logger.error(`Error creating user by admin ${adminUser.email}:`, error);
        throw new Error('Database error during user creation.');
    }
};

/**
 * Gets all users belonging to a specific company.
 * @param {string} companyId - The ID of the company.
 * @returns {Promise<Array<object>>} Array of user objects (excluding passwords).
 */
const getUsersByCompany = async (companyId) => {
    // ... (getUsersByCompany function remains the same as previous version) ...
    if (!companyId) throw new Error('Company ID is required.');
    try {
        const users = await prisma.user.findMany({
            where: { companyId: companyId },
            select: userSelection, // Use the selection helper
            orderBy: { createdAt: 'asc' }
        });
        return users;
    } catch (error) { /* ... error handling ... */
        logger.error(`Error fetching users for company ${companyId}:`, error);
        throw new Error('Could not retrieve users from database.');
    }
};

/**
 * Updates a user within the same company, by an admin.
 * @param {string} userIdToUpdate - The ID of the user to update.
 * @param {object} updateData - Data to update { name?, password?, role? }.
 * @param {string} adminCompanyId - The company ID of the admin performing the action.
 * @returns {Promise<object|null>} The updated user object (excluding password), or null if not found/authorized.
 */
const updateUserByAdmin = async (userIdToUpdate, updateData, adminCompanyId) => {
    if (!userIdToUpdate || !adminCompanyId) {
        throw new Error('User ID and Admin Company ID are required.');
    }

    try {
        // 1. Fetch the user to be updated
        const userToUpdate = await prisma.user.findUnique({
            where: { id: userIdToUpdate }
        });

        // 2. Check if user exists and belongs to the admin's company
        if (!userToUpdate || userToUpdate.companyId !== adminCompanyId) {
            logger.warn(`Admin from company ${adminCompanyId} failed update attempt on user ${userIdToUpdate} (not found or wrong company).`);
            return null; // Not found or not authorized
        }

        // 3. Prepare data, hashing password if provided
        const data = { ...updateData };
        // Remove fields that shouldn't be directly updatable this way
        delete data.id;
        delete data.email; // Generally don't allow email changes easily
        delete data.companyId;
        delete data.createdAt;

        // Hash password if included in updateData
        if (data.password) {
            if (data.password.length < 8) { // Example validation
                throw new Error("Password must be at least 8 characters long.");
            }
            data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
             logger.info(`Updating password for user ${userIdToUpdate}`);
        } else {
            delete data.password; // Ensure password isn't set to null/undefined if not provided
        }

        // Validate role if provided
        if (data.role && !Object.values(Role).includes(data.role)) {
             throw new Error(`Invalid role specified: ${data.role}`);
        }

        // 4. Perform the update
        const updatedUser = await prisma.user.update({
            where: { id: userIdToUpdate },
            data: data,
            select: userSelection // Return safe fields
        });

        logger.info(`User ${userIdToUpdate} updated by admin from company ${adminCompanyId}.`);
        return updatedUser;

    } catch (error) {
        logger.error(`Error updating user ${userIdToUpdate} by admin from company ${adminCompanyId}:`, error);
         if (error instanceof Error && (error.message.includes('Password must be') || error.message.includes('Invalid role'))) {
             throw error; // Propagate validation errors
         }
         if (error.code === 'P2025') return null; // Record to update not found (e.g., deleted between check and update)
        throw new Error('Database error during user update.');
    }
};

/**
 * Deletes a user within the same company, by an admin. Prevents self-deletion.
 * @param {string} userIdToDelete - The ID of the user to delete.
 * @param {string} adminCompanyId - The company ID of the admin performing the action.
 * @param {string} adminUserId - The ID of the admin performing the action (to prevent self-deletion).
 * @returns {Promise<boolean>} True if deleted successfully, false if not found/authorized/self.
 */
const deleteUserByAdmin = async (userIdToDelete, adminCompanyId, adminUserId) => {
     if (!userIdToDelete || !adminCompanyId || !adminUserId) {
        throw new Error('User ID to delete, Admin Company ID, and Admin User ID are required.');
    }

    // Prevent self-deletion
    if (userIdToDelete === adminUserId) {
         logger.warn(`Admin ${adminUserId} attempted self-deletion.`);
        throw new Error("Administrators cannot delete their own account."); // Controller -> 400/403
    }

    try {
        // 1. Fetch the user to be deleted
        const userToDelete = await prisma.user.findUnique({
             where: { id: userIdToDelete }
        });

        // 2. Check if user exists and belongs to the admin's company
        if (!userToDelete || userToDelete.companyId !== adminCompanyId) {
             logger.warn(`Admin ${adminUserId} failed delete attempt on user ${userIdToDelete} (not found or wrong company ${adminCompanyId}).`);
            return false; // Not found or not authorized
        }

        // 3. Perform the delete
        // Consider related data: deleting user might fail if tasks/projects have FK constraints
        // that aren't handled by onDelete: SetNull / Cascade in schema.
        // Prisma's SetNull on Task assignee and Project author should handle this.
        await prisma.user.delete({
            where: { id: userIdToDelete },
        });

        logger.info(`User ${userIdToDelete} deleted by admin ${adminUserId} from company ${adminCompanyId}.`);
        return true;

    } catch (error) {
         logger.error(`Error deleting user ${userIdToDelete} by admin ${adminUserId}:`, error);
         if (error.code === 'P2025') return false; // Record to delete not found
         // Handle other potential errors (like FK issues if schema isn't set up for cascades/set null)
        throw new Error('Database error during user deletion.');
    }
};


// Export all service functions
const UserService = {
    createUserByAdmin,
    getUsersByCompany,
    updateUserByAdmin, // <-- Add new
    deleteUserByAdmin, // <-- Add new
};

export default UserService;