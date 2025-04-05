// backend/src/middleware/validationMiddleware.js
import logger from '../utils/logger.js';

/**
 * Higher-order function to create an Express middleware for validating
 * request data (body, params, query) against a Zod schema.
 *
 * Assumes the schema passed has properties like 'body', 'params', 'query'
 * matching the parts of the request to validate.
 *
 * @param {z.ZodObject<any>} schema - The Zod schema to validate against.
 * @returns Express middleware function
 */
export const validate = (schema) => async (req, res, next) => {
    try {
        // Create an object with parts of the request to validate based on schema keys
        const requestDataToValidate = {};
        if (schema.shape.body) {
            requestDataToValidate.body = req.body;
        }
        if (schema.shape.params) {
            requestDataToValidate.params = req.params;
        }
        if (schema.shape.query) {
            requestDataToValidate.query = req.query;
        }

        // Validate the relevant parts of the request
        const validationResult = await schema.safeParseAsync(requestDataToValidate);

        if (!validationResult.success) {
            // Format errors for a user-friendly response
            // Use flatten() for a simpler structure { fieldErrors: ..., formErrors: ... }
            const formattedErrors = validationResult.error.flatten().fieldErrors;
            logger.warn('Request validation failed:', formattedErrors);
            return res.status(400).json({
                message: "Validation failed",
                errors: formattedErrors,
            });
        }

        // --- IMPORTANT: Overwrite request parts with validated (and potentially transformed) data ---
        // This ensures controllers/services get type-safe, validated data.
        if (validationResult.data.body) {
            req.body = validationResult.data.body;
        }
        if (validationResult.data.params) {
            req.params = validationResult.data.params;
        }
        if (validationResult.data.query) {
            req.query = validationResult.data.query;
        }
        // --- End Overwrite ---

        // Proceed to the next middleware or route handler
        return next();

    } catch (error) {
         // Catch unexpected errors during validation itself
         logger.error('Error in validation middleware:', error);
         // Pass to the global error handler
         next(error);
    }
};