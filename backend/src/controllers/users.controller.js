// backend/src/controllers/users.controller.js
import UserService from '../services/users.service.js';
import logger from '../utils/logger.js';

/**
 * Controller to handle creation of a new user by an Admin.
 */
const createUser = async (req, res, next) => {
    // ... (createUser function remains the same) ...
    try { const adminUser = req.user; const newUserData = req.body; if (!newUserData.email || !newUserData.password) return res.status(400).json({ message: 'Email and password are required.' }); const createdUser = await UserService.createUserByAdmin(newUserData, adminUser); res.status(201).json(createdUser); }
    catch (error) { if (error.message === 'Email already in use.') return res.status(409).json({ message: error.message }); next(error); }
};

/**
 * Controller to get all users within the admin's company.
 */
const getCompanyUsers = async (req, res, next) => {
    // ... (getCompanyUsers function remains the same) ...
    try { const adminUser = req.user; if (!adminUser?.companyId) return res.status(401).json({ message: 'Auth error: User company not found.' }); const users = await UserService.getUsersByCompany(adminUser.companyId); res.status(200).json(users); }
    catch (error) { next(error); }
};

// --- NEW: Controller to handle updating a user by Admin ---
const updateUser = async (req, res, next) => {
    try {
        const { id: userIdToUpdate } = req.params; // Get ID from URL param
        const updateData = req.body;
        const adminCompanyId = req.user?.companyId;
        const adminUserId = req.user?.userId; // Needed for self-update check potentially

        // Basic checks
        if (!adminCompanyId) return res.status(401).json({ message: 'Auth error: Admin company missing.' });
        if (Object.keys(updateData).length === 0) return res.status(400).json({ message: 'No update data provided.'});
        // Optional: Prevent admin from changing their own role via this endpoint?
        // if (userIdToUpdate === adminUserId && updateData.hasOwnProperty('role')) {
        //    return res.status(403).json({ message: 'Admins cannot change their own role here.' });
        // }

        const updatedUser = await UserService.updateUserByAdmin(userIdToUpdate, updateData, adminCompanyId);

        if (!updatedUser) {
            // Service returns null if not found or wrong company
            return res.status(404).json({ message: 'User not found or not in your company.' });
        }

        res.status(200).json(updatedUser); // Return updated user (safe fields only)

    } catch (error) {
         // Handle validation errors from service (e.g., bad password, invalid role)
         if (error.message.includes('Password must be') || error.message.includes('Invalid role')) {
             return res.status(400).json({ message: error.message });
         }
        next(error);
    }
};


// --- NEW: Controller to handle deleting a user by Admin ---
const deleteUser = async (req, res, next) => {
     try {
        const { id: userIdToDelete } = req.params; // Get ID from URL param
        const adminCompanyId = req.user?.companyId;
        const adminUserId = req.user?.userId; // Get admin's own ID

        if (!adminCompanyId || !adminUserId) return res.status(401).json({ message: 'Auth error: Admin details missing.' });

        const success = await UserService.deleteUserByAdmin(userIdToDelete, adminCompanyId, adminUserId);

        if (!success) {
            // Service returns false if not found, wrong company
            return res.status(404).json({ message: 'User not found or not in your company.' });
        }

        res.status(204).send(); // Success, no content

    } catch (error) {
        // Handle specific errors like self-deletion attempt
         if (error.message.includes('cannot delete their own account')) {
             return res.status(403).json({ message: error.message }); // Forbidden
         }
        next(error);
    }
};


// Export all controller functions
const UserController = {
    createUser,
    getCompanyUsers,
    updateUser,   // <-- Add new
    deleteUser,   // <-- Add new
};

export default UserController;