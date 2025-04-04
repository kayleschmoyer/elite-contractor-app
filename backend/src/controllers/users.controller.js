// backend/src/controllers/users.controller.js
import UserService from '../services/users.service.js';
import logger from '../utils/logger.js';

/**
 * Controller to handle creation of a new user by an Admin.
 */
const createUser = async (req, res, next) => {
    try {
        const adminUser = req.user; // User object attached by authMiddleware
        const newUserData = req.body;

        // Basic validation (use Joi/Zod for more complex rules)
        if (!newUserData.email || !newUserData.password) {
             return res.status(400).json({ message: 'Email and password are required.' });
        }
        // Add password strength validation here maybe

        const createdUser = await UserService.createUserByAdmin(newUserData, adminUser);
        res.status(201).json(createdUser);

    } catch (error) {
        if (error.message === 'Email already in use.') {
            return res.status(409).json({ message: error.message }); // 409 Conflict
        }
        // Pass other errors (like validation, DB errors) to global handler
        next(error);
    }
};

/**
 * Controller to get all users within the admin's company.
 */
const getCompanyUsers = async (req, res, next) => {
    try {
        const adminUser = req.user;
        if (!adminUser?.companyId) {
             // Should not happen if auth middleware works correctly
             logger.error(`Admin user ${adminUser?.userId} missing companyId in getCompanyUsers`);
             return res.status(401).json({ message: 'Authentication error: User company not found.' });
        }

        const users = await UserService.getUsersByCompany(adminUser.companyId);
        res.status(200).json(users);

    } catch (error) {
        next(error);
    }
};

const UserController = {
    createUser,
    getCompanyUsers,
    // Add controllers for updating/deleting users later
};

export default UserController;