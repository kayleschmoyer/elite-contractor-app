// backend/src/services/auth.service.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js'; // Prisma Client instance
import config from '../config/index.js'; // App configuration (for JWT secret/expiresIn)
import logger from '../utils/logger.js'; // Logger utility

const SALT_ROUNDS = 10; // Cost factor for bcrypt password hashing

/**
 * Registers a new user. (Currently not used for public registration based on requirements).
 * Might be adapted later for an admin creating users.
 * @param {object} userData - User data { email, password, name?, role?, companyId? }
 * @returns {Promise<object>} The created user object (without password hash).
 * @throws {Error} If email already exists or other database error occurs.
 */
const registerUser = async (userData) => {
    // Destructure required and optional fields
    const { email, password, name, role, companyId } = userData;

    // Basic validation (controller should handle more robust checks)
    if (!email || !password) {
        throw new Error('Email and password are required for registration.');
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        // Throw an error that the controller can catch and return a 409 status
        throw new Error('Email already in use.');
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Create the user in the database
    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                // Use provided role/companyId or defaults from schema if not provided
                // Schema defaults role to USER if not specified here
                role: role, // e.g., could be passed by an admin creating a user
                companyId: companyId, // e.g., admin's companyId when creating a user
            },
            // Select only the fields that are safe/needed to return
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                companyId: true,
                createdAt: true
            }
        });
        logger.info(`User registered successfully: ${user.email}`);
        return user;
    } catch (error) {
        logger.error('Error creating user in DB:', error);
        // Throw a generic error or handle specific Prisma errors
        throw new Error('Could not register user due to a database error.');
    }
};

/**
 * Logs in a user and returns a JWT.
 * @param {object} credentials - User credentials { email, password }
 * @returns {Promise<string>} JWT token if login is successful.
 * @throws {Error} If login fails (invalid credentials, user not found, JWT error).
 */
const loginUser = async (credentials) => {
    const { email, password } = credentials;

    if (!email || !password) {
        throw new Error('Email and password are required for login.');
    }

    // 1. Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        logger.warn(`Login attempt failed: User not found for email ${email}`);
        throw new Error('Invalid email or password.'); // Use generic error for security
    }

    // 2. Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        logger.warn(`Login attempt failed: Invalid password for email ${email}`);
        throw new Error('Invalid email or password.'); // Use generic error
    }

    // 3. Generate JWT token including user ID, email, role, and companyId
    const payload = {
        userId: user.id,        // Standard claim often 'sub' (subject) or custom
        email: user.email,
        role: user.role,        // Include user's role
        companyId: user.companyId // Include user's company ID
        // Add 'name: user.name' if useful to have immediately on frontend
    };

    logger.info(`Generating JWT for user: ${user.email}, role: ${user.role}, companyId: ${user.companyId}`);

    try {
        // Sign the token using the secret and expiration defined in config
        const token = jwt.sign(
            payload,
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
        return token; // Return only the access token string
    } catch (error) {
        logger.error('Error signing JWT:', error);
        // Throw error if token generation fails
        throw new Error('Login failed during token generation.');
    }
};

// Export the service functions
const AuthService = {
    registerUser,
    loginUser,
};

export default AuthService;