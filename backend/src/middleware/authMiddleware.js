// backend/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from '../utils/logger.js';
// Optional: Import prisma if you need to check if the user still exists in DB on every request
// import prisma from '../config/db.js';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1. Check if Authorization header exists and is in 'Bearer <token>' format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Authentication attempt failed: No Bearer token provided.');
        // Use 401 Unauthorized for missing credentials
        return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    // 2. Extract the token
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verify the token
        const decodedPayload = jwt.verify(token, config.jwt.secret);

        // Optional: Check if user still exists in DB (more secure, but adds DB lookup per request)
        /*
        const user = await prisma.user.findUnique({ where: { id: decodedPayload.userId } });
        if (!user) {
            logger.warn(`Authentication failed: User ID ${decodedPayload.userId} from token not found.`);
            return res.status(401).json({ message: 'Authentication failed: User not found.' });
        }
        */

        // 4. Attach user information to the request object
        // We typically attach the payload which contains id, email etc.
        // Avoid attaching sensitive info like password hash if it were ever in the payload
        req.user = decodedPayload; // Now req.user.userId, req.user.email are available

        // 5. Call the next middleware or route handler
        next();

    } catch (error) {
        logger.error('JWT Verification Error:', error.name, error.message);
        // Handle specific JWT errors
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Authentication failed: Token expired.' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            // Covers invalid signature, malformed token etc.
            return res.status(401).json({ message: 'Authentication failed: Invalid token.' });
        }
        // Pass other unexpected errors to the global error handler
        next(error);
    }
};

export default authMiddleware;